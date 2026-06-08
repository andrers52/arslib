/**
 * Bus context — in-process typed message bus.
 *
 * Mirrors `ars_bus::BusContext<P>`:
 * - `RoutingTable<T>` holds per-actor `InMemoryMailbox<BusEnvelope<T>>`
 * - `TopicRegistry` manages pub/sub subscriptions
 * - `BusContext<T>` wires them together with point-to-point, publish, and
 *   unified `route()` dispatch.
 * - Optional `ObservabilitySink` for event tracing
 */

import { InMemoryMailbox } from "../actor/mailbox.js";
import type { ActorId } from "../actor/actor-id.js";
import { BusEnvelope, MessageKind } from "./envelope.js";
import { TopicRegistry } from "./topic.js";
import { ModuleId } from "./module.js";
import type { BusEvent, ObservabilitySink } from "./observability.js";

// ── Result types ─────────────────────────────────────────────────────────

/** Result of `sendTo` — mirrors `Result<(), BusEnvelope<P>>`. */
export type SendResult<T> = { ok: true } | { ok: false; envelope: BusEnvelope<T> };

/** Result of `route` — mirrors `Result<usize, BusEnvelope<P>>`. */
export type RouteResult<T> = { ok: true; count: number } | { ok: false; envelope: BusEnvelope<T> };

/** Error thrown when a `BusContext.query()` operation fails. */
export class QueryError extends Error {
    readonly kind: "TargetNotFound" | "Timeout";
    readonly target?: number;
    readonly correlationId?: number;

    constructor(kind: "TargetNotFound" | "Timeout", target?: number, correlationId?: number) {
        if (kind === "TargetNotFound") {
            super(`query target module ${target} is not registered`);
        } else {
            super(`query timed out (correlation_id=${correlationId})`);
        }
        this.kind = kind;
        this.target = target;
        this.correlationId = correlationId;
        // Fix prototype chain for instanceof checks.
        Object.setPrototypeOf(this, QueryError.prototype);
    }
}

// ── RoutingTable ─────────────────────────────────────────────────────────

/**
 * Holds a mailbox for every registered actor.  Envelopes are enqueued
 * in-memory; the caller is responsible for draining each actor's mailbox
 * and forwarding to the appropriate transport (SAB, Worker postMessage,
 * or direct function call).
 */
export class RoutingTable<T> {
    private _mailboxes: Map<ActorId, InMemoryMailbox<BusEnvelope<T>>>;

    constructor() {
        this._mailboxes = new Map();
    }

    register(actorId: ActorId): void {
        if (!this._mailboxes.has(actorId)) {
            this._mailboxes.set(actorId, new InMemoryMailbox());
        }
    }

    unregister(actorId: ActorId): void {
        this._mailboxes.delete(actorId);
    }

    /**
     * Deliver an envelope to a specific actor's mailbox.
     *
     * @returns `true` if the actor was registered and the envelope queued.
     */
    deliver(target: ActorId, envelope: BusEnvelope<T>): boolean {
        const mb = this._mailboxes.get(target);
        if (!mb) {
            return false;
        }
        mb.push(envelope);
        return true;
    }

    /** Drain all messages from an actor's mailbox. */
    drainMailbox(actorId: ActorId): BusEnvelope<T>[] {
        return this._mailboxes.get(actorId)?.takeAll() ?? [];
    }

    isRegistered(actorId: ActorId): boolean {
        return this._mailboxes.has(actorId);
    }

    moduleCount(): number {
        return this._mailboxes.size;
    }

    mailbox(actorId: ActorId): ReadonlyArray<BusEnvelope<T>> | undefined {
        const mb = this._mailboxes.get(actorId);
        return mb ? Array.from(mb) : undefined;
    }

    /**
     * Get a mutable reference to a module's mailbox, if it exists.
     * Mirrors `ars_bus::RoutingTable::mailbox_mut`.
     */
    mailboxMut(actorId: ActorId): InMemoryMailbox<BusEnvelope<T>> | undefined {
        return this._mailboxes.get(actorId);
    }
}

// ── BusContext ───────────────────────────────────────────────────────────

