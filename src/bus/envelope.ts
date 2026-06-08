/**
 * Bus envelope — binary codec, `MessageKind`, and JSON fallback shape.
 *
 * Mirrors `ars_bus::envelope` exactly:
 * - `MessageKind` with the six variants
 * - `EnvelopeValidationError` with validation rules
 * - `BusEnvelope<T>` generic envelope with factory methods
 * - Binary encode / decode for the 24-byte fixed-header layout
 * - `BusEnvelopeJson` for JSON transport (WebRTC / cross-origin boundaries)
 */

// ── MessageKind ──────────────────────────────────────────────────────────

export enum MessageKind {
    Command = 0,
    Event = 1,
    Query = 2,
    Reply = 3,
    Error = 4,
    Control = 5,
}

export namespace MessageKind {
    export function expectsReply(kind: MessageKind): boolean {
        return kind === MessageKind.Query;
    }

    /**
     * Whether this kind should be fanned out to topic subscribers.
     * Event and Control are broadcast kinds.
     */
    export function isBroadcast(kind: MessageKind): boolean {
        return kind === MessageKind.Event || kind === MessageKind.Control;
    }

    /**
     * Whether this kind requires a `target` (point-to-point routing).
     * Command, Query, Reply, and Error require a target.
     */
    export function requiresTarget(kind: MessageKind): boolean {
        return (
            kind === MessageKind.Command ||
            kind === MessageKind.Query ||
            kind === MessageKind.Reply ||
            kind === MessageKind.Error
        );
    }

    /**
     * Whether this kind requires a `topic` (broadcast routing).
     * Event and Control require a topic.
     */
    export function requiresTopic(kind: MessageKind): boolean {
        return kind === MessageKind.Event || kind === MessageKind.Control;
    }

    export function toString(kind: MessageKind): string {
        switch (kind) {
            case MessageKind.Command: return "Command";
            case MessageKind.Event: return "Event";
            case MessageKind.Query: return "Query";
            case MessageKind.Reply: return "Reply";
            case MessageKind.Error: return "Error";
            case MessageKind.Control: return "Control";
            default: return `Unknown(${kind})`;
        }
    }
}

// ── EnvelopeValidationError ──────────────────────────────────────────────

/** Discriminator for structured validation error variants. */
export enum EnvelopeValidationErrorKind {
    TargetRequired = 0,
    TopicRequired = 1,
    BroadcastWithTarget = 2,
    PointToPointWithTopic = 3,
}

/** Structured validation error — mirrors `ars_bus::EnvelopeValidationError`. */
export type EnvelopeValidationError =
    | { kind: EnvelopeValidationErrorKind.TargetRequired; messageKind: MessageKind }
    | { kind: EnvelopeValidationErrorKind.TopicRequired; messageKind: MessageKind }
    | { kind: EnvelopeValidationErrorKind.BroadcastWithTarget; messageKind: MessageKind }
    | { kind: EnvelopeValidationErrorKind.PointToPointWithTopic; messageKind: MessageKind };

export namespace EnvelopeValidationError {
    export function create(
        kind: EnvelopeValidationErrorKind,
        messageKind: MessageKind,
    ): EnvelopeValidationError {
        return { kind, messageKind };
    }

    export function toString(err: EnvelopeValidationError): string {
        switch (err.kind) {
            case EnvelopeValidationErrorKind.TargetRequired:
                return `${MessageKind.toString(err.messageKind)} message requires a target module`;
            case EnvelopeValidationErrorKind.TopicRequired:
                return `${MessageKind.toString(err.messageKind)} message requires a topic`;
            case EnvelopeValidationErrorKind.BroadcastWithTarget:
                return `${MessageKind.toString(err.messageKind)} message should not have a target`;
            case EnvelopeValidationErrorKind.PointToPointWithTopic:
                return `${MessageKind.toString(err.messageKind)} message should not have a topic`;
        }
    }
}

