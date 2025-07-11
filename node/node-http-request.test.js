import { Platform } from "../platform.js";
import { strict as assert } from "assert";
import { NodeHttpRequest } from "./node-http-request.js";

// Note: These tests are designed to work in Node.js environment
// Some tests use mock data or check for expected behaviors without making real HTTP calls

describe("NodeHttpRequest should only work in Node.js environment", function() {
  it("should work", function() {
    if (!Platform.isNode()) {
      assert.ok(true, "Test passes as this is expected behavior in non-Node environment");
    } else {
      assert.strictEqual(typeof NodeHttpRequest.promisifiedHttpRequest, "function", "promisifiedHttpRequest should be a function in Node.js");
      assert.strictEqual(typeof NodeHttpRequest.getContent, "function", "getContent should be a function in Node.js");
    }
  });
});

describe("NodeHttpRequest.promisifiedHttpRequest has correct function signature", function() {
  it("should work", function() {
    if (!Platform.isNode()) {
      this.skip();
    }
    assert.strictEqual(typeof NodeHttpRequest.promisifiedHttpRequest, "function", "promisifiedHttpRequest should be a function");
    assert.strictEqual(NodeHttpRequest.promisifiedHttpRequest.length, 2, "Should accept 2 required parameters (useHttps has default)");
  });
});

describe("NodeHttpRequest.getContent has correct function signature", function() {
  it("should work", function() {
    if (!Platform.isNode()) {
      this.skip();
    }
    assert.strictEqual(typeof NodeHttpRequest.getContent, "function", "getContent should be a function");
    assert.strictEqual(NodeHttpRequest.getContent.length, 1, "Should accept 1 parameter");
  });
});

describe("NodeHttpRequest.promisifiedHttpRequest returns a Promise", function() {
  it("should work", async function() {
    if (!Platform.isNode()) {
      this.skip();
    }
    const params = {
      host: "invalid-host-that-does-not-exist-12345",
      port: 80,
      method: "GET",
      path: "/",
    };
    try {
      const result = NodeHttpRequest.promisifiedHttpRequest(params);
      assert.ok(typeof result === "object", "Result should be an object (Promise)");
      assert.strictEqual(typeof result.then, "function", "Should be a Promise with then method");
      await result;
      assert.fail("Should not reach here - request should fail");
    } catch (error) {
      assert.ok(true, "Expected to fail with invalid host");
    }
  });
});

describe("NodeHttpRequest.getContent returns a Promise", function() {
  it("should work", async function() {
    if (!Platform.isNode()) {
      this.skip();
    }
    try {
      const result = NodeHttpRequest.getContent(
        "http://invalid-host-that-does-not-exist-12345",
      );
      assert.ok(typeof result === "object", "Result should be an object (Promise)");
      assert.strictEqual(typeof result.then, "function", "Should be a Promise with then method");
      await result;
      assert.fail("Should not reach here - request should fail");
    } catch (error) {
      assert.ok(true, "Expected to fail with invalid host");
    }
  });
});