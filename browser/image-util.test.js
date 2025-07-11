import { Platform } from "../platform.js";
import { strict as assert } from "assert";
import { ImageUtil } from "./image-util.js";

describe("ImageUtil", function() {
  it("should export an empty object in Node.js environment", function() {
    if (Platform.isNode()) {
      assert.strictEqual(
        Object.keys(ImageUtil).length,
        0,
        "ImageUtil should be an empty object in Node.js"
      );
    } else {
      // In a browser environment, ImageUtil should not be empty
      // We expect at least createCanvas, createPieGraph, and createPieGraphWithEvenlyDistributedColors
      assert.ok(
        Object.keys(ImageUtil).length >= 3,
        "ImageUtil should not be an empty object in a browser environment and should have at least 3 properties"
      );
    }
  });
});
