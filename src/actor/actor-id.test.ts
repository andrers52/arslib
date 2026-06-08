import { TestRunner, expect } from "../test/test-runner.js";
import { ActorIdAllocator } from "./actor-id.js";

const runner = new TestRunner();

runner.test("ActorIdAllocator starts at the given value", () => {
    const alloc = new ActorIdAllocator(1);
    expect.toBe(alloc.peek(), 1, "Initial peek should be 1");
});

runner.test("ActorIdAllocator returns monotonic IDs", () => {
    const alloc = new ActorIdAllocator(1);
    expect.toBe(alloc.next(), 1, "First ID should be 1");
    expect.toBe(alloc.next(), 2, "Second ID should be 2");
    expect.toBe(alloc.next(), 3, "Third ID should be 3");
});

runner.test("ActorIdAllocator wraps at u32 max", () => {
    const alloc = new ActorIdAllocator(0xffffffff);
    expect.toBe(alloc.next(), 0xffffffff, "First ID should be u32::MAX");
    expect.toBe(alloc.next(), 0, "Second ID should wrap to 0");
    expect.toBe(alloc.next(), 1, "Third ID should be 1");
});

runner.test("ActorIdAllocator reset works", () => {
    const alloc = new ActorIdAllocator(100);
    alloc.next();
    alloc.reset(5);
    expect.toBe(alloc.next(), 5, "After reset ID should be 5");
});
