/**
 * Actor interface and Worker harness.
 *
 * Mirrors `ars_actor` runtime primitives and `ars_bus::ForgeModule` for
 * TypeScript consumers.  An actor is a unit of concurrency that runs in
 * its own Worker and communicates exclusively through its SAB mailbox.
 */

import type { ActorId } from "./actor-id.js";
import type { BusEnvelope } from "../bus/envelope.js";

/** Lifecycle state of an actor / module. */
export enum ActorState {
    Created = 0,
    Initialized = 1,
    Running = 2,
    Stopped = 3,
    Failed = 4,
}

/** Health signal emitted by the runtime supervisor. */
export enum HealthSignal {
    Alive = 0,
    Unresponsive = 1,
    Gone = 2,
}

/** Minimal actor interface — every actor must implement this. */
export interface Actor {
    readonly id: ActorId;
    readonly name: string;

    init(): void | Promise<void>;
    start(): void | Promise<void>;
    stop(): void | Promise<void>;
    handleMessage(envelope: BusEnvelope<unknown>): void;

    readonly state: ActorState;
    isHealthy(): boolean;
}

/** Message sent from the host to a Worker to control its lifecycle. */
export interface WorkerControlMessage {
    readonly type: "init" | "start" | "stop" | "envelope";
    readonly payload?: Uint8Array;
    readonly sab?: SharedArrayBuffer;
}

/** Message sent from a Worker back to the host. */
export interface WorkerReplyMessage {
    readonly type: "ready" | "error" | "envelope";
    readonly error?: string;
    readonly payload?: Uint8Array;
}

/**
 * Harness that runs an `Actor` inside a dedicated Web Worker.
 *
 * The harness creates the Worker, passes it a `SharedArrayBuffer` mailbox,
 * and bridges lifecycle commands (`init` / `start` / `stop`) and envelope
 * traffic between the host and the actor.
 *
 * Usage:
 * ```typescript
 * const harness = new WorkerActorHarness(
 *     () => new Worker(new URL("./my-actor.ts", import.meta.url)),
 *     mailboxSab,
 * );
 * await harness.init();
 * await harness.start();
 * // Envelopes written to the SAB mailbox are picked up by the Worker.
 * ```
 */
export class WorkerActorHarness {
    private _worker: Worker | null = null;
    private _factory: () => Worker;
    private _mailboxSab: SharedArrayBuffer;
    private _state: ActorState = ActorState.Created;
    private _error: string | null = null;

    constructor(workerFactory: () => Worker, mailboxSab: SharedArrayBuffer) {
        this._factory = workerFactory;
        this._mailboxSab = mailboxSab;
    }

    get state(): ActorState {
        return this._state;
    }

    get error(): string | null {
        return this._error;
    }

    isHealthy(): boolean {
        return this._state === ActorState.Running && this._error === null;
    }

    /** Spawn the Worker and send it the mailbox SAB. */
    async init(): Promise<void> {
        if (this._state !== ActorState.Created) {
            throw new Error(`Cannot init actor in state ${ActorState[this._state]}`);
        }
        this._worker = this._factory();
        this._worker.postMessage({ type: "init", sab: this._mailboxSab }, [this._mailboxSab]);

        await this._waitForReply("ready");
        this._state = ActorState.Initialized;
    }

    /** Tell the Worker to start its event loop. */
    async start(): Promise<void> {
        if (this._state !== ActorState.Initialized) {
            throw new Error(`Cannot start actor in state ${ActorState[this._state]}`);
        }
        this._worker!.postMessage({ type: "start" });
        this._state = ActorState.Running;
    }

    /** Tell the Worker to stop gracefully. */
    async stop(): Promise<void> {
        if (this._state !== ActorState.Running) {
            return;
        }
        this._worker!.postMessage({ type: "stop" });
        this._state = ActorState.Stopped;
        this._worker!.terminate();
        this._worker = null;
    }

    /** Send a raw envelope to the Worker via `postMessage` (control path). */
    sendEnvelope(envelope: Uint8Array): void {
        if (!this._worker || this._state !== ActorState.Running) {
            return;
        }
        this._worker.postMessage({ type: "envelope", payload: envelope });
    }

    private _waitForReply(expectedType: WorkerReplyMessage["type"]): Promise<void> {
        return new Promise((resolve, reject) => {
            const handler = (ev: MessageEvent<WorkerReplyMessage>) => {
                if (ev.data.type === expectedType) {
                    this._worker!.removeEventListener("message", handler);
                    resolve();
                } else if (ev.data.type === "error") {
                    this._worker!.removeEventListener("message", handler);
                    this._error = ev.data.error ?? "unknown worker error";
                    this._state = ActorState.Failed;
                    reject(new Error(this._error));
                }
            };
            this._worker!.addEventListener("message", handler);
        });
    }
}
