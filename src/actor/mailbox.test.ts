import { TestRunner, expect } from "../test/test-runner.js";
import { InMemoryMailbox } from "./mailbox.js";

const runner = new TestRunner();

runner.test("InMemoryMailbox push and takeAll", () => {
    const mb = new InMemoryMailbox<string>();
    expect.toBe(mb.isEmpty(), true, "New mailbox should be empty");

    mb.push("hello");
    mb.push("world");

    expect.toBe(mb.len(), 2, "Mailbox should have 2 messages");
    const all = mb.takeAll();
    expect.toHaveLength(all, 2, "takeAll should return 2 messages");
    expect.toBe(all[0], "hello", "First message should be hello");
    expect.toBe(all[1], "world", "Second message should be world");
    expect.toBe(mb.isEmpty(), true, "Mailbox should be empty after takeAll");
});

runner.test("InMemoryMailbox drain yields messages and clears", () => {
    const mb = new InMemoryMailbox<number>();
    mb.push(10);
    mb.push(20);

    const drained: number[] = [];
    for (const msg of mb.drain()) {
        drained.push(msg);
    }

    expect.toHaveLength(drained, 2, "Should drain 2 messages");
    expect.toBe(drained[0], 10, "First drained should be 10");
    expect.toBe(drained[1], 20, "Second drained should be 20");
    expect.toBe(mb.isEmpty(), true, "Mailbox should be empty after drain");
});

runner.test("InMemoryMailbox iteration", () => {
    const mb = new InMemoryMailbox<number>();
    mb.push(1);
    mb.push(2);

    const items: number[] = [];
    for (const item of mb) {
        items.push(item);
    }

    expect.toHaveLength(items, 2, "Iteration should yield 2 items");
    expect.toBe(mb.len(), 2, "Iteration should not consume messages");
});

runner.test("InMemoryMailbox peek returns first without removing", () => {
    const mb = new InMemoryMailbox<string>();
    expect.toBeUndefined(mb.peek(), "Peek on empty should be undefined");

    mb.push("first");
    mb.push("second");

    expect.toBe(mb.peek(), "first", "Peek should return first");
    expect.toBe(mb.len(), 2, "Peek should not remove");
});

runner.test("InMemoryMailbox clear empties all messages", () => {
    const mb = new InMemoryMailbox<number>();
    mb.push(1);
    mb.push(2);
    mb.clear();
    expect.toBe(mb.isEmpty(), true, "Mailbox should be empty after clear");
});
