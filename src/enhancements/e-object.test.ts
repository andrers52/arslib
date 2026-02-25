import { TestRunner, expect } from "../test/test-runner.js";
import { EObject } from "./e-object.js";

const runner = new TestRunner();

runner.test("EObject.isEmpty works correctly", () => {
  expect.toBeTruthy(
    EObject.isEmpty({}),
    "Empty object literal should be empty",
  );
  expect.toBeFalsy(
    EObject.isEmpty({ a: 1 }),
    "Object with properties should not be empty",
  );
  expect.toBeFalsy(
    EObject.isEmpty({ prop: "value" }),
    "Object with string property should not be empty",
  );
  expect.toBeTruthy(
    EObject.isEmpty(new Object()),
    "New empty Object() should be empty",
  );
});

runner.test("EObject.swapObjectKeysAndValues swaps keys and values", () => {
  const original = { a: "1", b: "2", c: "3" };
  const swapped = EObject.swapObjectKeysAndValues(original);

  expect.toBe(swapped["1"], "a", "Value '1' should become key with value 'a'");
  expect.toBe(swapped["2"], "b", "Value '2' should become key with value 'b'");
  expect.toBe(swapped["3"], "c", "Value '3' should become key with value 'c'");

  expect.toBeType(
    EObject.swapObjectKeysAndValues({}),
    "object",
    "Swapping empty object should return object",
  );
  expect.toBeTruthy(
    EObject.isEmpty(EObject.swapObjectKeysAndValues({})),
    "Swapped empty object should remain empty",
  );
});

runner.test("EObject.hasSameProperties compares objects correctly", () => {
  const obj1 = { a: 1, b: 2 };
  const obj2 = { a: 1, b: 2 };
  const obj3 = { a: 1, b: 3 };
  const obj4 = { a: 1 };

  expect.toBeTruthy(
    EObject.hasSameProperties(obj1, obj2),
    "Objects with same properties and values should be equal",
  );
  expect.toBeFalsy(
    EObject.hasSameProperties(obj1, obj3),
    "Objects with same keys but different values should not be equal",
  );
  expect.toBeFalsy(
    EObject.hasSameProperties(obj1, obj4),
    "Objects with different number of properties should not be equal",
  );

  expect.toBeFalsy(
    EObject.hasSameProperties("string", obj1),
    "String compared to object should not be equal",
  );
  expect.toBeFalsy(
    EObject.hasSameProperties(obj1, "string"),
    "Object compared to string should not be equal",
  );

  const nested1 = { a: { x: 1, y: 2 }, b: 3 };
  const nested2 = { a: { x: 1, y: 2 }, b: 3 };
  const nested3 = { a: { x: 1, y: 3 }, b: 3 };

  expect.toBeTruthy(
    EObject.hasSameProperties(nested1, nested2),
    "Nested objects with same structure should be equal",
  );
  expect.toBeFalsy(
    EObject.hasSameProperties(nested1, nested3),
    "Nested objects with different values should not be equal",
  );
});

runner.test("EObject.extend merges objects correctly", () => {
  const target = { a: 1, b: { x: 1 } };
  const source = { b: { y: 2 }, c: 3 };

  const result = EObject.extend(target, source);

  expect.toBe(result, target, "Extend should return the target object");
  expect.toBe(target.a, 1, "Original property 'a' should be preserved");
  expect.toBe(target.c, 3, "New property 'c' should be added");
  expect.toBe(target.b.x, 1, "Nested property 'b.x' should be preserved");
  expect.toBe(target.b.y, 2, "Nested property 'b.y' should be added");

  const simple1 = { a: 1 };
  const simple2 = { b: 2 };
  EObject.extend(simple1, simple2);
  expect.toBe(
    simple1.a,
    1,
    "Original property should be preserved in simple extension",
  );
  expect.toBe(simple1.b, 2, "New property should be added in simple extension");
});

runner.test("EObject.extend handles edge cases", () => {
  const target = {};
  const source = { a: 1, b: "string", c: null };

  EObject.extend(target, source);
  expect.toBe(target.a, 1, "Number property should be copied");
  expect.toBe(target.b, "string", "String property should be copied");
  expect.toBeNull(target.c, "Null property should be copied");
});

// Run all tests
runner.run();
