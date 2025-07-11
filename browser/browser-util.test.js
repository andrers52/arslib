import { strict as assert } from "assert";
import { Platform } from "../platform.js";
import { BrowserUtil } from "./browser-util.js";

describe("BrowserUtil", function() {
  it("should export an empty object in Node.js environment", function() {
    if (Platform.isNode()) {
      assert.strictEqual(
        Object.keys(BrowserUtil).length,
        0,
        "BrowserUtil should be an empty object in Node.js"
      );
    } else {
      assert.ok(
        true,
        "Test assertion for Node.js behavior skipped in non-Node.js environment"
      );
    }
  });
});
