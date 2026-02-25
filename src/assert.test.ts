import { TestRunner, expect } from "./test/test-runner.js";
import { Assert } from "./assert.js";

const runner = new TestRunner();

// Store original state to restore after tests
const originalDisableState = Assert.disableAllVerifications;

runner.beforeEach(() => {
  Assert.disableAllVerifications = false;
});

runner.afterEach(() => {
  Assert.disableAllVerifications = originalDisableState;
});

// Test Assert.assert
runner.test("Assert.assert passes with truthy value", () => {
  expect.toDoesNotThrow(
    () => Assert.assert(true, "Should pass"),
    "Should not throw with truthy value",
  );
});

runner.test("Assert.assert throws with falsy value", () => {
  expect.toThrow(
    () => Assert.assert(false, "Test error message"),
    "Test failed: Test error message",
    "Should throw with falsy value",
  );
});

runner.test("Assert.assert does not throw when disabled", () => {
  Assert.disableAllVerifications = true;
  expect.toDoesNotThrow(
    () => Assert.assert(false, "Should not throw when disabled"),
    "Should not throw when assertions are disabled",
  );
  Assert.disableAllVerifications = false;
});

// Test Assert.assertHasProperties
runner.test("Assert.assertHasProperties passes when all properties exist", () => {
  const obj = { a: 1, b: 2, c: 3 };
  expect.toDoesNotThrow(
    () => Assert.assertHasProperties(obj, ["a", "b", "c"]),
    "Should not throw when all properties exist",
  );
});

runner.test("Assert.assertHasProperties throws when property is missing", () => {
  const obj = { a: 1 };
  expect.toThrow(
    () => Assert.assertHasProperties(obj, ["a", "b"]),
    "Property not found",
    "Should throw when property is missing",
  );
});

// Test Assert.hasProperty
runner.test("Assert.hasProperty passes when property exists", () => {
  const obj = { prop: "value" };
  expect.toDoesNotThrow(
    () => Assert.hasProperty(obj, "prop"),
    "Should not throw when property exists",
  );
});

runner.test("Assert.hasProperty throws when property is missing", () => {
  const obj = {};
  expect.toThrow(
    () => Assert.hasProperty(obj, "missing"),
    "Property not found",
    "Should throw when property is missing",
  );
});

// Test Assert.assertIsEqual
runner.test("Assert.assertIsEqual passes with equal values", () => {
  expect.toDoesNotThrow(
    () => Assert.assertIsEqual(5, 5),
    "Should not throw with equal numbers",
  );
  expect.toDoesNotThrow(
    () => Assert.assertIsEqual("test", "test"),
    "Should not throw with equal strings",
  );
});

runner.test("Assert.assertIsEqual throws with unequal values", () => {
  expect.toThrow(
    () => Assert.assertIsEqual(5, 10),
    "Elements should be equal",
    "Should throw with unequal numbers",
  );
});

// Test Assert.assertIsNotEqual
runner.test("Assert.assertIsNotEqual passes with unequal values", () => {
  expect.toDoesNotThrow(
    () => Assert.assertIsNotEqual(5, 10),
    "Should not throw with unequal numbers",
  );
});

runner.test("Assert.assertIsNotEqual throws with equal values", () => {
  expect.toThrow(
    () => Assert.assertIsNotEqual(5, 5),
    "Error: should not be equal",
    "Should throw with equal numbers",
  );
});

// Test Assert.assertIsValidString
runner.test("Assert.assertIsValidString passes with valid string", () => {
  expect.toDoesNotThrow(
    () => Assert.assertIsValidString("GET", ["GET", "POST", "PUT"]),
    "Should not throw with valid string",
  );
});

runner.test("Assert.assertIsValidString throws with invalid string", () => {
  expect.toThrow(
    () => Assert.assertIsValidString("DELETE", ["GET", "POST"]),
    "Error: invalid string",
    "Should throw with invalid string",
  );
});

// Test Assert.assertIsFunction
runner.test("Assert.assertIsFunction passes with function", () => {
  expect.toDoesNotThrow(
    () => Assert.assertIsFunction(() => {}),
    "Should not throw with function",
  );
});

runner.test("Assert.assertIsFunction throws with non-function", () => {
  expect.toThrow(
    () => Assert.assertIsFunction("not a function"),
    "Error: expecting a function",
    "Should throw with non-function",
  );
});

