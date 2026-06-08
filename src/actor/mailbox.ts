/**
 * Mailbox implementations for the actor runtime.
 *
 * Two variants are provided:
 * - `InMemoryMailbox<T>` — a simple growable-array mailbox (mirrors Rust's
 *   `ars_actor::Mailbox<M>`).  Used by `BusContext` for in-process routing.
 * - `SabMailbox` — a `SharedArrayBuffer` ring-buffer mailbox for SPSC
 *   wait-free communication between a bus Worker and an actor Worker.
 */

// ── In-memory mailbox (mirrors ars_actor::Mailbox<M>) ────────────────────

/**
 * Simple growable-array mailbox.  push / take_all / drain semantics
 * match the Rust `Mailbox<M>` API exactly.
 */
export class InMemoryMailbox<T> {
    private _messages: T[] = [];

    constructor(capacity = 0) {
        if (capacity > 0) {
            this._messages = new Array<T>(capacity);
            this._messages.length = 0;
        }
    }

    push(msg: T): void {
        this._messages.push(msg);
    }

    drain(): IterableIterator<T> {
        const out = this._messages.values();
        this._messages = [];
        return out;
    }

    *[Symbol.iterator](): Generator<T> {
        yield* this._messages;
    }

    len(): number {
        return this._messages.length;
    }

    isEmpty(): boolean {
        return this._messages.length === 0;
    }

    clear(): void {
        this._messages.length = 0;
    }

    takeAll(): T[] {
        const out = this._messages;
        this._messages = [];
        return out;
    }

    peek(): T | undefined {
        return this._messages[0];
    }
}

// ── SAB ring-buffer mailbox (SPSC, fixed-slot) ───────────────────────────

/** Byte offsets within the SAB control region. */
const OFF_WRITE_HEAD = 0;   // u32
const OFF_READ_HEAD = 4;    // u32
const OFF_CAPACITY = 8;     // u32
const OFF_SLOT_SIZE = 12;   // u32
const CONTROL_SIZE = 16;    // bytes before data region

/** Each slot begins with a 4-byte little-endian length prefix. */
const LENGTH_PREFIX_SIZE = 4;

/**
 * Fixed-size SAB ring-buffer mailbox for single-producer / single-consumer
 * communication between Workers.
 *
 * The producer (bus Worker) calls `push()` to write envelopes.
 * The consumer (actor Worker) calls `pop()` or `wait()` to read them.
 *
 * Layout (bytes):
 *   [0..3]   write_head  (Atomics, u32)
 *   [4..7]   read_head   (Atomics, u32)
 *   [8..11]  capacity    (constant, u32)
 *   [12..15] slot_size   (constant, u32)
 *   [16..]   data        (capacity * slot_size bytes)
 */
export class SabMailbox {
    private _sab: SharedArrayBuffer;
    private _view: Uint8Array;
    private _capacity: number;
    private _slotSize: number;
    private _dataOffset: number;

    /**
     * Create a mailbox backed by an existing SAB, or allocate a fresh one.
     *
     * @param sab          Existing SAB, or omitted to allocate.
     * @param slotCount    Number of ring-buffer slots.
     * @param maxEnvelopeBytes Maximum payload bytes per envelope.
     */
    constructor(
        sab?: SharedArrayBuffer,
        slotCount = 64,
        maxEnvelopeBytes = 1024,
    ) {
        const slotSize = LENGTH_PREFIX_SIZE + maxEnvelopeBytes;
        const byteSize = CONTROL_SIZE + slotCount * slotSize;
        this._sab = sab ?? new SharedArrayBuffer(byteSize);
        this._view = new Uint8Array(this._sab);
        this._capacity = slotCount;
        this._slotSize = slotSize;
        this._dataOffset = CONTROL_SIZE;

        if (!sab) {
            // Initialise control words on a fresh buffer.
            const dv = new DataView(this._sab);
            dv.setUint32(OFF_CAPACITY, slotCount, true);
            dv.setUint32(OFF_SLOT_SIZE, slotSize, true);
        }
    }

    /** The underlying SharedArrayBuffer (pass to the consumer Worker). */
    get sab(): SharedArrayBuffer {
        return this._sab;
    }

    get capacity(): number {
        return this._capacity;
    }

