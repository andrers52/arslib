import { TestRunner, expect } from "../test/test-runner.js";
import { BusContext, RoutingTable } from "./context.js";
import { BusEnvelope, MessageKind } from "./envelope.js";
import type { ObservabilitySink, BusEvent } from "./observability.js";

const runner = new TestRunner();

// ── RoutingTable ─────────────────────────────────────────────────────────

runner.test("RoutingTable register and deliver", () => {
    const rt = new RoutingTable<string>();
    rt.register(1);
    const env = BusEnvelope.command(1, 0, 1, "hello");
    expect.toBe(rt.deliver(1, env), true, "Deliver to registered actor should succeed");
    expect.toBe(rt.deliver(2, env), false, "Deliver to unregistered actor should fail");
});

runner.test("RoutingTable drainMailbox", () => {
    const rt = new RoutingTable<string>();
    rt.register(1);
    rt.deliver(1, BusEnvelope.command(1, 0, 1, "a"));
    rt.deliver(1, BusEnvelope.command(2, 0, 1, "b"));

    const msgs = rt.drainMailbox(1);
    expect.toHaveLength(msgs, 2, "Should drain 2 messages");
    expect.toBe(msgs[0].payload, "a", "First payload");
    expect.toBe(msgs[1].payload, "b", "Second payload");
    expect.toHaveLength(rt.drainMailbox(1), 0, "Second drain should be empty");
});

runner.test("RoutingTable unregister removes actor", () => {
    const rt = new RoutingTable<string>();
    rt.register(1);
    rt.unregister(1);
    expect.toBe(rt.isRegistered(1), false, "Actor should be unregistered");
    expect.toBe(rt.moduleCount(), 0, "Module count should be 0");
});

runner.test("RoutingTable mailbox returns readonly snapshot", () => {
    const rt = new RoutingTable<string>();
    rt.register(1);
    rt.deliver(1, BusEnvelope.command(1, 0, 1, "x"));
    const snap = rt.mailbox(1);
    expect.toBeDefined(snap, "Mailbox snapshot should exist");
    expect.toHaveLength(snap!, 1, "Snapshot should have 1 message");
});

runner.test("RoutingTable mailboxMut returns mutable reference", () => {
    const rt = new RoutingTable<string>();
    rt.register(1);
    const mb = rt.mailboxMut(1);
    expect.toBeDefined(mb, "mailboxMut should return a mailbox");
    mb!.push(BusEnvelope.command(1, 0, 1, "direct"));
    const msgs = rt.drainMailbox(1);
    expect.toHaveLength(msgs, 1, "Direct push via mailboxMut should work");
    expect.toBe(msgs[0].payload, "direct", "Payload should match");
});

runner.test("RoutingTable mailboxMut returns undefined for unknown", () => {
    const rt = new RoutingTable<string>();
    expect.toBeUndefined(rt.mailboxMut(99), "mailboxMut for unknown should be undefined");
});

// ── BusContext ───────────────────────────────────────────────────────────

runner.test("BusContext nextMessageId is monotonic", () => {
    const ctx = new BusContext<string>();
    const id1 = ctx.nextMessageId();
    const id2 = ctx.nextMessageId();
    expect.toBe(id2, id1 + 1, "Message IDs should be sequential");
});

runner.test("BusContext registerMailbox", () => {
    const ctx = new BusContext<string>();
    ctx.registerMailbox(1);
    expect.toBe(ctx.moduleCount(), 1, "Should have 1 module");
});

runner.test("BusContext unregisterMailbox clears subscriptions", () => {
    const ctx = new BusContext<string>();
    ctx.registerMailbox(1);
    ctx.subscribe("nexus.tick", 1);
    ctx.unregisterMailbox(1);
    expect.toBe(ctx.moduleCount(), 0, "Module should be unregistered");
    expect.toBe(ctx.topics().subscriberCount("nexus.tick"), 0, "Subscriptions should be cleared");
});

runner.test("BusContext sendTo delivers point-to-point", () => {
    const ctx = new BusContext<string>();
    ctx.registerMailbox(1);
    const env = BusEnvelope.command(1, 0, 1, "hello");
    const result = ctx.sendTo(env);
    expect.toBe(result.ok, true, "sendTo should succeed");

    const msgs = ctx.drainMailbox(1);
    expect.toHaveLength(msgs, 1, "Should receive 1 message");
    expect.toBe(msgs[0].payload, "hello", "Payload should match");
});

runner.test("BusContext sendTo returns error for unregistered target", () => {
    const ctx = new BusContext<string>();
    const env = BusEnvelope.command(1, 0, 99, "hello");
    const result = ctx.sendTo(env);
    expect.toBe(result.ok, false, "sendTo to unregistered should fail");
    if (!result.ok) {
        expect.toBe(result.envelope.payload, "hello", "Envelope should be returned");
    }
});

