/**
 * Worker-side bootstrap for the actor runtime.
 *
 * This module is intended to run *inside* a Web Worker.
 *
 * It expects an `init` message from the host containing the
 * `SharedArrayBuffer` mailbox.  It then constructs a `SabMailbox`,
 * enters a loop of `wait()` → `pop()` → `decodeBusEnvelope()` →
 * `actor.handleMessage()`, and responds with `ready` / `error` lifecycle
 * messages.
 */

import { SabMailbox } from "./mailbox.js";
import { decodeBusEnvelope } from "../bus/envelope.js";
import type { Actor, WorkerControlMessage, WorkerReplyMessage } from "./actor.js";
import { ActorState } from "./actor.js";

/**
 * Bootstrap an actor inside a Worker.
 *
 * @param actorFactory — called once the SAB is received to construct the actor.
 */
export function bootstrapWorkerActor(actorFactory: () => Actor): void {
    let mailbox: SabMailbox | null = null;
    let actor: Actor | null = null;
    let running = false;

    function sendReply(msg: WorkerReplyMessage): void {
        // eslint-disable-next-line no-restricted-globals
        self.postMessage(msg);
    }

    // eslint-disable-next-line no-restricted-globals
    self.onmessage = (ev: MessageEvent<WorkerControlMessage>) => {
        const msg = ev.data;

        if (msg.type === "init") {
            if (!msg.sab || !(msg.sab instanceof SharedArrayBuffer)) {
                sendReply({ type: "error", error: "Missing SharedArrayBuffer in init message" });
                return;
            }
            try {
                mailbox = new SabMailbox(msg.sab);
                actor = actorFactory();
                actor.init();
                sendReply({ type: "ready" });
            } catch (err) {
                sendReply({ type: "error", error: err instanceof Error ? err.message : String(err) });
            }
            return;
        }

        if (msg.type === "start") {
            if (!actor || !mailbox) {
                sendReply({ type: "error", error: "Actor not initialized" });
                return;
            }
            try {
                actor.start();
                running = true;
                runLoop();
            } catch (err) {
                sendReply({ type: "error", error: err instanceof Error ? err.message : String(err) });
            }
            return;
        }

        if (msg.type === "stop") {
            running = false;
            if (actor) {
                try {
                    actor.stop();
                } catch {
                    // ignore shutdown errors
                }
            }
            return;
        }

        if (msg.type === "envelope") {
            // Control-path envelope via postMessage (fallback when SAB is not used).
            if (!actor || !msg.payload) {
                return;
            }
            try {
                const envelope = decodeBusEnvelope(msg.payload);
                actor.handleMessage(envelope);
            } catch {
                // ignore malformed envelopes on control path
            }
        }
    };

    function runLoop(): void {
        if (!running || !mailbox || !actor) {
            return;
        }

        while (running) {
            mailbox.wait();
            let envelopeBytes: Uint8Array | null;
            while ((envelopeBytes = mailbox.pop()) !== null) {
                try {
                    const envelope = decodeBusEnvelope(envelopeBytes);
                    actor.handleMessage(envelope);
                } catch {
                    // ignore malformed envelopes
                }
            }
        }
    }
}