/** Thrown when envelope validation fails. Mirrors the structured error but is throwable. */
export class EnvelopeValidationErrorClass extends Error {
    readonly errorKind: EnvelopeValidationErrorKind;
    readonly messageKind: MessageKind;

    constructor(kind: EnvelopeValidationErrorKind, messageKind: MessageKind) {
        super(EnvelopeValidationError.toString({ kind, messageKind }));
        this.errorKind = kind;
        this.messageKind = messageKind;
        this.name = "EnvelopeValidationError";
    }

    toStructured(): EnvelopeValidationError {
        return { kind: this.errorKind, messageKind: this.messageKind };
    }
}

// ── BusEnvelope<T> ───────────────────────────────────────────────────────

/**
 * Generic bus envelope.  `T` is the payload type — application-defined.
 *
 * Matches `ars_bus::BusEnvelope<M>` field-for-field.
 */
export class BusEnvelope<T> {
    messageId: number; // u64, but JS numbers are safe up to 2^53
    kind: MessageKind;
    sender: number; // u32
    target: number | null; // u32, null = broadcast / not applicable
    topic: string | null;
    correlationId: number | null; // u64
    payload: T;

    constructor(
        messageId: number,
        kind: MessageKind,
        sender: number,
        payload: T,
    ) {
        this.messageId = messageId;
        this.kind = kind;
        this.sender = sender;
        this.target = null;
        this.topic = null;
        this.correlationId = null;
        this.payload = payload;
    }

    // ── Factory constructors ─────────────────────────────────────────────

    static new<T>(messageId: number, sender: number, payload: T): BusEnvelope<T> {
        return new BusEnvelope(messageId, MessageKind.Control, sender, payload);
    }

    static command<T>(messageId: number, sender: number, target: number, payload: T): BusEnvelope<T> {
        const e = new BusEnvelope(messageId, MessageKind.Command, sender, payload);
        e.target = target;
        return e;
    }

    static event<T>(messageId: number, sender: number, topic: string, payload: T): BusEnvelope<T> {
        const e = new BusEnvelope(messageId, MessageKind.Event, sender, payload);
        e.topic = topic;
        return e;
    }

    static query<T>(messageId: number, sender: number, target: number, payload: T): BusEnvelope<T> {
        const e = new BusEnvelope(messageId, MessageKind.Query, sender, payload);
        e.target = target;
        return e;
    }

    static reply<T>(
        messageId: number,
        sender: number,
        target: number,
        correlationId: number,
        payload: T,
    ): BusEnvelope<T> {
        const e = new BusEnvelope(messageId, MessageKind.Reply, sender, payload);
        e.target = target;
        e.correlationId = correlationId;
        return e;
    }

    static error<T>(
        messageId: number,
        sender: number,
        target: number,
        correlationId: number,
        payload: T,
    ): BusEnvelope<T> {
        const e = new BusEnvelope(messageId, MessageKind.Error, sender, payload);
        e.target = target;
        e.correlationId = correlationId;
        return e;
    }

    // ── Fluent setters ───────────────────────────────────────────────────

    withCorrelationId(id: number): this {
        this.correlationId = id;
        return this;
    }

    withTopic(topic: string): this {
        this.topic = topic;
        return this;
    }

    withTarget(target: number): this {
        this.target = target;
        return this;
    }

    // ── Mapping ──────────────────────────────────────────────────────────

    mapPayload<U>(f: (payload: T) => U): BusEnvelope<U> {
        const mapped = new BusEnvelope<U>(this.messageId, this.kind, this.sender, f(this.payload));
        mapped.target = this.target;
        mapped.topic = this.topic;
        mapped.correlationId = this.correlationId;
        return mapped;
    }

    // ── Validation ───────────────────────────────────────────────────────

