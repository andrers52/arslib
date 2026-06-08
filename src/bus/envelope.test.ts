import { TestRunner, expect } from "../test/test-runner.js";
import {
    MessageKind,
    EnvelopeValidationError,
    EnvelopeValidationErrorKind,
    EnvelopeValidationErrorClass,
    BusEnvelope,
    encodeBusEnvelope,
    decodeBusEnvelope,
    envelopeToJson,
    jsonToEnvelope,
    ENVELOPE_HEADER_SIZE,
} from "./envelope.js";

const runner = new TestRunner();

// ── MessageKind ──────────────────────────────────────────────────────────

runner.test("MessageKind expectsReply", () => {
    expect.toBe(MessageKind.expectsReply(MessageKind.Query), true, "Query expects reply");
    expect.toBe(MessageKind.expectsReply(MessageKind.Command), false, "Command does not expect reply");
    expect.toBe(MessageKind.expectsReply(MessageKind.Event), false, "Event does not expect reply");
});

runner.test("MessageKind isBroadcast includes Event and Control", () => {
    expect.toBe(MessageKind.isBroadcast(MessageKind.Event), true, "Event is broadcast");
    expect.toBe(MessageKind.isBroadcast(MessageKind.Control), true, "Control is broadcast");
    expect.toBe(MessageKind.isBroadcast(MessageKind.Command), false, "Command is not broadcast");
    expect.toBe(MessageKind.isBroadcast(MessageKind.Query), false, "Query is not broadcast");
    expect.toBe(MessageKind.isBroadcast(MessageKind.Reply), false, "Reply is not broadcast");
    expect.toBe(MessageKind.isBroadcast(MessageKind.Error), false, "Error is not broadcast");
});

runner.test("MessageKind requiresTarget", () => {
    expect.toBe(MessageKind.requiresTarget(MessageKind.Command), true, "Command requires target");
    expect.toBe(MessageKind.requiresTarget(MessageKind.Query), true, "Query requires target");
    expect.toBe(MessageKind.requiresTarget(MessageKind.Reply), true, "Reply requires target");
    expect.toBe(MessageKind.requiresTarget(MessageKind.Error), true, "Error requires target");
    expect.toBe(MessageKind.requiresTarget(MessageKind.Event), false, "Event does not require target");
    expect.toBe(MessageKind.requiresTarget(MessageKind.Control), false, "Control does not require target");
});

runner.test("MessageKind requiresTopic includes Event and Control", () => {
    expect.toBe(MessageKind.requiresTopic(MessageKind.Event), true, "Event requires topic");
    expect.toBe(MessageKind.requiresTopic(MessageKind.Control), true, "Control requires topic");
    expect.toBe(MessageKind.requiresTopic(MessageKind.Command), false, "Command does not require topic");
    expect.toBe(MessageKind.requiresTopic(MessageKind.Query), false, "Query does not require topic");
    expect.toBe(MessageKind.requiresTopic(MessageKind.Reply), false, "Reply does not require topic");
    expect.toBe(MessageKind.requiresTopic(MessageKind.Error), false, "Error does not require topic");
});

runner.test("MessageKind toString", () => {
    expect.toBe(MessageKind.toString(MessageKind.Command), "Command", "Command toString");
    expect.toBe(MessageKind.toString(MessageKind.Event), "Event", "Event toString");
    expect.toBe(MessageKind.toString(MessageKind.Control), "Control", "Control toString");
});

// ── BusEnvelope factories ────────────────────────────────────────────────

runner.test("BusEnvelope.command has correct fields", () => {
    const env = BusEnvelope.command(1, 10, 20, "payload");
    expect.toBe(env.messageId, 1, "messageId");
    expect.toBe(env.kind, MessageKind.Command, "kind");
    expect.toBe(env.sender, 10, "sender");
    expect.toBe(env.target, 20, "target");
    expect.toBe(env.topic, null, "topic");
    expect.toBe(env.correlationId, null, "correlationId");
    expect.toBe(env.payload, "payload", "payload");
});