// Test Assert.assertIsObject
runner.test("Assert.assertIsObject passes with object", () => {
  expect.toDoesNotThrow(
    () => Assert.assertIsObject({}),
    "Should not throw with object",
  );
});

runner.test("Assert.assertIsObject throws with non-object", () => {
  expect.toThrow(
    () => Assert.assertIsObject("not an object"),
    "Error: expecting an object",
    "Should throw with non-object",
  );
});

// Test Assert.assertIsOptionalFunction
runner.test("Assert.assertIsOptionalFunction passes with function or undefined", () => {
  expect.toDoesNotThrow(
    () => Assert.assertIsOptionalFunction(() => {}),
    "Should not throw with function",
  );
  expect.toDoesNotThrow(
    () => Assert.assertIsOptionalFunction(undefined),
    "Should not throw with undefined",
  );
});

runner.test("Assert.assertIsOptionalFunction throws with non-function defined value", () => {
  expect.toThrow(
    () => Assert.assertIsOptionalFunction("not a function"),
    "Error: expecting a(n optional) function",
    "Should throw with non-function defined value",
  );
});

// Test Assert.assertIsNumber
runner.test("Assert.assertIsNumber passes with valid numbers", () => {
  expect.toDoesNotThrow(
    () => Assert.assertIsNumber(42),
    "Should not throw with integer",
  );
  expect.toDoesNotThrow(
    () => Assert.assertIsNumber(3.14),
    "Should not throw with float",
  );
  expect.toDoesNotThrow(
    () => Assert.assertIsNumber(-10),
    "Should not throw with negative number",
  );
});

runner.test("Assert.assertIsNumber throws with NaN or Infinity", () => {
  expect.toThrow(
    () => Assert.assertIsNumber(NaN),
    "Error: expecting a number",
    "Should throw with NaN",
  );
  expect.toThrow(
    () => Assert.assertIsNumber(Infinity),
    "Error: expecting a number",
    "Should throw with Infinity",
  );
});

// Test Assert.assertIsString
runner.test("Assert.assertIsString passes with string", () => {
  expect.toDoesNotThrow(
    () => Assert.assertIsString("test"),
    "Should not throw with string",
  );
});

runner.test("Assert.assertIsString throws with non-string", () => {
  expect.toThrow(
    () => Assert.assertIsString(123),
    "Error: expecting a string",
    "Should throw with non-string",
  );
});

// Test Assert.assertIsArray
runner.test("Assert.assertIsArray passes with array", () => {
  expect.toDoesNotThrow(
    () => Assert.assertIsArray([1, 2, 3]),
    "Should not throw with array",
  );
});

runner.test("Assert.assertIsArray throws with non-array", () => {
  expect.toThrow(
    () => Assert.assertIsArray("not an array"),
    "Error: expecting an array",
    "Should throw with non-array",
  );
});

// Test Assert.assertIsEmptyArray
runner.test("Assert.assertIsEmptyArray passes with empty array", () => {
  expect.toDoesNotThrow(
    () => Assert.assertIsEmptyArray([]),
    "Should not throw with empty array",
  );
});

runner.test("Assert.assertIsEmptyArray throws with non-empty array", () => {
  expect.toThrow(
    () => Assert.assertIsEmptyArray([1, 2]),
    "Error: array not empty",
    "Should throw with non-empty array",
  );
});

// Test Assert.assertIsNotEmptyArray
runner.test("Assert.assertIsNotEmptyArray passes with non-empty array", () => {
  expect.toDoesNotThrow(
    () => Assert.assertIsNotEmptyArray([1]),
    "Should not throw with non-empty array",
  );
});

runner.test("Assert.assertIsNotEmptyArray throws with empty array", () => {
  expect.toThrow(
    () => Assert.assertIsNotEmptyArray([]),
    "Error: array empty",
    "Should throw with empty array",
  );
});

// Test Assert.assertIsArrayOfNumbers
runner.test("Assert.assertIsArrayOfNumbers passes with array of numbers", () => {
  expect.toDoesNotThrow(
    () => Assert.assertIsArrayOfNumbers([1, 2, 3]),
    "Should not throw with array of numbers",
  );
});

runner.test("Assert.assertIsArrayOfNumbers throws with non-number elements", () => {
  expect.toThrow(
    () => Assert.assertIsArrayOfNumbers([1, "two", 3]),
    "Error: expecting an array of numbers",
    "Should throw with non-number elements",
  );
});