    /**
     * Validate that this envelope's routing fields are consistent with its
     * [`MessageKind`].
     *
     * Returns a Result-style object. Use `validateOrThrow()` if you prefer
     * exceptions.
     */
    validate(): { ok: true } | { ok: false; error: EnvelopeValidationError } {
        const mk = this.kind;

        if (MessageKind.requiresTarget(mk) && this.target === null) {
            return { ok: false, error: { kind: EnvelopeValidationErrorKind.TargetRequired, messageKind: mk } };
        }
        if (MessageKind.requiresTopic(mk) && this.topic === null) {
            return { ok: false, error: { kind: EnvelopeValidationErrorKind.TopicRequired, messageKind: mk } };
        }
        if (MessageKind.isBroadcast(mk) && this.target !== null) {
            return { ok: false, error: { kind: EnvelopeValidationErrorKind.BroadcastWithTarget, messageKind: mk } };
        }
        if (!MessageKind.isBroadcast(mk) && this.topic !== null && !MessageKind.requiresTopic(mk)) {
            return { ok: false, error: { kind: EnvelopeValidationErrorKind.PointToPointWithTopic, messageKind: mk } };
        }
        return { ok: true };
    }

    /**
     * Validate and throw on failure. Convenience wrapper around `validate()`.
     */
    validateOrThrow(): void {
        const result = this.validate();
        if (!result.ok) {
            throw new EnvelopeValidationErrorClass(result.error.kind, result.error.messageKind);
        }
    }
}

// ── Binary layout constants ──────────────────────────────────────────────

/** Fixed header size in bytes. */
export const ENVELOPE_HEADER_SIZE = 24;

/** Maximum topic length (u8). */
export const MAX_TOPIC_LEN = 255;

/** Maximum payload length (u16). */
export const MAX_PAYLOAD_LEN = 65535;

/*
 * Binary layout (little-endian):
 *
 * Offset  Size  Field
 * 0       8     message_id      (u64)
 * 8       4     sender_id       (u32)
 * 12      4     target_id       (u32, 0 = none)
 * 16      4     correlation_id  (u32, 0 = none)
 * 20      1     kind            (u8)
 * 21      1     topic_len       (u8)
 * 22      2     payload_len     (u16)
 * 24      N     topic           (UTF-8, topic_len bytes)
 * 24+N    M     payload         (payload_len bytes)
 */

// ── Binary encode / decode ───────────────────────────────────────────────

/**
 * Encode a `BusEnvelope<Uint8Array>` into a packed binary `ArrayBuffer`.
 *
 * The payload is already raw bytes; for structured payloads the caller
 * must serialise first (e.g. JSON → `new TextEncoder().encode(json)`).
 */
export function encodeBusEnvelope(envelope: BusEnvelope<Uint8Array>): ArrayBuffer {
    const topicBytes = envelope.topic !== null
        ? new TextEncoder().encode(envelope.topic)
        : new Uint8Array(0);
    const topicLen = topicBytes.length;
    const payloadLen = envelope.payload.length;

    if (topicLen > MAX_TOPIC_LEN) {
        throw new Error(`Topic too long: ${topicLen} > ${MAX_TOPIC_LEN}`);
    }
    if (payloadLen > MAX_PAYLOAD_LEN) {
        throw new Error(`Payload too long: ${payloadLen} > ${MAX_PAYLOAD_LEN}`);
    }

    const totalSize = ENVELOPE_HEADER_SIZE + topicLen + payloadLen;
    const buf = new ArrayBuffer(totalSize);
    const dv = new DataView(buf);
    const bytes = new Uint8Array(buf);

    dv.setBigUint64(0, BigInt.asUintN(64, BigInt(envelope.messageId)), true);
    dv.setUint32(8, envelope.sender, true);
    dv.setUint32(12, envelope.target ?? 0, true);
    dv.setUint32(16, envelope.correlationId ?? 0, true);
    dv.setUint8(20, envelope.kind);
    dv.setUint8(21, topicLen);
    dv.setUint16(22, payloadLen, true);

    bytes.set(topicBytes, ENVELOPE_HEADER_SIZE);
    bytes.set(envelope.payload, ENVELOPE_HEADER_SIZE + topicLen);

    return buf;
}

/**
 * Decode a packed binary `ArrayBuffer` into a `BusEnvelope<Uint8Array>`.
 */