runner.test("BusEnvelope.event has correct fields", () => {
    const env = BusEnvelope.event(2, 10, "nexus.tick", { x: 1 });
    expect.toBe(env.kind, MessageKind.Event, "kind");
    expect.toBe(env.topic, "nexus.tick", "topic");
    expect.toBe(env.target, null, "target");
});

runner.test("BusEnvelope.query has correct fields", () => {
    const env = BusEnvelope.query(3, 10, 20, "q");
    expect.toBe(env.kind, MessageKind.Query, "kind");
    expect.toBe(env.target, 20, "target");
});

runner.test("BusEnvelope.reply has correlationId", () => {
    const env = BusEnvelope.reply(4, 10, 20, 99, "r");
    expect.toBe(env.kind, MessageKind.Reply, "kind");
    expect.toBe(env.correlationId, 99, "correlationId");
});

runner.test("BusEnvelope.error has correct fields", () => {
    const env = BusEnvelope.error(5, 10, 20, 99, "err");
    expect.toBe(env.kind, MessageKind.Error, "kind");
    expect.toBe(env.target, 20, "target");
    expect.toBe(env.correlationId, 99, "correlationId");
});

runner.test("BusEnvelope fluent setters", () => {
    const env = BusEnvelope.new(1, 0, "p")
        .withTarget(42)
        .withTopic("t")
        .withCorrelationId(7);
    expect.toBe(env.target, 42, "target");
    expect.toBe(env.topic, "t", "topic");
    expect.toBe(env.correlationId, 7, "correlationId");
});

runner.test("BusEnvelope mapPayload transforms payload", () => {
    const env = BusEnvelope.event(1, 0, "t", 10);
    const mapped = env.mapPayload((n) => n * 2);
    expect.toBe(mapped.payload, 20, "mapped payload");
    expect.toBe(mapped.messageId, 1, "messageId preserved");
    expect.toBe(mapped.topic, "t", "topic preserved");
});

// ── Validation (Result-based) ────────────────────────────────────────────

runner.test("BusEnvelope validate accepts valid command", () => {
    const env = BusEnvelope.command(1, 0, 1, "p");
    const result = env.validate();
    expect.toBe(result.ok, true, "Valid command should return ok");
});

runner.test("BusEnvelope validate rejects command without target", () => {
    const env = BusEnvelope.new(1, 0, "p");
    env.kind = MessageKind.Command;
    const result = env.validate();
    expect.toBe(result.ok, false, "Command without target should fail");
    if (!result.ok) {
        expect.toBe(result.error.kind, EnvelopeValidationErrorKind.TargetRequired, "Should be TargetRequired");
        expect.toBe(result.error.messageKind, MessageKind.Command, "Should reference Command");
    }
});

runner.test("BusEnvelope validate rejects event without topic", () => {
    const env = BusEnvelope.new(1, 0, "p");
    env.kind = MessageKind.Event;
    const result = env.validate();
    expect.toBe(result.ok, false, "Event without topic should fail");
    if (!result.ok) {
        expect.toBe(result.error.kind, EnvelopeValidationErrorKind.TopicRequired, "Should be TopicRequired");
    }
});

runner.test("BusEnvelope validate rejects control without topic", () => {
    const env = BusEnvelope.new(1, 0, "p");
    // Control already has no topic set
    const result = env.validate();
    expect.toBe(result.ok, false, "Control without topic should fail");
    if (!result.ok) {
        expect.toBe(result.error.kind, EnvelopeValidationErrorKind.TopicRequired, "Should be TopicRequired");
        expect.toBe(result.error.messageKind, MessageKind.Control, "Should reference Control");
    }
});