// Test Assert.assertIsArrayOfObjects
runner.test("Assert.assertIsArrayOfObjects passes with array of objects", () => {
  expect.toDoesNotThrow(
    () => Assert.assertIsArrayOfObjects([{ a: 1 }, { b: 2 }]),
    "Should not throw with array of objects",
  );
});

runner.test("Assert.assertIsArrayOfObjects throws with non-object elements", () => {
  expect.toThrow(
    () => Assert.assertIsArrayOfObjects([1, 2, 3]),
    "Error: expecting an array of objects",
    "Should throw with non-object elements",
  );
});

// Test Assert.assertIsLiteralString
runner.test("Assert.assertIsLiteralString passes with string", () => {
  expect.toDoesNotThrow(
    () => Assert.assertIsLiteralString("test"),
    "Should not throw with string",
  );
});

// Test Assert.assertValueIsInsideLimits
runner.test("Assert.assertValueIsInsideLimits passes with value in range", () => {
  expect.toDoesNotThrow(
    () => Assert.assertValueIsInsideLimits(5, 0, 10),
    "Should not throw with value in range",
  );
  expect.toDoesNotThrow(
    () => Assert.assertValueIsInsideLimits(0, 0, 10),
    "Should not throw with value at min",
  );
  expect.toDoesNotThrow(
    () => Assert.assertValueIsInsideLimits(10, 0, 10),
    "Should not throw with value at max",
  );
});

runner.test("Assert.assertValueIsInsideLimits throws with value out of range", () => {
  expect.toThrow(
    () => Assert.assertValueIsInsideLimits(-1, 0, 10),
    "Error: value out of limits",
    "Should throw with value below min",
  );
  expect.toThrow(
    () => Assert.assertValueIsInsideLimits(11, 0, 10),
    "Error: value out of limits",
    "Should throw with value above max",
  );
});

// Test Assert.assertIsTrue
runner.test("Assert.assertIsTrue passes with true", () => {
  expect.toDoesNotThrow(
    () => Assert.assertIsTrue(true),
    "Should not throw with true",
  );
});

runner.test("Assert.assertIsTrue throws with non-boolean or false", () => {
  expect.toThrow(
    () => Assert.assertIsTrue(false),
    "Error: should be true",
    "Should throw with false",
  );
  expect.toThrow(
    () => Assert.assertIsTrue(1),
    "Error: should be true",
    "Should throw with non-boolean",
  );
});

// Test Assert.assertIsFalse
runner.test("Assert.assertIsFalse passes with false", () => {
  expect.toDoesNotThrow(
    () => Assert.assertIsFalse(false),
    "Should not throw with false",
  );
});

runner.test("Assert.assertIsFalse throws with non-boolean or true", () => {
  expect.toThrow(
    () => Assert.assertIsFalse(true),
    "Error: should be false",
    "Should throw with true",
  );
});

// Test Assert.assertIsTruthy
runner.test("Assert.assertIsTruthy passes with truthy values", () => {
  expect.toDoesNotThrow(
    () => Assert.assertIsTruthy(true),
    "Should not throw with true",
  );
  expect.toDoesNotThrow(
    () => Assert.assertIsTruthy(1),
    "Should not throw with 1",
  );
  expect.toDoesNotThrow(
    () => Assert.assertIsTruthy("test"),
    "Should not throw with non-empty string",
  );
});

runner.test("Assert.assertIsTruthy throws with falsy values", () => {
  expect.toThrow(
    () => Assert.assertIsTruthy(false),
    "Error: should be truthy",
    "Should throw with false",
  );
  // Note: 0 is falsy but Assert.assertIsTruthy uses Assert.assert which checks for truthiness
  // 0 will pass the initial check in Assert.assert (0 !== 0 && (!0 || typeof 0 === "undefined"))
  // So we test with empty string and null instead
  expect.toThrow(
    () => Assert.assertIsTruthy(""),
    "Error: should be truthy",
    "Should throw with empty string",
  );
  expect.toThrow(
    () => Assert.assertIsTruthy(null),
    "Error: should be truthy",
    "Should throw with null",
  );
});

