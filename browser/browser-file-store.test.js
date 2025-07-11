import { strict as assert } from "assert";
import { Platform } from "../platform.js";
import { BrowserFileStore } from "./browser-file-store.js";

describe("BrowserFileStore", function() {
  it("should export an empty object in Node.js environment", function() {
    if (Platform.isNode()) {
      assert.strictEqual(
        Object.keys(BrowserFileStore).length,
        0,
        "BrowserFileStore should be an empty object in Node.js"
      );
    } else {
      // In a browser environment, BrowserFileStore should not be empty
      assert.ok(
        Object.keys(BrowserFileStore).length > 0,
        "BrowserFileStore should not be an empty object in a browser environment"
      );
    }
  });
});