runner.test("BusEnvelope validate rejects broadcast with target", () => {
    const env = BusEnvelope.event(1, 0, "t", "p");
    env.target = 42;
    const result = env.validate();
    expect.toBe(result.ok, false, "Event with target should fail");
    if (!result.ok) {
        expect.toBe(result.error.kind, EnvelopeValidationErrorKind.BroadcastWithTarget, "Should be BroadcastWithTarget");
    }
});

runner.test("BusEnvelope validate rejects control with target", () => {
    const env = BusEnvelope.new(1, 0, "p").withTopic("sys");
    env.target = 42;
    const result = env.validate();
    expect.toBe(result.ok, false, "Control with target should fail");
    if (!result.ok) {
        expect.toBe(result.error.kind, EnvelopeValidationErrorKind.BroadcastWithTarget, "Should be BroadcastWithTarget");
        expect.toBe(result.error.messageKind, MessageKind.Control, "Should reference Control");
    }
});

runner.test("BusEnvelope validate rejects point-to-point with topic", () => {
    const env = BusEnvelope.command(1, 0, 1, "p");
    env.topic = "t";
    const result = env.validate();
    expect.toBe(result.ok, false, "Command with topic should fail");
    if (!result.ok) {
        expect.toBe(result.error.kind, EnvelopeValidationErrorKind.PointToPointWithTopic, "Should be PointToPointWithTopic");
    }
});

runner.test("BusEnvelope validate accepts control with topic", () => {
    const env = BusEnvelope.new(1, 0, "ctrl").withTopic("sys");
    const result = env.validate();
    expect.toBe(result.ok, true, "Control with topic should be valid");
});

runner.test("BusEnvelope validateOrThrow throws on invalid", () => {
    const env = BusEnvelope.new(1, 0, "p");
    env.kind = MessageKind.Command;
    expect.toThrow(
        () => env.validateOrThrow(),
        "requires a target",
        "validateOrThrow should throw on invalid envelope",
    );
});

runner.test("BusEnvelope validateOrThrow succeeds on valid", () => {
    const env = BusEnvelope.command(1, 0, 1, "p");
    expect.toDoesNotThrow(() => env.validateOrThrow(), "validateOrThrow should not throw on valid");
});

// ── EnvelopeValidationError structured enum ──────────────────────────────

runner.test("EnvelopeValidationError create and toString", () => {
    const err = EnvelopeValidationError.create(EnvelopeValidationErrorKind.TargetRequired, MessageKind.Command);
    expect.toBe(err.kind, EnvelopeValidationErrorKind.TargetRequired, "kind");
    expect.toBe(err.messageKind, MessageKind.Command, "messageKind");
    const str = EnvelopeValidationError.toString(err);
    expect.toBe(str.includes("Command"), true, "toString should include kind name");
    expect.toBe(str.includes("target"), true, "toString should mention target");
});

runner.test("EnvelopeValidationErrorClass wraps structured error", () => {
    const exc = new EnvelopeValidationErrorClass(EnvelopeValidationErrorKind.TopicRequired, MessageKind.Event);
    expect.toBe(exc.name, "EnvelopeValidationError", "name");
    expect.toBe(exc.errorKind, EnvelopeValidationErrorKind.TopicRequired, "errorKind");
    expect.toBe(exc.messageKind, MessageKind.Event, "messageKind");
    const structured = exc.toStructured();
    expect.toBe(structured.kind, EnvelopeValidationErrorKind.TopicRequired, "structured kind");
});

// ── Binary encode / decode ───────────────────────────────────────────────

runner.test("encodeBusEnvelope produces correct size", () => {
    const payload = new TextEncoder().encode('{"x":1}');
    const env = BusEnvelope.event(1, 10, "nexus.tick", payload);
    const buf = encodeBusEnvelope(env);
    const topicLen = new TextEncoder().encode("nexus.tick").length;
    expect.toBe(buf.byteLength, ENVELOPE_HEADER_SIZE + topicLen + payload.length, "Total size");
});