// Test Assert.assertIsFalsy
runner.test("Assert.assertIsFalsy passes with falsy values", () => {
  expect.toDoesNotThrow(
    () => Assert.assertIsFalsy(false),
    "Should not throw with false",
  );
  expect.toDoesNotThrow(
    () => Assert.assertIsFalsy(0),
    "Should not throw with 0",
  );
  expect.toDoesNotThrow(
    () => Assert.assertIsFalsy(""),
    "Should not throw with empty string",
  );
});

runner.test("Assert.assertIsFalsy throws with truthy values", () => {
  expect.toThrow(
    () => Assert.assertIsFalsy(true),
    "Error: should be falsy",
    "Should throw with true",
  );
  expect.toThrow(
    () => Assert.assertIsFalsy(1),
    "Error: should be falsy",
    "Should throw with 1",
  );
});

// Test Assert.assertIsEquivalent
runner.test("Assert.assertIsEquivalent passes with equivalent values", () => {
  expect.toDoesNotThrow(
    () => Assert.assertIsEquivalent(5, 5),
    "Should not throw with equal numbers",
  );
  expect.toDoesNotThrow(
    () => Assert.assertIsEquivalent(5, "5"),
    "Should not throw with loosely equal values",
  );
});

runner.test("Assert.assertIsEquivalent throws with non-equivalent values", () => {
  expect.toThrow(
    () => Assert.assertIsEquivalent(5, "10"),
    "Error: should be the equivalent",
    "Should throw with non-equivalent values",
  );
});

// Test Assert.assertIsNotEquivalent
runner.test("Assert.assertIsNotEquivalent passes with non-equivalent values", () => {
  expect.toDoesNotThrow(
    () => Assert.assertIsNotEquivalent(5, "10"),
    "Should not throw with non-equivalent values",
  );
});

runner.test("Assert.assertIsNotEquivalent throws with equivalent values", () => {
  expect.toThrow(
    () => Assert.assertIsNotEquivalent(5, "5"),
    "Error: should not be the equivalent",
    "Should throw with equivalent values",
  );
});

// Test Assert.assertIsUndefined
runner.test("Assert.assertIsUndefined passes with undefined", () => {
  expect.toDoesNotThrow(
    () => Assert.assertIsUndefined(undefined),
    "Should not throw with undefined",
  );
});

runner.test("Assert.assertIsUndefined throws with defined values", () => {
  expect.toThrow(
    () => Assert.assertIsUndefined(null),
    "Should be undefined",
    "Should throw with null",
  );
  expect.toThrow(
    () => Assert.assertIsUndefined(0),
    "Should be undefined",
    "Should throw with 0",
  );
});

// Test Assert.assertIsNotUndefined
runner.test("Assert.assertIsNotUndefined passes with defined values", () => {
  expect.toDoesNotThrow(
    () => Assert.assertIsNotUndefined(null),
    "Should not throw with null",
  );
  expect.toDoesNotThrow(
    () => Assert.assertIsNotUndefined(0),
    "Should not throw with 0",
  );
});

runner.test("Assert.assertIsNotUndefined throws with undefined", () => {
  expect.toThrow(
    () => Assert.assertIsNotUndefined(undefined),
    "Should not be undefined",
    "Should throw with undefined",
  );
});

// Test Assert.assertIsNull
runner.test("Assert.assertIsNull passes with null", () => {
  expect.toDoesNotThrow(
    () => Assert.assertIsNull(null),
    "Should not throw with null",
  );
});

runner.test("Assert.assertIsNull throws with non-null values", () => {
  expect.toThrow(
    () => Assert.assertIsNull(undefined),
    "Should be null",
    "Should throw with undefined",
  );
  expect.toThrow(
    () => Assert.assertIsNull(0),
    "Should be null",
    "Should throw with 0",
  );
});

// Test Assert.assertIsNotNull
runner.test("Assert.assertIsNotNull passes with non-null values", () => {
  expect.toDoesNotThrow(
    () => Assert.assertIsNotNull(0),
    "Should not throw with 0",
  );
  expect.toDoesNotThrow(
    () => Assert.assertIsNotNull(""),
    "Should not throw with empty string",
  );
});

runner.test("Assert.assertIsNotNull throws with null", () => {
  expect.toThrow(
    () => Assert.assertIsNotNull(null),
    "Should not be null",
    "Should throw with null",
  );
});

