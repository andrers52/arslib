import { Platform } from "../platform.js";
import { TestRunner, expect } from "../test/test-runner.js";
import { BrowserUtil } from "./browser-util.js";

const runner = new TestRunner();

runner.test(
  "BrowserUtil should export an empty object in Node.js environment",
  () => {
    if (Platform.isNode()) {
      expect.toBe(
        Object.keys(BrowserUtil).length,
        0,
        "BrowserUtil should be an empty object in Node.js",
      );
    } else {
      expect.toBeTruthy(
        true,
        "Test assertion for Node.js behavior skipped in non-Node.js environment",
      );
    }
  },
);

runner.run();