runner.test("BusContext sendTo returns error for null target", () => {
    const ctx = new BusContext<string>();
    const env = BusEnvelope.event(1, 0, "t", "hello");
    const result = ctx.sendTo(env);
    expect.toBe(result.ok, false, "sendTo with null target should fail");
});

runner.test("BusContext publish broadcasts to subscribers", () => {
    const ctx = new BusContext<string>();
    ctx.registerMailbox(1);
    ctx.registerMailbox(2);
    ctx.registerMailbox(3);
    ctx.subscribe("nexus.tick", 1);
    ctx.subscribe("nexus.tick", 2);
    // 3 is not subscribed

    const env = BusEnvelope.event(1, 0, "nexus.tick", "tick");
    const delivered = ctx.publish("nexus.tick", env);
    expect.toBe(delivered, 2, "Should deliver to 2 subscribers");

    expect.toHaveLength(ctx.drainMailbox(1), 1, "Actor 1 should receive");
    expect.toHaveLength(ctx.drainMailbox(2), 1, "Actor 2 should receive");
    expect.toHaveLength(ctx.drainMailbox(3), 0, "Actor 3 should not receive");
});

runner.test("BusContext publish returns 0 for empty topic", () => {
    const ctx = new BusContext<string>();
    const env = BusEnvelope.event(1, 0, "nexus.tick", "tick");
    expect.toBe(ctx.publish("nexus.tick", env), 0, "Empty topic should deliver 0");
});

runner.test("BusContext publish returns actual delivery count when subscriber has no mailbox", () => {
    const ctx = new BusContext<string>();
    ctx.registerMailbox(1);
    ctx.registerMailbox(2);
    ctx.subscribe("test", 1);
    ctx.subscribe("test", 2);

    // Both have mailboxes — should get 2 deliveries.
    const env1 = BusEnvelope.event(1, 0, "test", "data");
    expect.toBe(ctx.publish("test", env1), 2, "Both subscribers with mailboxes");

    // Unregister module 2's mailbox but it's still "subscribed" in topic.
    ctx.routingMut().unregister(2);
    const env2 = BusEnvelope.event(2, 0, "test", "data");
    expect.toBe(ctx.publish("test", env2), 1, "Only module 1 has mailbox now");
});

runner.test("BusContext publish clones envelope per subscriber", () => {
    const ctx = new BusContext<string>();
    ctx.registerMailbox(1);
    ctx.registerMailbox(2);
    ctx.subscribe("t", 1);
    ctx.subscribe("t", 2);

    const env = BusEnvelope.event(1, 0, "t", { x: 1 });
    ctx.publish("t", env);

    const m1 = ctx.drainMailbox(1)[0];
    const m2 = ctx.drainMailbox(2)[0];

    expect.toBe(m1.target, 1, "Clone for actor 1 should have target=1");
    expect.toBe(m2.target, 2, "Clone for actor 2 should have target=2");
    // Same payload reference (shallow copy as designed)
    expect.toBe(m1.payload, env.payload, "Payload should be shared");
});

runner.test("BusContext route publishes Event by topic", () => {
    const ctx = new BusContext<string>();
    ctx.registerMailbox(1);
    ctx.subscribe("t", 1);

    const env = BusEnvelope.event(1, 0, "t", "e");
    const result = ctx.route(env);
    expect.toBe(result.ok, true, "Route should succeed");
    if (result.ok) {
        expect.toBe(result.count, 1, "Route should publish to 1 subscriber");
    }
});

runner.test("BusContext route publishes Control by topic", () => {
    const ctx = new BusContext<string>();
    ctx.registerMailbox(1);
    ctx.subscribe("sys", 1);

    const env = BusEnvelope.new(1, 0, "ctrl").withTopic("sys");
    const result = ctx.route(env);
    expect.toBe(result.ok, true, "Route Control should succeed");
    if (result.ok) {
        expect.toBe(result.count, 1, "Route should publish Control to 1 subscriber");
    }
});

runner.test("BusContext route returns error for broadcast without topic", () => {
    const ctx = new BusContext<string>();
    const env = BusEnvelope.new(1, 0, "data");
    // Event with no topic should fail.
    env.kind = MessageKind.Event;
    const result = ctx.route(env);
    expect.toBe(result.ok, false, "Event with no topic should fail");
});

runner.test("BusContext route returns error for Control without topic", () => {
    const ctx = new BusContext<string>();
    const env = BusEnvelope.new(1, 0, "ctrl");
    // Control with no topic should fail.
    const result = ctx.route(env);
    expect.toBe(result.ok, false, "Control with no topic should fail");
});

