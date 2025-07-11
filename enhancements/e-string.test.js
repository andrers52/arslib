import { strict as assert } from "assert";
import { EString } from "./e-string.js";

describe("EString.capitalize works correctly", function() {
  it("should work", function() {
    assert.strictEqual(
      EString.capitalize("hello"),
      "Hello",
      "Should capitalize first letter of lowercase string"
    );
    assert.strictEqual(
      EString.capitalize("WORLD"),
      "WORLD",
      "Should not change already capitalized string"
    );
    assert.strictEqual(
      EString.capitalize("test"),
      "Test",
      "Should capitalize 't' to 'T'"
    );
    assert.strictEqual(
      EString.capitalize("a"),
      "A",
      "Should capitalize single character"
    );
    assert.strictEqual(
      EString.capitalize(""),
      "",
      "Should handle empty string"
    );
  });
});

describe("EString.replaceAll replaces all occurrences", function() {
  it("should work", function() {
    assert.strictEqual(
      EString.replaceAll("hello world hello", "hello", "hi"),
      "hi world hi",
      "Should replace all instances of 'hello' with 'hi'"
    );
    assert.strictEqual(
      EString.replaceAll("test test test", "test", "demo"),
      "demo demo demo",
      "Should replace all instances of 'test' with 'demo'"
    );
    assert.strictEqual(
      EString.replaceAll("no match", "xyz", "abc"),
      "no match",
      "Should return original string when no matches found"
    );
    assert.strictEqual(
      EString.replaceAll("", "a", "b"),
      "",
      "Should handle empty string"
    );
    assert.strictEqual(
      EString.replaceAll("aaa", "a", ""),
      "",
      "Should replace all 'a' characters with empty string"
    );
  });
});

describe("EString.createHash generates consistent hashes", function() {
  it("should work", function() {
    const hash1 = EString.createHash("test");
    const hash2 = EString.createHash("test");
    assert.strictEqual(
      hash1,
      hash2,
      "Same input should generate same hash"
    );

    const hash3 = EString.createHash("different");
    assert.strictEqual(
      typeof hash3,
      "string",
      "Hash should be a string"
    );

    assert.strictEqual(
      EString.createHash("") ,
      "0",
      "Empty string should hash to '0'"
    );

    assert.notStrictEqual(
      EString.createHash("a"),
      EString.createHash("b"),
      "Different strings should produce different hashes"
    );
  });
});