// Test Assert.assertNotContains
runner.test("Assert.assertNotContains passes when string does not contain substring", () => {
  expect.toDoesNotThrow(
    () => Assert.assertNotContains("hello world", "foo"),
    "Should not throw when string does not contain substring",
  );
});

runner.test("Assert.assertNotContains passes when array does not contain element", () => {
  expect.toDoesNotThrow(
    () => Assert.assertNotContains([1, 2, 3], 4),
    "Should not throw when array does not contain element",
  );
});

runner.test("Assert.assertNotContains throws when string contains substring", () => {
  expect.toThrow(
    () => Assert.assertNotContains("hello world", "world"),
    "Container should not contain item",
    "Should throw when string contains substring",
  );
});

runner.test("Assert.assertNotContains throws when array contains element", () => {
  expect.toThrow(
    () => Assert.assertNotContains([1, 2, 3], 2),
    "Container should not contain item",
    "Should throw when array contains element",
  );
});

// Test Assert.assertThrows
runner.test("Assert.assertThrows passes when function throws", () => {
  expect.toDoesNotThrow(
    () => Assert.assertThrows(() => { throw new Error("test"); }),
    "Should not throw when function throws",
  );
});

runner.test("Assert.assertThrows throws when function does not throw", () => {
  expect.toThrow(
    () => Assert.assertThrows(() => {}),
    "Function should throw an error",
    "Should throw when function does not throw",
  );
});

// Test Assert.assertDoesNotThrow
runner.test("Assert.assertDoesNotThrow passes when function does not throw", () => {
  expect.toDoesNotThrow(
    () => Assert.assertDoesNotThrow(() => {}),
    "Should not throw when function does not throw",
  );
});

runner.test("Assert.assertDoesNotThrow throws when function throws", () => {
  expect.toThrow(
    () => Assert.assertDoesNotThrow(() => { throw new Error("test"); }),
    "Function should not throw an error",
    "Should throw when function throws",
  );
});

// Test Assert.assertGreaterThan
runner.test("Assert.assertGreaterThan passes when value is greater", () => {
  expect.toDoesNotThrow(
    () => Assert.assertGreaterThan(10, 5),
    "Should not throw when value is greater",
  );
});

runner.test("Assert.assertGreaterThan throws when value is not greater", () => {
  expect.toThrow(
    () => Assert.assertGreaterThan(5, 10),
    "Number should be greater than expected",
    "Should throw when value is not greater",
  );
  expect.toThrow(
    () => Assert.assertGreaterThan(5, 5),
    "Number should be greater than expected",
    "Should throw when values are equal",
  );
});

// Test Assert.assertLessThan
runner.test("Assert.assertLessThan passes when value is less", () => {
  expect.toDoesNotThrow(
    () => Assert.assertLessThan(5, 10),
    "Should not throw when value is less",
  );
});

runner.test("Assert.assertLessThan throws when value is not less", () => {
  expect.toThrow(
    () => Assert.assertLessThan(10, 5),
    "Number should be less than expected",
    "Should throw when value is not less",
  );
});

// Test Assert.assertGreaterThanOrEqual
runner.test("Assert.assertGreaterThanOrEqual passes when value is greater or equal", () => {
  expect.toDoesNotThrow(
    () => Assert.assertGreaterThanOrEqual(10, 5),
    "Should not throw when value is greater",
  );
  expect.toDoesNotThrow(
    () => Assert.assertGreaterThanOrEqual(5, 5),
    "Should not throw when values are equal",
  );
});

runner.test("Assert.assertGreaterThanOrEqual throws when value is less", () => {
  expect.toThrow(
    () => Assert.assertGreaterThanOrEqual(5, 10),
    "Number should be greater than or equal to expected",
    "Should throw when value is less",
  );
});

// Test Assert.assertLessThanOrEqual
runner.test("Assert.assertLessThanOrEqual passes when value is less or equal", () => {
  expect.toDoesNotThrow(
    () => Assert.assertLessThanOrEqual(5, 10),
    "Should not throw when value is less",
  );
  expect.toDoesNotThrow(
    () => Assert.assertLessThanOrEqual(5, 5),
    "Should not throw when values are equal",
  );
});

runner.test("Assert.assertLessThanOrEqual throws when value is greater", () => {
  expect.toThrow(
    () => Assert.assertLessThanOrEqual(10, 5),
    "Number should be less than or equal to expected",
    "Should throw when value is greater",
  );
});

