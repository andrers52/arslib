/**
 * ForgeModule interface — lifecycle contract for bus-connected modules.
 *
 * Mirrors `ars_bus::ForgeModule<P>` exactly.  A `ForgeModule` is the
 * user-facing unit that the bus routes envelopes to.  It has identity,
 * lifecycle (init / start / stop), health reporting, and a message handler.
 */

import type { ActorId } from "../actor/actor-id.js";
import type { BusEnvelope } from "./envelope.js";
import type { BusContext } from "./context.js";

/** Module identity wrapper — prevents accidental mixing of raw u32s. */
export class ModuleId {
    readonly value: number;

    constructor(value: number) {
        this.value = value & 0xffffffff;
    }

    toString(): string {
        return String(this.value);
    }

    equals(other: ModuleId): boolean {
        return this.value === other.value;
    }
}

/** Lifecycle state of a module. */
export enum ModuleState {
    Created = 0,
    Initialized = 1,
    Running = 2,
    Stopped = 3,
    Failed = 4,
}

export namespace ModuleState {
    export function toString(state: ModuleState): string {
        switch (state) {
            case ModuleState.Created: return "Created";
            case ModuleState.Initialized: return "Initialized";
            case ModuleState.Running: return "Running";
            case ModuleState.Stopped: return "Stopped";
            case ModuleState.Failed: return "Failed";
            default: return `Unknown(${state})`;
        }
    }
}

/** Instance method for transition checking — mirrors Rust `ModuleState::can_transition_to`. */
export function moduleStateCanTransitionTo(from: ModuleState, to: ModuleState): boolean {
    const valid: Record<ModuleState, ModuleState[]> = {
        [ModuleState.Created]: [ModuleState.Initialized],
        [ModuleState.Initialized]: [ModuleState.Running, ModuleState.Stopped],
        [ModuleState.Running]: [ModuleState.Stopped, ModuleState.Failed],
        [ModuleState.Stopped]: [],
        [ModuleState.Failed]: [],
    };
    return valid[from]?.includes(to) ?? false;
}

/** Structured error for module lifecycle operations — mirrors `ars_bus::ModuleError`. */
export type ModuleError =
    | { kind: "InitFailed"; reason: string }
    | { kind: "StartFailed"; reason: string }
    | { kind: "StopFailed"; reason: string }
    | { kind: "InvalidTransition"; from: ModuleState; to: ModuleState };

export namespace ModuleError {
    export function toString(err: ModuleError): string {
        switch (err.kind) {
            case "InitFailed": return `module init failed: ${err.reason}`;
            case "StartFailed": return `module start failed: ${err.reason}`;
            case "StopFailed": return `module stop failed: ${err.reason}`;
            case "InvalidTransition": return `invalid state transition: ${ModuleState.toString(err.from)} -> ${ModuleState.toString(err.to)}`;
        }
    }
}

/** Throwable wrapper for ModuleError — extends Error for compatibility. */
export class ModuleErrorClass extends Error {
    readonly error: ModuleError;

    constructor(error: ModuleError) {
        super(ModuleError.toString(error));
        this.error = error;
        this.name = "ModuleError";
    }

    toStructured(): ModuleError {
        return this.error;
    }
}

/**
 * Forge module interface.
 *
 * Every bus-connected module implements this contract.  The host runtime
 * calls `init()` → `start()` → `handleMessage()` in a loop → `stop()`.
 */
export interface ForgeModule<P> {
    /** Unique module identity. */
    id(): ModuleId;

    /** Human-readable name for observability. */
    name(): string;

    /** One-time setup (allocate resources, subscribe to topics). */
    init(): void | Promise<void>;

    /** Begin processing messages. */
    start(): void | Promise<void>;

    /** Graceful shutdown. */
    stop(): void | Promise<void>;

    /** Current lifecycle state. */
    state(): ModuleState;

    /** Health check — `true` if the module is responsive. */
    isHealthy(): boolean;

    /** Topics this module wishes to subscribe to after init. */
    subscriptions(): string[];

    /**
     * Process an incoming envelope.
     *
     * The module may mutate `ctx` (publish replies, send to other modules)
     * but must not block.
     */
    handleMessage(envelope: BusEnvelope<P>, ctx: BusContext<P>): void | Promise<void>;
}
