import { TestRunner, expect } from "./test/test-runner.js";
import { Platform } from "./platform.js";

const runner = new TestRunner();

runner.test("Platform.isNode returns boolean", () => {
  const result = Platform.isNode();
  expect.toBeType(result, "boolean", "isNode should return a boolean");
});

runner.test("Platform.isBrowser returns boolean", () => {
  const result = Platform.isBrowser();
  expect.toBeType(result, "boolean", "isBrowser should return a boolean");
});

runner.test("Platform.isWorker returns boolean", () => {
  const result = Platform.isWorker();
  expect.toBeType(result, "boolean", "isWorker should return a boolean");
});

runner.test("Platform methods are functions", () => {
  expect.toBeType(Platform.isNode, "function", "isNode should be a function");
  expect.toBeType(Platform.isBrowser, "function", "isBrowser should be a function");
  expect.toBeType(Platform.isWorker, "function", "isWorker should be a function");
});

// Note: In Node.js environment, isNode should return true
// In browser environment, isBrowser should return true
// These are environment-dependent tests
runner.test("Platform detects current environment", () => {
  // At least one should be true (or isWorker in worker context)
  const isNode = Platform.isNode();
  const isBrowser = Platform.isBrowser();
  const isWorker = Platform.isWorker();
  
  // In normal contexts, one of these should be true
  // (In Node.js: isNode=true, others=false)
  // (In Browser: isBrowser=true, others=false)
  // (In Worker: isWorker=true, others=false)
  expect.toBeTruthy(
    isNode || isBrowser || isWorker,
    "Platform should detect at least one environment",
  );
});

// Run all tests
runner.run();
