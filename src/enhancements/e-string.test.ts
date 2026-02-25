import { TestRunner, expect } from "../test/test-runner.js";
import { EString } from "./e-string.js";

const runner = new TestRunner();

runner.test("EString.capitalize works correctly", () => {
  expect.toBe(
    EString.capitalize("hello"),
    "Hello",
    "Should capitalize first letter of lowercase string",
  );
  expect.toBe(
    EString.capitalize("WORLD"),
    "WORLD",
    "Should not change already capitalized string",
  );
  expect.toBe(
    EString.capitalize("test"),
    "Test",
    "Should capitalize 't' to 'T'",
  );
  expect.toBe(
    EString.capitalize("a"),
    "A",
    "Should capitalize single character",
  );
  expect.toBe(EString.capitalize(""), "", "Should handle empty string");
});

runner.test("EString.replaceAll replaces all occurrences", () => {
  expect.toBe(
    EString.replaceAll("hello world hello", "hello", "hi"),
    "hi world hi",
    "Should replace all instances of 'hello' with 'hi'",
  );
  expect.toBe(
    EString.replaceAll("test test test", "test", "demo"),
    "demo demo demo",
    "Should replace all instances of 'test' with 'demo'",
  );
  expect.toBe(
    EString.replaceAll("no match", "xyz", "abc"),
    "no match",
    "Should return original string when no matches found",
  );
  expect.toBe(
    EString.replaceAll("", "a", "b"),
    "",
    "Should handle empty string",
  );
  expect.toBe(
    EString.replaceAll("aaa", "a", ""),
    "",
    "Should replace all 'a' characters with empty string",
  );
});

runner.test("EString.createHash generates consistent hashes", () => {
  const hash1 = EString.createHash("test");
  const hash2 = EString.createHash("test");
  expect.toBe(hash1, hash2, "Same input should generate same hash");

  const hash3 = EString.createHash("different");
  expect.toBe(typeof hash3, "string", "Hash should be a string");

  expect.toBe(EString.createHash(""), "0", "Empty string should hash to '0'");

  expect.toBe(
    EString.createHash("a") !== EString.createHash("b"),
    true,
    "Different strings should produce different hashes",
  );
});

// Run all tests
runner.run();
