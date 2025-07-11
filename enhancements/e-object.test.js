import { strict as assert } from "assert";
import { EObject } from "./e-object.js";

describe("EObject.isEmpty works correctly", function() {
  it("should work", function() {
    assert.ok(
      EObject.isEmpty({}),
      "Empty object literal should be empty"
    );
    assert.ok(
      !EObject.isEmpty({ a: 1 }),
      "Object with properties should not be empty"
    );
    assert.ok(
      !EObject.isEmpty({ prop: "value" }),
      "Object with string property should not be empty"
    );
    assert.ok(
      EObject.isEmpty(new Object()),
      "New empty Object() should be empty"
    );
  });
});

describe("EObject.swapObjectKeysAndValues swaps keys and values", function() {
  it("should work", function() {
    const original = { a: "1", b: "2", c: "3" };
    const swapped = EObject.swapObjectKeysAndValues(original);

    assert.strictEqual(swapped["1"], "a", "Value '1' should become key with value 'a'");
    assert.strictEqual(swapped["2"], "b", "Value '2' should become key with value 'b'");
    assert.strictEqual(swapped["3"], "c", "Value '3' should become key with value 'c'");

    assert.strictEqual(
      typeof EObject.swapObjectKeysAndValues({}),
      "object",
      "Swapping empty object should return object"
    );
    assert.ok(
      EObject.isEmpty(EObject.swapObjectKeysAndValues({})),
      "Swapped empty object should remain empty"
    );
  });
});

describe("EObject.hasSameProperties compares objects correctly", function() {
  it("should work", function() {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 1, b: 2 };
    const obj3 = { a: 1, b: 3 };
    const obj4 = { a: 1 };

    assert.ok(
      EObject.hasSameProperties(obj1, obj2),
      "Objects with same properties and values should be equal"
    );
    assert.ok(
      !EObject.hasSameProperties(obj1, obj3),
      "Objects with same keys but different values should not be equal"
    );
    assert.ok(
      !EObject.hasSameProperties(obj1, obj4),
      "Objects with different number of properties should not be equal"
    );
    assert.ok(
      !EObject.hasSameProperties("string", obj1),
      "String compared to object should not be equal"
    );
    assert.ok(
      !EObject.hasSameProperties(obj1, "string"),
      "Object compared to string should not be equal"
    );

    const nested1 = { a: { x: 1, y: 2 }, b: 3 };
    const nested2 = { a: { x: 1, y: 2 }, b: 3 };
    const nested3 = { a: { x: 1, y: 3 }, b: 3 };

    assert.ok(
      EObject.hasSameProperties(nested1, nested2),
      "Nested objects with same structure should be equal"
    );
    assert.ok(
      !EObject.hasSameProperties(nested1, nested3),
      "Nested objects with different values should not be equal"
    );
  });
});

describe("EObject.extend merges objects correctly", function() {
  it("should work", function() {
    const target = { a: 1, b: { x: 1 } };
    const source = { b: { y: 2 }, c: 3 };

    const result = EObject.extend(target, source);

    assert.strictEqual(result, target, "Extend should return the target object");
    assert.strictEqual(target.a, 1, "Original property 'a' should be preserved");
    assert.strictEqual(target.c, 3, "New property 'c' should be added");
    assert.strictEqual(target.b.x, 1, "Nested property 'b.x' should be preserved");
    assert.strictEqual(target.b.y, 2, "Nested property 'b.y' should be added");

    const simple1 = { a: 1 };
    const simple2 = { b: 2 };
    EObject.extend(simple1, simple2);
    assert.strictEqual(simple1.a, 1, "Original property should be preserved in simple extension");
    assert.strictEqual(simple1.b, 2, "New property should be added in simple extension");
  });
});

describe("EObject.extend handles edge cases", function() {
  it("should work", function() {
    const target = {};
    const source = { a: 1, b: "string", c: null };

    EObject.extend(target, source);
    assert.strictEqual(target.a, 1, "Number property should be copied");
    assert.strictEqual(target.b, "string", "String property should be copied");
    assert.strictEqual(target.c, null, "Null property should be copied");
  });
});