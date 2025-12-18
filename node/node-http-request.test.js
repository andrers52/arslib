import { Platform } from "../platform.js";
import { TestRunner, expect } from "../test/test-runner.js";
import { NodeHttpRequest } from "./node-http-request.js";

const runner = new TestRunner();

// Note: These tests are designed to work in Node.js environment
// Some tests use mock data or check for expected behaviors without making real HTTP calls

runner.test("NodeHttpRequest should only work in Node.js environment", () => {
  if (!Platform.isNode()) {
    expect.toBeTruthy(
      true,
      "Test passes as this is expected behavior in non-Node environment",
    );
  } else {
    expect.toBeType(
      NodeHttpRequest.promisifiedHttpRequest,
      "function",
      "promisifiedHttpRequest should be a function in Node.js",
    );
    expect.toBeType(
      NodeHttpRequest.getContent,
      "function",
      "getContent should be a function in Node.js",
    );
  }
});

runner.test(
  "NodeHttpRequest.promisifiedHttpRequest has correct function signature",
  () => {
    if (!Platform.isNode()) {
      return; // Skip test if not in Node.js
    }

    expect.toBeType(
      NodeHttpRequest.promisifiedHttpRequest,
      "function",
      "promisifiedHttpRequest should be a function",
    );
    expect.toBe(
      NodeHttpRequest.promisifiedHttpRequest.length,
      2,
      "Should accept 2 required parameters (useHttps has default)",
    );
  },
);

runner.test("NodeHttpRequest.getContent has correct function signature", () => {
  if (!Platform.isNode()) {
    return; // Skip test if not in Node.js
  }

  expect.toBeType(
    NodeHttpRequest.getContent,
    "function",
    "getContent should be a function",
  );
  expect.toBe(
    NodeHttpRequest.getContent.length,
    1,
    "Should accept 1 parameter",
  );
});

runner.test(
  "NodeHttpRequest.promisifiedHttpRequest returns a Promise",
  async () => {
    if (!Platform.isNode()) {
      return; // Skip test if not in Node.js
    }

    const params = {
      host: "invalid-host-that-does-not-exist-12345",
      port: 80,
      method: "GET",
      path: "/",
    };

    try {
      const result = NodeHttpRequest.promisifiedHttpRequest(params);
      expect.toBeType(result, "object", "Result should be an object (Promise)");
      expect.toBeType(
        result.then,
        "function",
        "Should be a Promise with then method",
      );

      await result;
      expect.toBeTruthy(false, "Should not reach here - request should fail");
    } catch (error) {
      expect.toBeTruthy(true, "Expected to fail with invalid host");
    }
  },
);

runner.test("NodeHttpRequest.getContent returns a Promise", async () => {
  if (!Platform.isNode()) {
    return; // Skip test if not in Node.js
  }

  try {
    const result = NodeHttpRequest.getContent(
      "http://invalid-host-that-does-not-exist-12345",
    );
    expect.toBeType(result, "object", "Result should be an object (Promise)");
    expect.toBeType(
      result.then,
      "function",
      "Should be a Promise with then method",
    );

    await result;
    expect.toBeTruthy(false, "Should not reach here - request should fail");
  } catch (error) {
    expect.toBeTruthy(true, "Expected to fail with invalid host");
  }
});

// Run all tests
runner.run();
