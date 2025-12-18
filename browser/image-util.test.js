import { Platform } from "../platform.js";
import { TestRunner, expect } from "../test/test-runner.js";
import { ImageUtil } from "./image-util.js";

const runner = new TestRunner();

runner.test(
  "ImageUtil should export an empty object in Node.js environment",
  () => {
    if (Platform.isNode()) {
      expect.toBe(
        Object.keys(ImageUtil).length,
        0,
        "ImageUtil should be an empty object in Node.js",
      );
    } else {
      // In a browser environment, ImageUtil should not be empty
      // We expect at least createCanvas, createPieGraph, and createPieGraphWithEvenlyDistributedColors
      expect.toBeGreaterThanOrEqual(
        Object.keys(ImageUtil).length,
        3,
        "ImageUtil should not be an empty object in a browser environment and should have at least 3 properties",
      );
    }
  },
);

runner.run();
