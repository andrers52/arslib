// @vitest-environment node

import { TestRunner, expect } from "../test/test-runner.js";
import { SabMailbox } from "./mailbox.js";

const runner = new TestRunner();

runner.test("SabMailbox push and pop round-trip", () => {
    const mb = new SabMailbox(undefined, 4, 64);
    const payload = new TextEncoder().encode("hello");

    expect.toBe(mb.push(payload), true, "Push should succeed on empty buffer");
    expect.toBe(mb.isEmpty(), false, "Mailbox should not be empty after push");

    const popped = mb.pop();
    expect.toBeDefined(popped, "Pop should return an envelope");
    expect.toHaveLength(popped!, 5, "Popped payload should be 5 bytes");
    expect.toBe(new TextDecoder().decode(popped!), "hello", "Payload should match");
    expect.toBe(mb.isEmpty(), true, "Mailbox should be empty after pop");
});

runner.test("SabMailbox pop on empty returns null", () => {
    const mb = new SabMailbox(undefined, 4, 64);
    expect.toBeNull(mb.pop(), "Pop on empty should be null");
});

runner.test("SabMailbox push when full returns false", () => {
    const mb = new SabMailbox(undefined, 2, 64);
    expect.toBe(mb.push(new Uint8Array([1])), true, "First push should succeed");
    expect.toBe(mb.push(new Uint8Array([2])), true, "Second push should succeed");
    expect.toBe(mb.push(new Uint8Array([3])), false, "Third push on full should fail");
});

runner.test("SabMailbox tracks size correctly", () => {
    const mb = new SabMailbox(undefined, 4, 64);
    expect.toBe(mb.size(), 0, "Initial size should be 0");

    mb.push(new Uint8Array([1]));
    expect.toBe(mb.size(), 1, "Size should be 1 after push");

    mb.push(new Uint8Array([2]));
    expect.toBe(mb.size(), 2, "Size should be 2 after second push");

    mb.pop();
    expect.toBe(mb.size(), 1, "Size should be 1 after pop");
});

runner.test("SabMailbox wraps around ring buffer", () => {
    const mb = new SabMailbox(undefined, 2, 64);
    mb.push(new Uint8Array([1]));
    mb.push(new Uint8Array([2]));
    mb.pop(); // frees slot 0
    mb.pop(); // frees slot 1
    mb.push(new Uint8Array([3]));
    mb.push(new Uint8Array([4]));

    const first = mb.pop()!;
    const second = mb.pop()!;

    expect.toBe(first[0], 3, "First popped after wrap should be 3");
    expect.toBe(second[0], 4, "Second popped after wrap should be 4");
});

runner.test("SabMailbox large payload is truncated to slot size", () => {
    const mb = new SabMailbox(undefined, 2, 8); // slot = 4 prefix + 8 payload
    const big = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    mb.push(big);

    const popped = mb.pop()!;
    expect.toHaveLength(popped, 8, "Payload should be truncated to max envelope size");
    expect.toBe(popped[7], 8, "Last byte should be 8 (truncated)");
});

runner.test("SabMailbox requiredByteSize is correct", () => {
    const size = SabMailbox.requiredByteSize(4, 64);
    expect.toBe(size, 16 + 4 * (4 + 64), "Required size should match control + slots");
});

runner.test("SabMailbox wait with timeout 0 returns false when empty", () => {
    const mb = new SabMailbox(undefined, 4, 64);
    // wait(0) on an empty mailbox should time out immediately
    const result = mb.wait(0);
    expect.toBe(result, false, "Wait with timeout 0 on empty should time out");
});

runner.test("SabMailbox can be constructed from existing SAB", () => {
    const mb1 = new SabMailbox(undefined, 4, 64);
    mb1.push(new Uint8Array([1, 2, 3]));

    // Construct a second view of the same buffer
    const mb2 = new SabMailbox(mb1.sab, 4, 64);
    const popped = mb2.pop();

    expect.toBeDefined(popped, "Second view should see the same data");
    expect.toHaveLength(popped!, 3, "Payload should be 3 bytes");
});