    get slotSize(): number {
        return this._slotSize;
    }

    /** Atomically read the write head (producer position). */
    private _writeHead(): number {
        return Atomics.load(new Uint32Array(this._sab, OFF_WRITE_HEAD, 1), 0);
    }

    /** Atomically read the read head (consumer position). */
    private _readHead(): number {
        return Atomics.load(new Uint32Array(this._sab, OFF_READ_HEAD, 1), 0);
    }

    /** Atomically advance the write head, returning the old index. */
    private _advanceWrite(): number {
        const arr = new Uint32Array(this._sab, OFF_WRITE_HEAD, 1);
        return Atomics.add(arr, 0, 1);
    }

    /** Atomically advance the read head, returning the old index. */
    private _advanceRead(): number {
        const arr = new Uint32Array(this._sab, OFF_READ_HEAD, 1);
        return Atomics.add(arr, 0, 1);
    }

    /** Number of items currently in the buffer. */
    size(): number {
        return this._writeHead() - this._readHead();
    }

    /** Whether the buffer is full. */
    isFull(): boolean {
        return this.size() >= this._capacity;
    }

    /** Whether the buffer is empty. */
    isEmpty(): boolean {
        return this.size() === 0;
    }

    /**
     * Write an envelope into the ring buffer.
     *
     * @returns `true` if written, `false` if the buffer is full.
     */
    push(envelope: Uint8Array): boolean {
        const wh = this._writeHead();
        const rh = this._readHead();
        if (wh - rh >= this._capacity) {
            return false; // full
        }

        const slotIdx = wh % this._capacity;
        const slotOffset = this._dataOffset + slotIdx * this._slotSize;

        // Write length prefix.
        const len = Math.min(envelope.length, this._slotSize - LENGTH_PREFIX_SIZE);
        const dv = new DataView(this._sab, slotOffset, LENGTH_PREFIX_SIZE);
        dv.setUint32(0, len, true);

        // Write payload.
        this._view.set(envelope.subarray(0, len), slotOffset + LENGTH_PREFIX_SIZE);

        // Advance write head — makes the slot visible to the consumer.
        this._advanceWrite();

        // Wake any waiter on the read head.
        Atomics.notify(new Int32Array(this._sab, OFF_READ_HEAD, 1), 0, 1);

        return true;
    }

    /**
     * Read the next envelope from the ring buffer.
     *
     * @returns The envelope bytes, or `null` if empty.
     */
    pop(): Uint8Array | null {
        const rh = this._readHead();
        const wh = this._writeHead();
        if (rh >= wh) {
            return null; // empty
        }

        const slotIdx = rh % this._capacity;
        const slotOffset = this._dataOffset + slotIdx * this._slotSize;

        // Read length prefix.
        const dv = new DataView(this._sab, slotOffset, LENGTH_PREFIX_SIZE);
        const len = dv.getUint32(0, true);

        // Copy payload out.
        const out = new Uint8Array(this._view.buffer, slotOffset + LENGTH_PREFIX_SIZE, len);

        // Advance read head.
        this._advanceRead();

        return new Uint8Array(out); // detach copy
    }

    /**
     * Block the calling thread until an envelope is available or the
     * timeout expires.
     *
     * Uses `Atomics.wait()` — only valid inside a Worker thread.
     *
     * @param timeoutMs  Max milliseconds to wait.  `-1` = indefinite.
     * @returns `true` if an item became available, `false` on timeout.
     */
    wait(timeoutMs = -1): boolean {
        const arr = new Int32Array(this._sab, OFF_READ_HEAD, 1);
        const expected = arr[0];

        if (timeoutMs < 0) {
            Atomics.wait(arr, 0, expected);
            return true;
        }
        const result = Atomics.wait(arr, 0, expected, timeoutMs);
        return result !== "timed-out";
    }

    /** Wake a waiter blocked in `wait()`. */
    notify(): number {
        return Atomics.notify(new Int32Array(this._sab, OFF_READ_HEAD, 1), 0, 1);
    }

    /** Byte size required for a mailbox with the given parameters. */
    static requiredByteSize(slotCount: number, maxEnvelopeBytes: number): number {
        return CONTROL_SIZE + slotCount * (LENGTH_PREFIX_SIZE + maxEnvelopeBytes);
    }
}