/**
 * Typed in-process bus context.
 *
 * `T` is the payload type — application-defined (e.g. `BrainiacBusEvent`).
 *
 * Usage:
 * ```typescript
 * const bus = new BusContext<SimMessage>();
 * bus.registerMailbox(0); // host/oracle
 * bus.registerMailbox(42); // some agent
 * bus.subscribe("nexus.tick", 42);
 *
 * bus.publish("nexus.tick", BusEnvelope.event(1, 0, "nexus.tick", { tick: 16 }));
 * const msgs = bus.drainMailbox(42); // [BusEnvelope]
 * ```
 */
export class BusContext<T> {
    private _routing: RoutingTable<T>;
    private _topics: TopicRegistry;
    private _nextId: number;
    private _sink: ObservabilitySink | undefined;

    constructor() {
        this._routing = new RoutingTable();
        this._topics = new TopicRegistry();
        this._nextId = 1;
    }

    /** Create a bus context with an observability sink. Mirrors `ars_bus::BusContext::with_sink`. */
    static withSink<T>(sink: ObservabilitySink): BusContext<T> {
        const ctx = new BusContext<T>();
        ctx._sink = sink;
        return ctx;
    }

    /** Monotonic u64 message ID allocator. */
    nextMessageId(): number {
        const id = this._nextId;
        this._nextId = (this._nextId + 1) & 0x1fffffffffffff; // safe JS integer
        return id;
    }

    // ── Module management ────────────────────────────────────────────────

    registerMailbox(actorId: ActorId): void {
        this._routing.register(actorId);
        this._emit({ kind: "ModuleRegistered", moduleId: new ModuleId(actorId) });
    }

    unregisterMailbox(actorId: ActorId): void {
        this._topics.unsubscribeAll(actorId);
        this._routing.unregister(actorId);
        this._emit({ kind: "ModuleUnregistered", moduleId: new ModuleId(actorId) });
    }

    moduleCount(): number {
        return this._routing.moduleCount();
    }

    // ── Point-to-point ───────────────────────────────────────────────────

    /**
     * Send an envelope to its explicit `target`.
     *
     * Mirrors `ars_bus::BusContext::send_to` — returns Result so the caller
     * can recover the envelope on failure (fail-fast).
     */
    sendTo(envelope: BusEnvelope<T>): SendResult<T> {
        if (envelope.target === null) {
            return { ok: false, envelope };
        }
        const delivered = this._routing.deliver(envelope.target, envelope);
        if (!delivered) {
            return { ok: false, envelope };
        }
        this._emit({ kind: "MessageEnqueued", messageId: envelope.messageId });
        return { ok: true };
    }

    // ── Pub/sub ──────────────────────────────────────────────────────────

    subscribe(topic: string, actorId: ActorId): void {
        this._topics.subscribe(topic, actorId);
    }

    unsubscribe(topic: string, actorId: ActorId): void {
        this._topics.unsubscribe(topic, actorId);
    }

    /**
     * Publish an envelope to every subscriber of `topic`.
     *
     * Uses `mailboxMut()` for direct push (aligns with Rust implementation).
     * The envelope is **cloned** (shallow copy of the envelope object;
     * the payload is shared — caller must ensure immutability or clone
     * the payload beforehand).
     *
     * @returns Number of actual deliveries made (subscribers with mailboxes).
     */
    publish(topic: string, envelope: BusEnvelope<T>): number {
        const subs = this._topics.subscribers(topic);
        let delivered = 0;
        for (const actorId of subs) {
            const mb = this._routing.mailboxMut(actorId);
            if (mb) {
                // Clone envelope so each subscriber gets its own instance.
                const clone = new BusEnvelope<T>(
                    envelope.messageId,
                    envelope.kind,
                    envelope.sender,
                    envelope.payload,
                );
                clone.target = actorId;
                clone.topic = envelope.topic;
                clone.correlationId = envelope.correlationId;
                mb.push(clone);
                delivered++;
            }
        }
        if (delivered > 0) {
            this._emit({
                kind: "MessagePublished",
                messageId: envelope.messageId,
                topic,
                deliveries: delivered,
            });
        }
        return delivered;
    }

    // ── Unified routing ──────────────────────────────────────────────────

