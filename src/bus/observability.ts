/**
 * Observability event types and sink trait for the bus.
 *
 * Mirrors `ars_bus::observability` exactly.
 * The bus emits structured events to an `ObservabilitySink` for debugging,
 * tracing, and visualization. The sink is optional — if none is configured,
 * events are silently discarded.
 */

import type { ModuleId } from "./module.js";

/** Bus observability events. */
export type BusEvent =
    | { kind: "ModuleRegistered"; moduleId: ModuleId }
    | { kind: "ModuleUnregistered"; moduleId: ModuleId }
    | { kind: "MessageEnqueued"; messageId: number }
    | { kind: "MessageDispatched"; messageId: number }
    | { kind: "MessagePublished"; messageId: number; topic: string; deliveries: number }
    | { kind: "QuerySent"; messageId: number; target: number }
    | { kind: "ReplyReceived"; messageId: number; correlationId: number }
    | { kind: "QueryTimeout"; correlationId: number };

export namespace BusEvent {
    export function toString(event: BusEvent): string {
        switch (event.kind) {
            case "ModuleRegistered":
                return `module registered: ${event.moduleId.toString()}`;
            case "ModuleUnregistered":
                return `module unregistered: ${event.moduleId.toString()}`;
            case "MessageEnqueued":
                return `message enqueued: ${event.messageId}`;
            case "MessageDispatched":
                return `message dispatched: ${event.messageId}`;
            case "MessagePublished":
                return `message published: ${event.messageId} -> ${event.topic} (${event.deliveries} deliveries)`;
            case "QuerySent":
                return `query sent: ${event.messageId} -> ${event.target}`;
            case "ReplyReceived":
                return `reply received: ${event.messageId} (correlation=${event.correlationId})`;
            case "QueryTimeout":
                return `query timeout: correlation=${event.correlationId}`;
        }
    }
}

/** Trait for receiving bus observability events. */
export interface ObservabilitySink {
    /** Called when the bus emits an event. */
    onEvent(event: BusEvent): void;
}
