/**
 * BusWorker — bridges a `BusContext` to actor SAB mailboxes.
 *
 * Owns a `BusContext<Uint8Array>` (payload is encoded envelopes).
 * Maintains a `SabMailboxRegistry` that maps `ActorId` → `SabMailbox`.
 *
 * The dispatch loop (`runOneCycle`) drains each actor's `InMemoryMailbox`
 * from the bus, encodes the envelopes, and pushes the bytes into the
 * actor's `SabMailbox`.  It also drains the bus worker's own mailbox
 * for messages sent *to* the bus worker itself.
 */

import { BusContext } from "../bus/context.js";
import { BusEnvelope, encodeBusEnvelope } from "../bus/envelope.js";
import type { ActorId } from "./actor-id.js";
import { SabMailbox } from "./mailbox.js";
import { SabMailboxRegistry } from "./sab-registry.js";
import { WorkerActorHarness } from "./actor.js";

export class BusWorker {
    private _bus: BusContext<Uint8Array>;
    private _registry: SabMailboxRegistry;
    private _actorId: ActorId;
    private _harnesses: Map<ActorId, WorkerActorHarness>;

    /**
     * @param actorId — the bus worker's own actor ID (receives messages
     *        sent explicitly to the bus worker).
     */
    constructor(actorId: ActorId) {
        this._actorId = actorId;
        this._bus = new BusContext<Uint8Array>();
        this._registry = new SabMailboxRegistry();
        this._harnesses = new Map();
    }

    /** The underlying bus context. */
    get bus(): BusContext<Uint8Array> {
        return this._bus;
    }

    /** The SAB mailbox registry. */
    get registry(): SabMailboxRegistry {
        return this._registry;
    }

    /** The bus worker's own actor ID. */
    get actorId(): ActorId {
        return this._actorId;
    }

    /**
     * Spawn an actor in a dedicated Worker.
     *
     * Creates a fresh `SabMailbox`, registers it, registers the actor's
     * in-memory mailbox on the bus, and spawns the Worker via
     * `WorkerActorHarness`.
     */
    spawnActor(actorId: ActorId, workerFactory: () => Worker): WorkerActorHarness {
        const mailbox = new SabMailbox(undefined, 64, 1024);
        this._registry.register(actorId, mailbox);
        this._bus.registerMailbox(actorId);

        const harness = new WorkerActorHarness(workerFactory, mailbox.sab);
        this._harnesses.set(actorId, harness);
        return harness;
    }

    /**
     * Register a local actor that runs in the same thread (no Worker).
     *
     * Creates a fresh `SabMailbox`, registers it, and registers the actor's
     * in-memory mailbox on the bus.
     */
    registerLocalActor(actorId: ActorId): SabMailbox {
        const mailbox = new SabMailbox(undefined, 64, 1024);
        this._registry.register(actorId, mailbox);
        this._bus.registerMailbox(actorId);
        return mailbox;
    }

    /** Unregister an actor and clean up its harness if any. */
    unregisterActor(actorId: ActorId): void {
        this._registry.unregister(actorId);
        this._bus.unregisterMailbox(actorId);
        const harness = this._harnesses.get(actorId);
        if (harness) {
            harness.stop().catch(() => { /* ignore */ });
            this._harnesses.delete(actorId);
        }
    }

    /**
     * Run one dispatch cycle.
     *
     * For every registered actor:
     * 1. Drain the actor's `InMemoryMailbox` from the bus.
     * 2. Encode each `BusEnvelope` via `encodeBusEnvelope()`.
     * 3. Push the encoded bytes into the actor's `SabMailbox`.
     *
     * Also drains the bus worker's own mailbox.
     *
     * @returns Total number of envelopes forwarded.
     */
    runOneCycle(): number {
        let forwarded = 0;

        // Forward envelopes to each registered actor.
        for (const actorId of this._registry.actorIds()) {
            const mailbox = this._registry.get(actorId);
            if (!mailbox) {
                continue;
            }

            const envelopes = this._bus.drainMailbox(actorId);
            const requeue: BusEnvelope<Uint8Array>[] = [];
            for (const envelope of envelopes) {
                const encoded = new Uint8Array(encodeBusEnvelope(envelope));
                const pushed = mailbox.push(encoded);
                if (pushed) {
                    forwarded++;
                } else {
                    // Mailbox full — re-enqueue remaining envelopes.
                    requeue.push(envelope);
                }
            }

            // Put back any envelopes that could not be forwarded.
            if (requeue.length > 0) {
                const mb = this._bus.routing().mailboxMut(actorId);
                if (mb) {
                    for (const envelope of requeue) {
                        mb.push(envelope);
                    }
                }
            }
        }

        // Drain the bus worker's own mailbox (messages sent TO the bus worker).
        const own = this._bus.drainMailbox(this._actorId);
        for (const _envelope of own) {
            // Bus worker consumes its own messages — no SAB push needed.
            // In future versions this could trigger bus-level handlers.
            forwarded++;
        }

        return forwarded;
    }

    /** Drain all mailboxes and return the total count of forwarded envelopes. */
    poll(): number {
        return this.runOneCycle();
    }
}