runner.test("BusContext route sends point-to-point when no topic", () => {
    const ctx = new BusContext<string>();
    ctx.registerMailbox(1);

    const env = BusEnvelope.command(1, 0, 1, "c");
    const result = ctx.route(env);
    expect.toBe(result.ok, true, "Route should deliver point-to-point");
    if (result.ok) {
        expect.toBe(result.count, 1, "Should deliver 1 message");
    }
});

runner.test("BusContext route returns error for unroutable point-to-point", () => {
    const ctx = new BusContext<string>();
    const env = BusEnvelope.command(1, 0, 99, "c");
    const result = ctx.route(env);
    expect.toBe(result.ok, false, "Route to unregistered target should fail");
});

runner.test("BusContext topics and routing accessors", () => {
    const ctx = new BusContext<string>();
    ctx.registerMailbox(1);
    ctx.subscribe("t", 1);

    expect.toBe(ctx.topics().subscriberCount("t"), 1, "Topics accessor should work");
    expect.toBe(ctx.routing().isRegistered(1), true, "Routing accessor should work");
});

runner.test("BusContext topicsMut and routingMut allow mutation", () => {
    const ctx = new BusContext<string>();
    ctx.registerMailbox(1);

    // Mutate via topicsMut
    ctx.topicsMut().subscribe("t", 1);
    expect.toBe(ctx.topics().subscriberCount("t"), 1, "topicsMut should mutate");

    // Mutate via routingMut
    ctx.routingMut().register(2);
    expect.toBe(ctx.routing().isRegistered(2), true, "routingMut should mutate");
});

// ── Observability ────────────────────────────────────────────────────────

class TestSink implements ObservabilitySink {
    events: BusEvent[] = [];
    onEvent(event: BusEvent): void {
        this.events.push(event);
    }
}

runner.test("BusContext withSink emits ModuleRegistered", () => {
    const sink = new TestSink();
    const ctx = BusContext.withSink<string>(sink);
    ctx.registerMailbox(1);
    expect.toHaveLength(sink.events, 1, "Should have 1 event");
    expect.toBe(sink.events[0].kind, "ModuleRegistered", "Should be ModuleRegistered");
});

runner.test("BusContext withSink emits ModuleUnregistered", () => {
    const sink = new TestSink();
    const ctx = BusContext.withSink<string>(sink);
    ctx.registerMailbox(1);
    ctx.unregisterMailbox(1);
    expect.toHaveLength(sink.events, 2, "Should have 2 events");
    expect.toBe(sink.events[1].kind, "ModuleUnregistered", "Second should be ModuleUnregistered");
});

runner.test("BusContext withSink emits MessageEnqueued on sendTo", () => {
    const sink = new TestSink();
    const ctx = BusContext.withSink<string>(sink);
    ctx.registerMailbox(1);
    const env = BusEnvelope.command(42, 0, 1, "hello");
    ctx.sendTo(env);
    const enqueued = sink.events.find(e => e.kind === "MessageEnqueued");
    expect.toBeDefined(enqueued, "Should have MessageEnqueued event");
    if (enqueued && enqueued.kind === "MessageEnqueued") {
        expect.toBe(enqueued.messageId, 42, "MessageEnqueued should carry messageId");
    }
});

runner.test("BusContext withSink emits MessagePublished on publish", () => {
    const sink = new TestSink();
    const ctx = BusContext.withSink<string>(sink);
    ctx.registerMailbox(1);
    ctx.subscribe("alerts", 1);
    const env = BusEnvelope.event(7, 0, "alerts", "alert!");
    ctx.publish("alerts", env);
    const published = sink.events.find(e => e.kind === "MessagePublished");
    expect.toBeDefined(published, "Should have MessagePublished event");
    if (published && published.kind === "MessagePublished") {
        expect.toBe(published.messageId, 7, "MessagePublished should carry messageId");
        expect.toBe(published.topic, "alerts", "MessagePublished should carry topic");
        expect.toBe(published.deliveries, 1, "MessagePublished should carry deliveries");
    }
});

runner.test("BusContext withSink emits MessageDispatched on route point-to-point", () => {
    const sink = new TestSink();
    const ctx = BusContext.withSink<string>(sink);
    ctx.registerMailbox(1);
    const env = BusEnvelope.command(99, 0, 1, "cmd");
    ctx.route(env);
    const dispatched = sink.events.find(e => e.kind === "MessageDispatched");
    expect.toBeDefined(dispatched, "Should have MessageDispatched event");
    if (dispatched && dispatched.kind === "MessageDispatched") {
        expect.toBe(dispatched.messageId, 99, "MessageDispatched should carry messageId");
    }
});