runner.test("decodeBusEnvelope recovers all fields", () => {
    const payload = new TextEncoder().encode('{"x":1}');
    const original = BusEnvelope.event(42, 10, "nexus.tick", payload);
    original.correlationId = 99;

    const buf = encodeBusEnvelope(original);
    const decoded = decodeBusEnvelope(buf);

    expect.toBe(decoded.messageId, 42, "messageId");
    expect.toBe(decoded.kind, MessageKind.Event, "kind");
    expect.toBe(decoded.sender, 10, "sender");
    expect.toBe(decoded.target, null, "target");
    expect.toBe(decoded.topic, "nexus.tick", "topic");
    expect.toBe(decoded.correlationId, 99, "correlationId");
    expect.toEqual(
        Array.from(decoded.payload),
        Array.from(payload),
        "payload",
    );
});

runner.test("decodeBusEnvelope recovers target and null correlation", () => {
    const payload = new Uint8Array([0]);
    const original = BusEnvelope.command(7, 5, 3, payload);
    const buf = encodeBusEnvelope(original);
    const decoded = decodeBusEnvelope(buf);

    expect.toBe(decoded.target, 3, "target");
    expect.toBe(decoded.correlationId, null, "correlationId should be null when 0");
});

runner.test("decodeBusEnvelope throws on short buffer", () => {
    expect.toThrow(
        () => decodeBusEnvelope(new ArrayBuffer(4)),
        "too small",
        "Should throw on short buffer",
    );
});

runner.test("encodeBusEnvelope rejects oversized topic", () => {
    const env = BusEnvelope.event(1, 0, "x".repeat(300), new Uint8Array(1));
    expect.toThrow(() => encodeBusEnvelope(env), "too long", "Should throw on oversized topic");
});

runner.test("encodeBusEnvelope rejects oversized payload", () => {
    const env = BusEnvelope.event(1, 0, "t", new Uint8Array(70000));
    expect.toThrow(() => encodeBusEnvelope(env), "too long", "Should throw on oversized payload");
});

// ── JSON round-trip ──────────────────────────────────────────────────────

runner.test("envelopeToJson converts binary to JSON shape", () => {
    const payload = new TextEncoder().encode(JSON.stringify({ tick: 16 }));
    const env = BusEnvelope.event(1, 10, "nexus.tick", payload);
    env.correlationId = 7;

    const json = envelopeToJson(env);
    expect.toBe(json.kind, MessageKind.Event, "kind");
    expect.toBe(json.topic, "nexus.tick", "topic");
    expect.toBe(json.sender, "10", "sender");
    expect.toBe(json.correlation_id, 7, "correlation_id");
    expect.toEqual(json.payload, { tick: 16 }, "payload");
});

runner.test("jsonToEnvelope converts JSON to binary", () => {
    const json = {
        kind: MessageKind.Command,
        topic: "nexus.cmd",
        sender: "5",
        correlation_id: 9,
        payload: { action: "start" },
    };

    const env = jsonToEnvelope(json);
    expect.toBe(env.kind, MessageKind.Command, "kind");
    expect.toBe(env.topic, "nexus.cmd", "topic");
    expect.toBe(env.sender, 5, "sender");
    expect.toBe(env.correlationId, 9, "correlationId");

    const decodedPayload = JSON.parse(new TextDecoder().decode(env.payload));
    expect.toEqual(decodedPayload, { action: "start" }, "payload");
});

runner.test("envelopeToJson falls back to binary wrapper for non-JSON payload", () => {
    const payload = new Uint8Array([0xff, 0xfe]);
    const env = BusEnvelope.event(1, 0, "t", payload);
    const json = envelopeToJson(env);

    expect.toBeDefined((json.payload as any).__binary, "Should have __binary wrapper");
    expect.toEqual((json.payload as any).__binary, [255, 254], "Binary should be preserved");
});
