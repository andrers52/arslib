import { TestRunner, expect } from "../test/test-runner.js";
import { CommWSUtil } from "./comm-ws-util.js";

const runner = new TestRunner();

runner.test("CommWSUtil can be instantiated", () => {
  const commUtil = new CommWSUtil();
  expect.toBeDefined(commUtil, "CommWSUtil should be created");
  expect.toBeType(commUtil.start, "function", "Should have start method");
  expect.toBeType(commUtil.end, "function", "Should have end method");
  expect.toBeType(commUtil.sendStatus, "function", "Should have sendStatus method");
  expect.toBeType(
    commUtil.remoteCall,
    "function",
    "Should have remoteCall method",
  );
  expect.toBeType(
    commUtil.remoteCallConnectedUserByUserName,
    "function",
    "Should have remoteCallConnectedUserByUserName method",
  );
});

runner.test("CommWSUtil.remoteCall throws on private methods", () => {
  const commUtil = new CommWSUtil();
  expect.toThrow(
    () => commUtil.remoteCall("obj", "_privateMethod"),
    "Cannot call private methods",
    "Should throw when trying to call private method (starting with _)",
  );
});

runner.test("CommWSUtil.remoteCallConnectedUserByUserName throws on private methods", () => {
  const commUtil = new CommWSUtil();
  expect.toThrow(
    () => commUtil.remoteCallConnectedUserByUserName("user", "_privateMethod"),
    "Cannot call private methods",
    "Should throw when trying to call private method (starting with _)",
  );
});

runner.test("CommWSUtil.start initializes connection parameters", () => {
  const commUtil = new CommWSUtil();
  const mockObj = { testMethod: () => {} };
  const info = { status: "connected" };
  const addr = "ws://localhost:3000/";

  expect.toDoesNotThrow(
    () => commUtil.start(mockObj, info, addr, true),
    "Should not throw when starting connection",
  );
});

runner.test("CommWSUtil.end can be called without errors", () => {
  const commUtil = new CommWSUtil();
  expect.toDoesNotThrow(
    () => commUtil.end(),
    "Should not throw when ending connection",
  );
});

runner.test("CommWSUtil.sendStatus can be called without errors", () => {
  const commUtil = new CommWSUtil();
  expect.toDoesNotThrow(
    () => commUtil.sendStatus({ status: "test" }),
    "Should not throw when sending status",
  );
});

// Note: Full WebSocket integration tests would require a running server
// The tests above verify the API structure and validation behavior

// Run all tests
runner.run();