export function decodeBusEnvelope(buffer: ArrayBuffer | ArrayBufferView): BusEnvelope<Uint8Array> {
    const arr = buffer instanceof ArrayBuffer
        ? new Uint8Array(buffer)
        : new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const dv = new DataView(arr.buffer, arr.byteOffset, arr.byteLength);

    if (arr.byteLength < ENVELOPE_HEADER_SIZE) {
        throw new Error(`Buffer too small for envelope header: ${arr.byteLength}`);
    }

    const messageId = Number(dv.getBigUint64(0, true));
    const sender = dv.getUint32(8, true);
    const targetRaw = dv.getUint32(12, true);
    const correlationRaw = dv.getUint32(16, true);
    const kind = dv.getUint8(20) as MessageKind;
    const topicLen = dv.getUint8(21);
    const payloadLen = dv.getUint16(22, true);

    const totalSize = ENVELOPE_HEADER_SIZE + topicLen + payloadLen;
    if (arr.byteLength < totalSize) {
        throw new Error(`Buffer too small: expected ${totalSize}, got ${arr.byteLength}`);
    }

    const topic = topicLen > 0
        ? new TextDecoder().decode(arr.subarray(ENVELOPE_HEADER_SIZE, ENVELOPE_HEADER_SIZE + topicLen))
        : null;

    const payload = arr.slice(
        ENVELOPE_HEADER_SIZE + topicLen,
        ENVELOPE_HEADER_SIZE + topicLen + payloadLen,
    );

    const envelope = new BusEnvelope<Uint8Array>(messageId, kind, sender, payload);
    envelope.target = targetRaw !== 0 ? targetRaw : null;
    envelope.correlationId = correlationRaw !== 0 ? correlationRaw : null;
    envelope.topic = topic;

    return envelope;
}

// ── JSON fallback shape ──────────────────────────────────────────────────

/**
 * JSON-serialisable envelope shape used at WebRTC / cross-origin boundaries
 * where binary framing is unavailable.
 *
 * Extracted from `brainiac-engine/common/ChannelProtocol.ts` as part of
 * Integration 0.  This is the wire format; the in-process format is the
 * binary `BusEnvelope<Uint8Array>` above.
 */
export interface BusEnvelopeJson {
    /** Numeric kind matching `MessageKind`. */
    kind: MessageKind;
    /** Topic string (e.g. `"nexus.tick"`). */
    topic: string;
    /** Sender actor ID. */
    sender: string;
    /** Optional correlation ID for request/reply pairing. */
    correlation_id?: number;
    /** Application payload — any JSON-serialisable value. */
    payload: unknown;
}

/**
 * Convert a binary `BusEnvelope<Uint8Array>` to its JSON fallback shape.
 *
 * The payload is decoded as UTF-8 JSON; if decoding fails it is returned
 * as a base64 string.
 */
export function envelopeToJson(envelope: BusEnvelope<Uint8Array>): BusEnvelopeJson {
    let payload: unknown;
    try {
        payload = JSON.parse(new TextDecoder().decode(envelope.payload));
    } catch {
        payload = {
            __binary: Array.from(envelope.payload),
            __encoding: "uint8-array",
        };
    }

    return {
        kind: envelope.kind,
        topic: envelope.topic ?? "",
        sender: String(envelope.sender),
        correlation_id: envelope.correlationId ?? undefined,
        payload,
    };
}

/**
 * Convert a `BusEnvelopeJson` back to a binary `BusEnvelope<Uint8Array>`.
 *
 * The payload is JSON-stringified to bytes.
 */
export function jsonToEnvelope(json: BusEnvelopeJson): BusEnvelope<Uint8Array> {
    const payloadBytes = new TextEncoder().encode(JSON.stringify(json.payload));
    const envelope = new BusEnvelope<Uint8Array>(
        0, // messageId must be assigned by the caller / context
        json.kind,
        Number(json.sender),
        payloadBytes,
    );
    envelope.topic = json.topic;
    envelope.correlationId = json.correlation_id ?? null;
    return envelope;
}
