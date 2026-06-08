/**
 * Registry that maps `ActorId` → `SabMailbox` reference.
 *
 * Used by `BusWorker` to look up the SAB mailbox for each actor when
 * forwarding encoded envelopes from the bus.
 */

import type { ActorId } from "./actor-id.js";
import { SabMailbox } from "./mailbox.js";

export class SabMailboxRegistry {
    private _mailboxes: Map<number, SabMailbox>;

    constructor() {
        this._mailboxes = new Map();
    }

    /** Register a mailbox for an actor. */
    register(actorId: ActorId, mailbox: SabMailbox): void {
        this._mailboxes.set(actorId, mailbox);
    }

    /** Unregister a mailbox for an actor. */
    unregister(actorId: ActorId): void {
        this._mailboxes.delete(actorId);
    }

    /** Get the mailbox for an actor, or `undefined` if not registered. */
    get(actorId: ActorId): SabMailbox | undefined {
        return this._mailboxes.get(actorId);
    }

    /** Whether a mailbox is registered for the given actor. */
    has(actorId: ActorId): boolean {
        return this._mailboxes.has(actorId);
    }

    /** Number of registered mailboxes. */
    size(): number {
        return this._mailboxes.size;
    }

    /** All registered actor IDs. */
    actorIds(): IterableIterator<ActorId> {
        return this._mailboxes.keys();
    }
}
