import { Assert } from "../util/assert.js";
import { EFunction } from "./e-function.js";

// enable test mode
Assert.testMode = true;

const testMemoize = () => {
  // Define a simple function that squares a number
  const square = (n) => n * n;

  // Memoize the square function with a small cache size for testing
  const memoizedSquare = EFunction.memoize(square, 10);

  // Test memoization
  const result1 = memoizedSquare(2);
  const result2 = memoizedSquare(2);

  Assert.assertIsEqual(result1, 4, "The square of 2 should be 4");
  Assert.assertIsEqual(
    result2,
    4,
    "The square of 2 should be retrieved from the cache and be 4",
  );

  // Test that the function result is cached
  let callCount = 0;
  const squareWithCount = (n) => {
    callCount++;
    return n * n;
  };
  const memoizedSquareWithCount = EFunction.memoize(squareWithCount, 10);

  memoizedSquareWithCount(3);
  memoizedSquareWithCount(3);
  Assert.assertIsEqual(
    callCount,
    1,
    "The function should be called only once for the same argument",
  );

  // Test cache eviction
  callCount = 0; // Reset call count
  const memoizedSquareWithEviction = EFunction.memoize(squareWithCount, 10);

  for (let i = 0; i < 11; i++) {
    memoizedSquareWithEviction(i);
  }
  Assert.assertIsEqual(
    callCount,
    11,
    "The function should be called 11 times with eviction",
  );

  // Ensure the random eviction works and doesn't throw
  try {
    memoizedSquareWithEviction(12);
    Assert.assert(true, "Eviction should work without errors");
  } catch (error) {
    Assert.assert(false, `Test failed with error: ${error}`);
  }
};

const testLimitCallingRateWithDiscard = () => {
  let callCount = 0;
  const testFunction = () => {
    callCount++;
    return callCount;
  };

  const limitedFunction = EFunction.limitCallingRateWithDiscard(
    testFunction,
    100,
  );

  // Test that the function is called initially
  limitedFunction();
  Assert.assertIsEqual(callCount, 1, "The function should be called once");

  // Test that the function is not called again immediately
  limitedFunction(); // discarded
  Assert.assertIsEqual(
    callCount,
    1,
    "The function should not be called again immediately",
  );

  // Test that the function is called again after the delay
  setTimeout(() => {
    limitedFunction();
    Assert.assertIsEqual(
      callCount,
      2,
      "The function should be called again after the delay",
    );

    // Test that the function is called only once per delay period
    limitedFunction(); // discarded
    limitedFunction(); // discarded
    Assert.assertIsEqual(
      callCount,
      2,
      "The function should not be called more than once per delay period",
    );
  }, 150);
};

const testAddRuntimeTypeTest = () => {
  // Define a simple sum function
  function sum(a, b) {
    return a + b;
  }

  // Add type assertions to the sum function
  const sumWithTypeTest = EFunction.addRuntimeTypeTest(
    sum,
    ["number", "number"],
    "number",
  );

  // Test correct usage
  try {
    const result = sumWithTypeTest(1, 2);
    Assert.assertIsEqual(result, 3, "The sum function should return 3");
  } catch (error) {
    Assert.assert(false, `Test failed with error: ${error}`);
  }

  // Test incorrect argument types
  try {
    sumWithTypeTest("asdf", "wer");
    Assert.assert(
      false,
      "The sum function should have thrown an error for invalid argument types",
    );
  } catch (error) {
    Assert.assertIsEqual(
      error,
      "Error: function argument asdf expected to be of type number",
      "Expected type error message for invalid argument types",
    );
  }

  // Test incorrect return type
  function returnArray() {
    return [1, 2, 3];
  }
  const returnArrayWithTypeTest = EFunction.addRuntimeTypeTest(
    returnArray,
    [],
    "array",
  );

  try {
    const result = returnArrayWithTypeTest();
    Assert.assertIsArray(result, "The return value should be an array");
  } catch (error) {
    Assert.assert(false, `Test failed with error: ${error}`);
  }

  function returnVoid() {}

  const returnVoidWithTypeTest = EFunction.addRuntimeTypeTest(
    returnVoid,
    [],
    "void",
  );

  try {
    const result = returnVoidWithTypeTest();
    Assert.assertIsUndefined(
      result,
      "The return value should be undefined for void return type",
    );
  } catch (error) {
    Assert.assert(false, `Test failed with error: ${error}`);
  }
};

// Run the tests
testMemoize();
testLimitCallingRateWithDiscard();
testAddRuntimeTypeTest();
