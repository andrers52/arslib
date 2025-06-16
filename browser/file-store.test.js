import { Platform } from "../platform.js";
import { TestRunner, expect } from "../test/test-runner.js";
import { FileStore } from "./file-store.js";

const runner = new TestRunner();

runner.test(
  "FileStore should export an empty object in Node.js environment",
  () => {
    if (Platform.isNode()) {
      expect.toBe(
        Object.keys(FileStore).length,
        0,
        "FileStore should be an empty object in Node.js",
      );
    } else {
      // In a browser environment, FileStore should not be empty
      expect.toBeGreaterThan(
        Object.keys(FileStore).length,
        0,
        "FileStore should not be an empty object in a browser environment",
      );
    }
  },
);

runner.run();
