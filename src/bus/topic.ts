/**
 * Topic registry — maps topic names to subscriber actor ID sets.
 *
 * Mirrors `ars_bus::TopicRegistry` exactly:
 * - subscribe / unsubscribe per (topic, actor_id)
 * - unsubscribe_all for a given actor
 * - subscribers lookup (sorted for determinism)
 * - topic metadata (count, names, is_empty)
 */

import type { ActorId } from "../actor/actor-id.js";

export class TopicRegistry {
    private _topics: Map<string, Set<ActorId>>;
    private _instanceSubscriptions: Map<ActorId, Set<string>>;

    constructor() {
        this._topics = new Map();
        this._instanceSubscriptions = new Map();
    }

    /** Register `actorId` as a subscriber to `topic`. Idempotent. */
    subscribe(topic: string, actorId: ActorId): void {
        let set = this._topics.get(topic);
        if (!set) {
            set = new Set();
            this._topics.set(topic, set);
        }
        set.add(actorId);

        let topics = this._instanceSubscriptions.get(actorId);
        if (!topics) {
            topics = new Set();
            this._instanceSubscriptions.set(actorId, topics);
        }
        topics.add(topic);
    }

    /** Remove `actorId` from `topic`. Idempotent. */
    unsubscribe(topic: string, actorId: ActorId): void {
        const set = this._topics.get(topic);
        if (set) {
            set.delete(actorId);
            if (set.size === 0) {
                this._topics.delete(topic);
            }
        }

        const topics = this._instanceSubscriptions.get(actorId);
        if (topics) {
            topics.delete(topic);
            if (topics.size === 0) {
                this._instanceSubscriptions.delete(actorId);
            }
        }
    }

    /** Remove `actorId` from every topic it is subscribed to.  Returns the set of topics it was on. */
    unsubscribeAll(actorId: ActorId): Set<string> {
        const topics = this._instanceSubscriptions.get(actorId);
        if (!topics) {
            return new Set();
        }

        const removed = new Set(topics);
        for (const topic of topics) {
            const set = this._topics.get(topic);
            if (set) {
                set.delete(actorId);
                if (set.size === 0) {
                    this._topics.delete(topic);
                }
            }
        }
        this._instanceSubscriptions.delete(actorId);
        return removed;
    }

    /**
     * Return a sorted snapshot of subscriber IDs for `topic`.
     * Sorted for deterministic output (matches Rust `sort_unstable`).
     */
    subscribers(topic: string): ActorId[] {
        const set = this._topics.get(topic);
        if (!set) return [];
        const arr = Array.from(set);
        arr.sort((a, b) => a - b);
        return arr;
    }

    /** Number of subscribers on `topic`. */
    subscriberCount(topic: string): number {
        return this._topics.get(topic)?.size ?? 0;
    }

    /** All topics this actor is subscribed to. */
    topicsFor(actorId: ActorId): Set<string> {
        const topics = this._instanceSubscriptions.get(actorId);
        return topics ? new Set(topics) : new Set();
    }

    /** Total number of distinct topics. */
    topicCount(): number {
        return this._topics.size;
    }

    /** Whether `topic` has zero subscribers (or does not exist). */
    isEmptyTopic(topic: string): boolean {
        return !this._topics.has(topic) || this._topics.get(topic)!.size === 0;
    }

    /**
     * Sorted snapshot of all topic names.
     * Sorted for deterministic output (matches Rust `sort_unstable`).
     */
    topicNames(): string[] {
        const arr = Array.from(this._topics.keys());
        arr.sort();
        return arr;
    }
}
