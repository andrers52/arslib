/**
 * Bus transport adapter — abstraction over the physical transport that
 * carries Forge bus envelopes between renderer and simulation authority.
 *
 * Replaces the bespoke `DualChannelTransport` interface.  The adapter
 * speaks `BusEnvelope<Uint8Array>` on the reliable path and raw
 * `ArrayBuffer` on the unreliable path (for BFRM frame buffers).
 *
 * Implementations:
 * - `LocalBusAdapter` — Web Worker + SharedArrayBuffer (in-browser local mode)
 * - `WebRTCBusAdapter` — RTCPeerConnection data channels (remote mode)
 */

import type { BusEnvelope } from "./envelope.js";

/** Physical channel reliability mode. */
export type BusChannelMode = "unreliable" | "reliable";

/**
 * Transport adapter interface — the sole contract between renderer and
 * simulation authority.
 */
export interface BusTransportAdapter {
    /**
     * Send a binary envelope on the reliable channel.
     *
     * The envelope is encoded to the packed binary format by the caller
     * (or by the adapter — the contract is "send this envelope reliably").
     */
    sendReliable(envelope: BusEnvelope<Uint8Array>): void;

    /**
     * Send raw bytes on the unreliable channel.
     *
     * Used for BFRM frame buffers.  Dropped frames are acceptable.
     */
    sendUnreliable(data: ArrayBuffer): void;

    /**
     * Register a handler for incoming messages.
     *
     * - `reliable` → `BusEnvelope<Uint8Array>` (decoded by the adapter or caller)
     * - `unreliable` → `ArrayBuffer` (BFRM frame buffer, pass through)
     */
    onMessage(
        handler: (mode: BusChannelMode, data: BusEnvelope<Uint8Array> | ArrayBuffer) => void,
    ): void;

    /** Close the transport and release resources. */
    close(): void;

    /** Whether the transport is connected and ready. */
    readonly ready: boolean;

    /**
     * Optional demand-pull gate.  Returns `true` when the consumer wants
     * a fresh frame.  Only implemented by `LocalBusAdapter`.
     */
    hasFrameDemand?(): boolean;

    /**
     * Optional pull-on-demand frame delivery.  Called once per render
     * frame to pull the latest BFRM buffer from the transport's internal
     * queue.  Only implemented by `LocalBusAdapter`.
     */
    pollFrame?(): void;
}