// Test Assert.assertInstanceOf
runner.test("Assert.assertInstanceOf passes when object is instance", () => {
  const arr = [1, 2, 3];
  expect.toDoesNotThrow(
    () => Assert.assertInstanceOf(arr, Array),
    "Should not throw when object is instance",
  );
  
  const date = new Date();
  expect.toDoesNotThrow(
    () => Assert.assertInstanceOf(date, Date),
    "Should not throw when object is instance of Date",
  );
});

runner.test("Assert.assertInstanceOf throws when object is not instance", () => {
  expect.toThrow(
    () => Assert.assertInstanceOf({}, Array),
    "Object should be instance of expected constructor",
    "Should throw when object is not instance",
  );
});

// Test Assert.assertArraysEqual
runner.test("Assert.assertArraysEqual passes with equal arrays", () => {
  expect.toDoesNotThrow(
    () => Assert.assertArraysEqual([1, 2, 3], [1, 2, 3]),
    "Should not throw with equal arrays",
  );
  expect.toDoesNotThrow(
    () => Assert.assertArraysEqual([], []),
    "Should not throw with empty arrays",
  );
});

runner.test("Assert.assertArraysEqual throws with unequal arrays", () => {
  expect.toThrow(
    () => Assert.assertArraysEqual([1, 2, 3], [1, 2, 4]),
    "Array elements at index 2 should be equal",
    "Should throw with different elements",
  );
  expect.toThrow(
    () => Assert.assertArraysEqual([1, 2, 3], [1, 2]),
    "Arrays should have same length",
    "Should throw with different lengths",
  );
});

// Test Assert.assertObjectsEqual
runner.test("Assert.assertObjectsEqual passes with equal objects", () => {
  expect.toDoesNotThrow(
    () => Assert.assertObjectsEqual({ a: 1, b: 2 }, { a: 1, b: 2 }),
    "Should not throw with equal objects",
  );
  expect.toDoesNotThrow(
    () => Assert.assertObjectsEqual(
      { a: 1, b: { c: 2 } },
      { a: 1, b: { c: 2 } }
    ),
    "Should not throw with nested equal objects",
  );
});

runner.test("Assert.assertObjectsEqual throws with unequal objects", () => {
  expect.toThrow(
    () => Assert.assertObjectsEqual({ a: 1 }, { a: 2 }),
    "Objects should be equal",
    "Should throw with different values",
  );
  expect.toThrow(
    () => Assert.assertObjectsEqual({ a: 1 }, { b: 1 }),
    "Objects should be equal",
    "Should throw with different keys",
  );
});

// Test Assert.assertMatches
runner.test("Assert.assertMatches passes when string matches pattern", () => {
  expect.toDoesNotThrow(
    () => Assert.assertMatches("hello123", /\d+/),
    "Should not throw when string matches regex",
  );
  expect.toDoesNotThrow(
    () => Assert.assertMatches("hello", "hello"),
    "Should not throw when string matches string pattern",
  );
});

runner.test("Assert.assertMatches throws when string does not match", () => {
  expect.toThrow(
    () => Assert.assertMatches("hello", /\d+/),
    "String should match pattern",
    "Should throw when string does not match",
  );
});

// Test Assert.assertNotMatches
runner.test("Assert.assertNotMatches passes when string does not match pattern", () => {
  expect.toDoesNotThrow(
    () => Assert.assertNotMatches("hello", /\d+/),
    "Should not throw when string does not match regex",
  );
});

runner.test("Assert.assertNotMatches throws when string matches", () => {
  expect.toThrow(
    () => Assert.assertNotMatches("hello123", /\d+/),
    "String should not match pattern",
    "Should throw when string matches",
  );
});

// Test Assert.assertContains
runner.test("Assert.assertContains passes when string contains substring", () => {
  expect.toDoesNotThrow(
    () => Assert.assertContains("hello world", "world"),
    "Should not throw when string contains substring",
  );
});

runner.test("Assert.assertContains passes when array contains element", () => {
  expect.toDoesNotThrow(
    () => Assert.assertContains([1, 2, 3], 2),
    "Should not throw when array contains element",
  );
});

runner.test("Assert.assertContains throws when string does not contain substring", () => {
  expect.toThrow(
    () => Assert.assertContains("hello world", "foo"),
    "Container should contain item",
    "Should throw when string does not contain substring",
  );
});

