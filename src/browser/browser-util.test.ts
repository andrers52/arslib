import { TestRunner, expect } from "../test/test-runner.js";
import { Platform } from "../platform.js";
import { BrowserUtil } from "./browser-util.js";

const runner = new TestRunner();

// BrowserUtil is only available in browser environments
if (Platform.isBrowser()) {
  runner.test("BrowserUtil.supportedVideoFormat returns a string", () => {
    const video = document.createElement("video");
    const result = BrowserUtil.supportedVideoFormat(video);
    expect.toBeType(result, "string", "Should return a string");
    // Result can be 'webm', 'mp4', 'ogg', or empty string
    expect.toBeTruthy(
      result === "" || result === "webm" || result === "mp4" || result === "ogg",
      "Should return valid video format extension or empty string",
    );
  });

  runner.test("BrowserUtil.fullScreen can be called without errors", () => {
    expect.toDoesNotThrow(
      () => BrowserUtil.fullScreen(),
      "Should not throw when requesting fullscreen",
    );
  });

  runner.test("BrowserUtil.lockOrientation handles orientation locking", () => {
    // This may return null if not supported, but should not throw
    const result = BrowserUtil.lockOrientation("landscape");
    expect.toBeTruthy(
      result === null || typeof result === "boolean",
      "Should return boolean or null",
    );
  });

  runner.test("BrowserUtil.download can be called without errors", () => {
    expect.toDoesNotThrow(
      () => BrowserUtil.download("test.txt", "test content"),
      "Should not throw when triggering download",
    );
  });

  runner.test("BrowserUtil.requestAnimationFrame is defined", () => {
    expect.toBeDefined(
      window.requestAnimationFrame,
      "requestAnimationFrame should be polyfilled",
    );
  });

  runner.test("BrowserUtil.cancelAnimationFrame is defined", () => {
    expect.toBeDefined(
      window.cancelAnimationFrame,
      "cancelAnimationFrame should be polyfilled",
    );
  });
} else {
  // In Node.js environment, BrowserUtil should be an empty object
  runner.test("BrowserUtil is empty object in Node.js environment", () => {
    expect.toBeType(BrowserUtil, "object", "BrowserUtil should be an object");
    expect.toBe(
      Object.keys(BrowserUtil).length,
      0,
      "BrowserUtil should have no properties in Node.js",
    );
  });
}

// Run all tests
runner.run();
