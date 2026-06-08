/**
 * Actor identity — a u32 opaque handle used by the bus routing table
 * and mailbox registry.  Zero is reserved for the host/oracle.
 */
export type ActorId = number;

/**
 * Monotonic u32 allocator for actor identities.
 *
 * Wraps via `wrapping_add` at u32::MAX (4_294_967_295).  The caller is
 * responsible for ensuring the 32-bit space is not exhausted in practice.
 */
export class ActorIdAllocator {
    private _next: number;

    constructor(start = 1) {
        this._next = (start & 0xffffffff) >>> 0;
    }

    /** Return the next actor ID. */
    next(): ActorId {
        const id = this._next;
        this._next = ((this._next + 1) & 0xffffffff) >>> 0;
        return id;
    }

    /** Peek at the next ID without consuming it. */
    peek(): ActorId {
        return this._next >>> 0;
    }

    /** Reset the allocator (dangerous — only safe when no IDs are in use). */
    reset(start = 1): void {
        this._next = (start & 0xffffffff) >>> 0;
    }
}
