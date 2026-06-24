import { Platform } from "../platform.js";
import { TestRunner, expect } from "../test/test-runner.js";
import { BrowserFileStore } from "./browser-file-store.js";

const runner = new TestRunner();

// ---------------------------------------------------------------------------
//  API shape — static methods must exist regardless of environment
// ---------------------------------------------------------------------------
runner.test("BrowserFileStore exposes isAvailable, putFile, getFile as functions", () => {
  expect.toBe(
    typeof BrowserFileStore.isAvailable,
    "function",
    "isAvailable should be a function",
  );
  expect.toBe(
    typeof BrowserFileStore.putFile,
    "function",
    "putFile should be a function",
  );
  expect.toBe(
    typeof BrowserFileStore.getFile,
    "function",
    "getFile should be a function",
  );
});

// ---------------------------------------------------------------------------
//  Non-browser degradation (Node.js)
// ---------------------------------------------------------------------------
runner.test("BrowserFileStore degrades gracefully in Node.js", () => {
  if (!Platform.isNode()) return; // only meaningful outside a browser

  expect.toBe(
    BrowserFileStore.isAvailable(),
    false,
    "isAvailable() should return false when there is no window",
  );

  // putFile / getFile must not throw — they invoke errorCallback instead.
  let putErr: unknown = undefined;
  BrowserFileStore.putFile("key", new Blob(["hi"]), undefined, (err) => {
    putErr = err;
  });
  expect.toBe(putErr !== undefined, true, "putFile should call errorCallback in Node");

  let getErr: unknown = undefined;
  BrowserFileStore.getFile("key", undefined, (err) => {
    getErr = err;
  });
  expect.toBe(getErr !== undefined, true, "getFile should call errorCallback in Node");
});

runner.run();