runner.test("BusContext without sink does not throw", () => {
    const ctx = new BusContext<string>();
    ctx.registerMailbox(1);
    ctx.sendTo(BusEnvelope.command(1, 0, 1, "x"));
    // Should not throw even without sink
    expect.toBe(ctx.moduleCount(), 1, "Normal operation without sink");
});

// ── query() tests ────────────────────────────────────────────────────────

runner.test("BusContext query full round trip", async () => {
    const ctx = new BusContext<string>();
    ctx.registerMailbox(1); // client
    ctx.registerMailbox(2); // server

    // Step 1: client sends query
    const correlationId = ctx.nextMessageId();
    const query = BusEnvelope.query(correlationId, 1, 2, "get-data");
    ctx.sendTo(query);

    // Step 2: server drains and replies
    const received = ctx.drainMailbox(2);
    expect.toHaveLength(received, 1, "Server should receive query");
    expect.toBe(received[0].payload, "get-data", "Payload should match");

    const reply = BusEnvelope.reply(101, 2, 1, correlationId, "answer");
    ctx.sendTo(reply);

    // Step 3: client drains reply
    const replies = ctx.drainMailbox(1);
    expect.toHaveLength(replies, 1, "Client should receive reply");
    expect.toBe(replies[0].payload, "answer", "Reply payload should match");
    expect.toBe(replies[0].correlationId, correlationId, "Correlation ID should match");
});

runner.test("BusContext query rejects for unregistered target", async () => {
    const ctx = new BusContext<string>();
    ctx.registerMailbox(1); // client only

    try {
        await ctx.query(1, 99, "get-data", 10);
        expect.toBe(true, false, "Should have thrown");
    } catch (e) {
        expect.toBe((e as Error).message.includes("not registered"), true, "Should mention not registered");
    }
});

runner.test("BusContext query times out when no reply", async () => {
    const ctx = new BusContext<string>();
    ctx.registerMailbox(1); // client
    ctx.registerMailbox(2); // server (won't reply)

    try {
        await ctx.query(1, 2, "get-data", 20, 5);
        expect.toBe(true, false, "Should have timed out");
    } catch (e) {
        expect.toBe((e as Error).message.includes("timed out"), true, "Should mention timeout");
    }
});

runner.test("BusContext query requeues non-matching messages", async () => {
    const ctx = new BusContext<string>();
    ctx.registerMailbox(1); // client
    ctx.registerMailbox(2); // server

    // Pre-populate client's mailbox with unrelated messages.
    ctx.sendTo(BusEnvelope.command(1, 0, 1, "cmd1"));
    ctx.sendTo(BusEnvelope.command(2, 0, 1, "cmd2"));

    // Pre-send a reply with the correlation ID that query() will use.
    // query() calls nextMessageId() to get the correlation ID.
    const expectedCorrelation = ctx.nextMessageId() + 1;
    const reply = BusEnvelope.reply(101, 2, 1, expectedCorrelation, "answer");
    ctx.sendTo(reply);

    const result = await ctx.query(1, 2, "get-data", 100, 5);
    expect.toBe(result.payload, "answer", "Should receive reply");

    // Non-matching commands should still be in the mailbox.
    const remaining = ctx.drainMailbox(1);
    expect.toHaveLength(remaining, 2, "Should requeue 2 commands");
    expect.toBe(remaining[0].payload, "cmd1", "First command");
    expect.toBe(remaining[1].payload, "cmd2", "Second command");
});

runner.test("BusContext query observability events", async () => {
    const sink = new TestSink();
    const ctx = BusContext.withSink<string>(sink);
    ctx.registerMailbox(1);
    ctx.registerMailbox(2);

    // Pre-send reply so query succeeds immediately.
    const expectedCorrelation = ctx.nextMessageId() + 1;
    const reply = BusEnvelope.reply(101, 2, 1, expectedCorrelation, "answer");
    ctx.sendTo(reply);

    await ctx.query(1, 2, "get-data", 100, 5);

    const hasQuerySent = sink.events.some(e => e.kind === "QuerySent");
    const hasReplyReceived = sink.events.some(e => e.kind === "ReplyReceived");
    expect.toBe(hasQuerySent, true, "Should emit QuerySent");
    expect.toBe(hasReplyReceived, true, "Should emit ReplyReceived");
});

runner.test("BusContext query timeout emits event", async () => {
    const sink = new TestSink();
    const ctx = BusContext.withSink<string>(sink);
    ctx.registerMailbox(1);
    ctx.registerMailbox(2);

    try {
        await ctx.query(1, 2, "get-data", 20, 5);
        expect.toBe(true, false, "Should have timed out");
    } catch {
        // expected
    }

    const hasTimeout = sink.events.some(e => e.kind === "QueryTimeout");
    expect.toBe(hasTimeout, true, "Should emit QueryTimeout");
});
