import { Platform } from "../platform.js";
import { TestRunner, expect } from "../test/test-runner.js";
import { BrowserFileStore } from "./browser-file-store.js";

const runner = new TestRunner();

runner.test(
  "BrowserFileStore should export an empty object in Node.js environment",
  () => {
    if (Platform.isNode()) {
      expect.toBe(
        Object.keys(BrowserFileStore).length,
        0,
        "BrowserFileStore should be an empty object in Node.js",
      );
    } else {
      // In a browser environment, BrowserFileStore should not be empty
      expect.toBeGreaterThan(
        Object.keys(BrowserFileStore).length,
        0,
        "BrowserFileStore should not be an empty object in a browser environment",
      );
    }
  },
);

runner.run();
