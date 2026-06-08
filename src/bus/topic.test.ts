import { TestRunner, expect } from "../test/test-runner.js";
import { TopicRegistry } from "./topic.js";

const runner = new TestRunner();

runner.test("TopicRegistry subscribe adds actor", () => {
    const reg = new TopicRegistry();
    reg.subscribe("nexus.tick", 1);
    expect.toEqual(reg.subscribers("nexus.tick"), [1], "Should have subscriber 1");
});

runner.test("TopicRegistry subscribe is idempotent", () => {
    const reg = new TopicRegistry();
    reg.subscribe("nexus.tick", 1);
    reg.subscribe("nexus.tick", 1);
    expect.toEqual(reg.subscribers("nexus.tick"), [1], "Should still have only one subscriber");
});

runner.test("TopicRegistry unsubscribe removes actor", () => {
    const reg = new TopicRegistry();
    reg.subscribe("nexus.tick", 1);
    reg.subscribe("nexus.tick", 2);
    reg.unsubscribe("nexus.tick", 1);
    expect.toEqual(reg.subscribers("nexus.tick"), [2], "Should only have subscriber 2");
});

runner.test("TopicRegistry unsubscribe on empty topic is no-op", () => {
    const reg = new TopicRegistry();
    expect.toDoesNotThrow(() => reg.unsubscribe("nexus.tick", 1), "Unsubscribe on empty should not throw");
});

runner.test("TopicRegistry unsubscribe removes empty topic", () => {
    const reg = new TopicRegistry();
    reg.subscribe("nexus.tick", 1);
    reg.unsubscribe("nexus.tick", 1);
    expect.toBe(reg.topicCount(), 0, "Topic should be removed when empty");
});

runner.test("TopicRegistry unsubscribeAll removes actor from all topics", () => {
    const reg = new TopicRegistry();
    reg.subscribe("t1", 1);
    reg.subscribe("t2", 1);
    reg.subscribe("t1", 2);

    const removed = reg.unsubscribeAll(1);
    expect.toBe(removed.has("t1"), true, "Should report t1 removed");
    expect.toBe(removed.has("t2"), true, "Should report t2 removed");
    expect.toEqual(reg.subscribers("t1"), [2], "t1 should still have subscriber 2");
    expect.toBe(reg.isEmptyTopic("t2"), true, "t2 should be empty");
});

runner.test("TopicRegistry subscriberCount", () => {
    const reg = new TopicRegistry();
    expect.toBe(reg.subscriberCount("nexus.tick"), 0, "Empty topic count");
    reg.subscribe("nexus.tick", 1);
    reg.subscribe("nexus.tick", 2);
    expect.toBe(reg.subscriberCount("nexus.tick"), 2, "Two subscribers");
});

runner.test("TopicRegistry topicsFor", () => {
    const reg = new TopicRegistry();
    reg.subscribe("a", 1);
    reg.subscribe("b", 1);
    const topics = reg.topicsFor(1);
    expect.toBe(topics.has("a"), true, "Should have topic a");
    expect.toBe(topics.has("b"), true, "Should have topic b");
});

runner.test("TopicRegistry topicCount", () => {
    const reg = new TopicRegistry();
    expect.toBe(reg.topicCount(), 0, "Initial count");
    reg.subscribe("a", 1);
    reg.subscribe("b", 1);
    expect.toBe(reg.topicCount(), 2, "Two topics");
});

runner.test("TopicRegistry isEmptyTopic", () => {
    const reg = new TopicRegistry();
    expect.toBe(reg.isEmptyTopic("nexus.tick"), true, "Non-existent topic is empty");
    reg.subscribe("nexus.tick", 1);
    expect.toBe(reg.isEmptyTopic("nexus.tick"), false, "Topic with subscriber is not empty");
});

runner.test("TopicRegistry topicNames is sorted", () => {
    const reg = new TopicRegistry();
    reg.subscribe("z", 1);
    reg.subscribe("a", 1);
    reg.subscribe("m", 1);
    const names = reg.topicNames();
    expect.toEqual(names, ["a", "m", "z"], "topicNames should be sorted");
});

runner.test("TopicRegistry subscribers is sorted for determinism", () => {
    const reg = new TopicRegistry();
    reg.subscribe("t", 5);
    reg.subscribe("t", 1);
    reg.subscribe("t", 3);
    expect.toEqual(reg.subscribers("t"), [1, 3, 5], "subscribers should be sorted");
});