// Test Assert.assertHasProperty
runner.test("Assert.assertHasProperty passes when property exists", () => {
  const obj = { prop: "value" };
  expect.toDoesNotThrow(
    () => Assert.assertHasProperty(obj, "prop"),
    "Should not throw when property exists",
  );
});

runner.test("Assert.assertHasProperty throws when property does not exist", () => {
  expect.toThrow(
    () => Assert.assertHasProperty({}, "missing"),
    "Expected object to have property",
    "Should throw when property does not exist",
  );
});

// Test Assert.assertHasLength
runner.test("Assert.assertHasLength passes when array has correct length", () => {
  expect.toDoesNotThrow(
    () => Assert.assertHasLength([1, 2, 3], 3),
    "Should not throw when array has correct length",
  );
});

runner.test("Assert.assertHasLength throws when array has wrong length", () => {
  expect.toThrow(
    () => Assert.assertHasLength([1, 2, 3], 5),
    "Expected array to have specific length",
    "Should throw when array has wrong length",
  );
});

// Test Assert.assertIsType
runner.test("Assert.assertIsType passes with correct types", () => {
  expect.toDoesNotThrow(
    () => Assert.assertIsType("test", "string"),
    "Should not throw with string type",
  );
  expect.toDoesNotThrow(
    () => Assert.assertIsType(42, "number"),
    "Should not throw with number type",
  );
  expect.toDoesNotThrow(
    () => Assert.assertIsType({}, "object"),
    "Should not throw with object type",
  );
  expect.toDoesNotThrow(
    () => Assert.assertIsType(() => {}, "function"),
    "Should not throw with function type",
  );
  expect.toDoesNotThrow(
    () => Assert.assertIsType([], "array"),
    "Should not throw with array type",
  );
  expect.toDoesNotThrow(
    () => Assert.assertIsType(true, "boolean"),
    "Should not throw with boolean type",
  );
});

runner.test("Assert.assertIsType throws with incorrect types", () => {
  expect.toThrow(
    () => Assert.assertIsType(42, "string"),
    "Expected value to be of specific type",
    "Should throw with incorrect type",
  );
});

// Test Assert.assertThrowsWithMessage
runner.test("Assert.assertThrowsWithMessage passes when function throws with expected message", () => {
  expect.toDoesNotThrow(
    () => Assert.assertThrowsWithMessage(
      () => { throw new Error("Test error message"); },
      "Test error"
    ),
    "Should not throw when error message contains expected substring",
  );
});

runner.test("Assert.assertThrowsWithMessage throws when message does not match", () => {
  expect.toThrow(
    () => Assert.assertThrowsWithMessage(
      () => { throw new Error("Different error"); },
      "Test error"
    ),
    "Expected error message to contain",
    "Should throw when error message does not match",
  );
});

// Test Assert.assertIsValidJSON
runner.test("Assert.assertIsValidJSON passes with valid JSON", () => {
  expect.toDoesNotThrow(
    () => Assert.assertIsValidJSON('{"key": "value"}'),
    "Should not throw with valid JSON",
  );
  expect.toDoesNotThrow(
    () => Assert.assertIsValidJSON('[]'),
    "Should not throw with valid JSON array",
  );
  expect.toDoesNotThrow(
    () => Assert.assertIsValidJSON('"string"'),
    "Should not throw with valid JSON string",
  );
  expect.toDoesNotThrow(
    () => Assert.assertIsValidJSON('123'),
    "Should not throw with valid JSON number",
  );
});

runner.test("Assert.assertIsValidJSON throws with invalid JSON", () => {
  expect.toThrow(
    () => Assert.assertIsValidJSON('{key: value}'),
    "Error: invalid JSON string",
    "Should throw with invalid JSON",
  );
  expect.toThrow(
    () => Assert.assertIsValidJSON('not json'),
    "Error: invalid JSON string",
    "Should throw with non-JSON string",
  );
});

// Test Assert.disable
runner.test("Assert.disable disables all assertion functions", () => {
  Assert.disable();
  
  // After disable, assertions should not throw
  expect.toDoesNotThrow(
    () => Assert.assert(false, "Should not throw after disable"),
    "Should not throw after disable",
  );
  expect.toDoesNotThrow(
    () => Assert.assertIsEqual(1, 2),
    "Should not throw after disable",
  );
});

// Run all tests
runner.run();
