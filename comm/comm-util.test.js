import { TestRunner, expect } from "../test/test-runner.js";
import { CommUtil } from "./comm-util.js";

const runner = new TestRunner();

runner.test("CommUtil can be instantiated", () => {
  const commUtil = new CommUtil();
  expect.toBeDefined(commUtil, "CommUtil instance should be created");
  expect.toBeType(commUtil.communicate, "function", "Should have communicate method");
});

runner.test("CommUtil.communicate throws when no server address is defined", async () => {
  const commUtil = new CommUtil();
  // The method is async and throws via Assert.assert
  // We need to await the promise rejection
  try {
    await commUtil.communicate("/test", "GET", {});
    throw new Error("Should have thrown");
  } catch (error) {
    expect.toBeType(error.message, "string", "Error should have a message property");
    expect.toBeTruthy(
      error.message.includes("No server address defined"),
      "Error message should mention server address",
    );
  }
});

// Note: Full integration tests for CommUtil.communicate would require
// a running server and fetch API, which is beyond unit test scope.
// The method is tested for its assertion behavior above.

// Run all tests
runner.run();