    /**
     * Route an envelope automatically:
     * - Broadcast kinds (Event, Control): publish to `envelope.topic`.
     * - Point-to-point kinds (Command, Query, Reply, Error): send to `envelope.target`.
     *
     * Mirrors `ars_bus::BusContext::route` — returns Result so the caller
     * can recover the envelope on failure.
     */
    route(envelope: BusEnvelope<T>): RouteResult<T> {
        if (MessageKind.isBroadcast(envelope.kind)) {
            if (envelope.topic === null) {
                return { ok: false, envelope };
            }
            const count = this.publish(envelope.topic, envelope);
            return { ok: true, count };
        }
        // Point-to-point
        const result = this.sendTo(envelope);
        if (!result.ok) {
            return { ok: false, envelope: result.envelope };
        }
        this._emit({ kind: "MessageDispatched", messageId: envelope.messageId });
        return { ok: true, count: 1 };
    }

    // ── Mailbox access ───────────────────────────────────────────────────

    drainMailbox(actorId: ActorId): BusEnvelope<T>[] {
        return this._routing.drainMailbox(actorId);
    }

    // ── Request / Reply ──────────────────────────────────────────────────

    /**
     * Send a query and wait for a reply (or timeout).
     *
     * Promise-based request/reply built on top of the single-threaded bus.
     * Sends a `MessageKind.Query` to `target`, then polls the sender's
     * mailbox via `setInterval` until a matching `MessageKind.Reply` or
     * `MessageKind.Error` with the same `correlationId` arrives.
     * Non-matching messages are re-enqueued so they are not lost.
     *
     * @param sender   — module ID sending the query (mailbox polled for reply).
     * @param target   — module ID that should receive the query.
     * @param payload  — query payload.
     * @param timeoutMs — maximum milliseconds to wait for a reply.
     * @param pollIntervalMs — milliseconds between mailbox polls (default 10).
     * @returns Promise resolving to the reply envelope, or rejecting with
     *          `QueryError` on timeout or unregistered target.
     */
    query(
        sender: number,
        target: number,
        payload: T,
        timeoutMs: number,
        pollIntervalMs: number = 10,
    ): Promise<BusEnvelope<T>> {
        return new Promise((resolve, reject) => {
            if (!this._routing.isRegistered(target)) {
                reject(new QueryError("TargetNotFound", target));
                return;
            }
            if (!this._routing.isRegistered(sender)) {
                this.registerMailbox(sender);
            }

            const correlationId = this.nextMessageId();
            const query = BusEnvelope.query(correlationId, sender, target, payload);
            // correlationId is also the message_id for the query.
            query.correlationId = correlationId;

            const sendResult = this.sendTo(query);
            if (!sendResult.ok) {
                reject(new QueryError("TargetNotFound", target));
                return;
            }
            this._emit({ kind: "QuerySent", messageId: correlationId, target });

            const deadline = Date.now() + timeoutMs;
            const timer = setInterval(() => {
                if (Date.now() >= deadline) {
                    clearInterval(timer);
                    this._emit({ kind: "QueryTimeout", correlationId });
                    reject(new QueryError("Timeout", undefined, correlationId));
                    return;
                }

                const messages = this._routing.drainMailbox(sender);
                const requeue: BusEnvelope<T>[] = [];
                let reply: BusEnvelope<T> | undefined;

                for (const msg of messages) {
                    if (
                        msg.correlationId === correlationId &&
                        (msg.kind === MessageKind.Reply || msg.kind === MessageKind.Error)
                    ) {
                        reply = msg;
                        break;
                    }
                    requeue.push(msg);
                }

                // Re-enqueue non-matching messages so they are not lost.
                const mb = this._routing.mailboxMut(sender);
                if (mb) {
                    for (const msg of requeue) {
                        mb.push(msg);
                    }
                }

                if (reply) {
                    clearInterval(timer);
                    this._emit({
                        kind: "ReplyReceived",
                        messageId: reply.messageId,
                        correlationId,
                    });
                    resolve(reply);
                }
            }, pollIntervalMs);
        });
    }

    // ── Registry access ──────────────────────────────────────────────────

    topics(): TopicRegistry {
        return this._topics;
    }

    /** Mutable access to the topic registry. Mirrors `ars_bus::BusContext::topics_mut`. */
    topicsMut(): TopicRegistry {
        return this._topics;
    }

    routing(): RoutingTable<T> {
        return this._routing;
    }

    /** Mutable access to the routing table. Mirrors `ars_bus::BusContext::routing_mut`. */
    routingMut(): RoutingTable<T> {
        return this._routing;
    }

    // ── Observability ────────────────────────────────────────────────────

    /** Emit an observability event to the configured sink (if any). */
    private _emit(event: BusEvent): void {
        if (this._sink) {
            this._sink.onEvent(event);
        }
    }
}
