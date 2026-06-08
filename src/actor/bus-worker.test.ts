// @vitest-environment node

import { TestRunner, expect } from "../test/test-runner.js";
import { BusWorker } from "./bus-worker.js";
import { SabMailboxRegistry } from "./sab-registry.js";
import { BusContext } from "../bus/context.js";
import { BusEnvelope, encodeBusEnvelope, decodeBusEnvelope } from "../bus/envelope.js";
import { SabMailbox } from "./mailbox.js";

const runner = new TestRunner();

// ── SabMailboxRegistry tests ───────────────────────────────────────────────

runner.test("SabMailboxRegistry register and get", () => {
    const reg = new SabMailboxRegistry();
    const mb = new SabMailbox(undefined, 4, 64);
    reg.register(42, mb);
    expect.toBe(reg.has(42), true, "Registry should have actor 42");
    expect.toBe(reg.get(42), mb, "get should return the same mailbox");
});

runner.test("SabMailboxRegistry unregister removes entry", () => {
    const reg = new SabMailboxRegistry();
    const mb = new SabMailbox(undefined, 4, 64);
    reg.register(7, mb);
    reg.unregister(7);
    expect.toBe(reg.has(7), false, "Registry should not have actor 7 after unregister");
    expect.toBeUndefined(reg.get(7), "get should return undefined after unregister");
});

runner.test("SabMailboxRegistry size tracks correctly", () => {
    const reg = new SabMailboxRegistry();
    expect.toBe(reg.size(), 0, "Initial size should be 0");
    reg.register(1, new SabMailbox(undefined, 4, 64));
    reg.register(2, new SabMailbox(undefined, 4, 64));
    expect.toBe(reg.size(), 2, "Size should be 2 after two registers");
    reg.unregister(1);
    expect.toBe(reg.size(), 1, "Size should be 1 after unregister");
});

runner.test("SabMailboxRegistry actorIds yields all ids", () => {
    const reg = new SabMailboxRegistry();
    reg.register(10, new SabMailbox(undefined, 4, 64));
    reg.register(20, new SabMailbox(undefined, 4, 64));
    const ids = Array.from(reg.actorIds());
    expect.toHaveLength(ids, 2, "Should yield 2 actor IDs");
    expect.toBe(ids.includes(10), true, "Should include 10");
    expect.toBe(ids.includes(20), true, "Should include 20");
});

// ── BusWorker local actor tests ────────────────────────────────────────────

runner.test("BusWorker registerLocalActor creates mailbox and registers on bus", () => {
    const bw = new BusWorker(0);
    const sab = bw.registerLocalActor(42);
    expect.toBeDefined(sab, "registerLocalActor should return a SabMailbox");
    expect.toBe(bw.registry.has(42), true, "Registry should have actor 42");
    expect.toBe(bw.bus.routing().isRegistered(42), true, "Bus routing should have actor 42");
});

runner.test("BusWorker runOneCycle forwards bus message to local actor SAB mailbox", () => {
    const bw = new BusWorker(0);
    const sabMailbox = bw.registerLocalActor(42);

    // Send a message to actor 42 via the bus.
    const payload = new TextEncoder().encode("hello");
    const envelope = BusEnvelope.command(1, 0, 42, payload);
    bw.bus.route(envelope);

    // Before dispatch, SAB mailbox should be empty.
    expect.toBe(sabMailbox.isEmpty(), true, "SAB mailbox should be empty before dispatch");

    // Run one dispatch cycle.
    const forwarded = bw.runOneCycle();
    expect.toBe(forwarded, 1, "Should forward 1 envelope");

    // After dispatch, SAB mailbox should contain the encoded envelope.
    expect.toBe(sabMailbox.isEmpty(), false, "SAB mailbox should not be empty after dispatch");

    const popped = sabMailbox.pop();
    expect.toBeDefined(popped, "Should pop an envelope from SAB mailbox");

    // Decode and verify.
    const decoded = decodeBusEnvelope(popped!);
    expect.toBe(decoded.messageId, 1, "Decoded messageId should match");
    expect.toBe(decoded.sender, 0, "Decoded sender should match");
    expect.toBe(decoded.target, 42, "Decoded target should match");
    expect.toBe(new TextDecoder().decode(decoded.payload), "hello", "Decoded payload should match");
});

