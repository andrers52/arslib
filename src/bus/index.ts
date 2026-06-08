// ── envelope ──
export {
    MessageKind,
    EnvelopeValidationError,
    EnvelopeValidationErrorKind,
    EnvelopeValidationErrorClass,
    BusEnvelope,
    ENVELOPE_HEADER_SIZE,
    MAX_TOPIC_LEN,
    MAX_PAYLOAD_LEN,
    encodeBusEnvelope,
    decodeBusEnvelope,
    envelopeToJson,
    jsonToEnvelope,
} from "./envelope.js";
export type { BusEnvelopeJson } from "./envelope.js";

// ── topic ──
export { TopicRegistry } from "./topic.js";

// ── context ──
export { RoutingTable, BusContext, QueryError } from "./context.js";
export type { SendResult, RouteResult } from "./context.js";

// ── module ──
export { ModuleId, ModuleState, moduleStateCanTransitionTo, ModuleError, ModuleErrorClass } from "./module.js";
export type { ForgeModule } from "./module.js";

// ── observability ──
export { BusEvent } from "./observability.js";
export type { ObservabilitySink } from "./observability.js";

// ── transport adapter ──
export type { BusTransportAdapter, BusChannelMode } from "./transport-adapter.js";