runner.test("BusWorker runOneCycle drains multiple messages", () => {
    const bw = new BusWorker(0);
    const sabMailbox = bw.registerLocalActor(99);

    const payload1 = new TextEncoder().encode("msg1");
    const payload2 = new TextEncoder().encode("msg2");
    bw.bus.route(BusEnvelope.command(1, 0, 99, payload1));
    bw.bus.route(BusEnvelope.command(2, 0, 99, payload2));

    const forwarded = bw.runOneCycle();
    expect.toBe(forwarded, 2, "Should forward 2 envelopes");

    const first = sabMailbox.pop();
    const second = sabMailbox.pop();
    expect.toBeDefined(first, "First pop should be defined");
    expect.toBeDefined(second, "Second pop should be defined");
    expect.toBe(sabMailbox.isEmpty(), true, "SAB mailbox should be empty after popping both");
});

runner.test("BusWorker runOneCycle drains bus worker own mailbox", () => {
    const bw = new BusWorker(0);
    // Register the bus worker's own mailbox on the bus.
    bw.bus.registerMailbox(0);

    const payload = new TextEncoder().encode("to-bus");
    const envelope = BusEnvelope.command(1, 99, 0, payload);
    bw.bus.route(envelope);

    const forwarded = bw.runOneCycle();
    expect.toBe(forwarded, 1, "Should drain bus worker own mailbox");
});

runner.test("BusWorker runOneCycle returns 0 when no messages", () => {
    const bw = new BusWorker(0);
    bw.registerLocalActor(1);
    const forwarded = bw.runOneCycle();
    expect.toBe(forwarded, 0, "Should forward 0 envelopes when empty");
});

runner.test("BusWorker handles unregistered actor gracefully", () => {
    const bw = new BusWorker(0);
    // Do NOT register actor 77.
    const payload = new TextEncoder().encode("orphan");
    const envelope = BusEnvelope.command(1, 0, 77, payload);
    const result = bw.bus.route(envelope);
    expect.toBe(result.ok, false, "Routing to unregistered actor should fail");

    const forwarded = bw.runOneCycle();
    expect.toBe(forwarded, 0, "Should forward 0 envelopes for unregistered actor");
});

runner.test("BusWorker handles full SAB mailbox gracefully", () => {
    const bw = new BusWorker(0);
    // Tiny mailbox: 1 slot, 8 bytes max payload (slot size = 4 + 8 = 12).
    const tinyMailbox = new SabMailbox(undefined, 1, 8);
    bw.registry.register(5, tinyMailbox);
    bw.bus.registerMailbox(5);

    const payload = new TextEncoder().encode("first");
    bw.bus.route(BusEnvelope.command(1, 0, 5, payload));
    bw.bus.route(BusEnvelope.command(2, 0, 5, payload));

    // First message fits, second should fail to push (mailbox full).
    const forwarded = bw.runOneCycle();
    expect.toBe(forwarded, 1, "Only first envelope should be forwarded");

    // The second envelope should still be in the bus mailbox because
    // runOneCycle stops pushing when the SAB mailbox is full.
    const remaining = bw.bus.drainMailbox(5);
    expect.toHaveLength(remaining, 1, "One envelope should remain in bus mailbox");
    expect.toBe(remaining[0].messageId, 2, "Remaining envelope should be message 2");
});

runner.test("BusWorker unregisterActor cleans up", () => {
    const bw = new BusWorker(0);
    const sab = bw.registerLocalActor(3);
    expect.toBe(bw.registry.has(3), true, "Should be registered");

    bw.unregisterActor(3);
    expect.toBe(bw.registry.has(3), false, "Should be unregistered from registry");
    expect.toBe(bw.bus.routing().isRegistered(3), false, "Should be unregistered from bus");
});

runner.test("BusWorker poll is an alias for runOneCycle", () => {
    const bw = new BusWorker(0);
    const sabMailbox = bw.registerLocalActor(8);

    bw.bus.route(BusEnvelope.command(1, 0, 8, new TextEncoder().encode("x")));

    const pollResult = bw.poll();
    expect.toBe(pollResult, 1, "poll should return forwarded count");
    expect.toBe(sabMailbox.isEmpty(), false, "SAB mailbox should have message after poll");
});
