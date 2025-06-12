import { TestRunner, expect } from "../test/test-runner.js";
import { EFunction } from "./e-function.js";

const runner = new TestRunner();

runner.test("EFunction.memoize caches function results correctly", () => {
  const square = (n) => n * n;
  const memoizedSquare = EFunction.memoize(square, 10);

  const result1 = memoizedSquare(2);
  const result2 = memoizedSquare(2);

  expect.toBe(result1, 4, "First call should return correct result");
  expect.toBe(result2, 4, "Second call should return same cached result");

  let callCount = 0;
  const squareWithCount = (n) => {
    callCount++;
    return n * n;
  };
  const memoizedSquareWithCount = EFunction.memoize(squareWithCount, 10);

  memoizedSquareWithCount(3);
  memoizedSquareWithCount(3);
  expect.toBe(
    callCount,
    1,
    "Function should only be called once for cached input",
  );
});

runner.test("EFunction.memoize handles cache eviction correctly", () => {
  let callCount = 0;
  const squareWithCount = (n) => {
    callCount++;
    return n * n;
  };
  const memoizedSquareWithEviction = EFunction.memoize(squareWithCount, 10);

  for (let i = 0; i < 11; i++) {
    memoizedSquareWithEviction(i);
  }
  expect.toBe(
    callCount,
    11,
    "All 11 unique calls should execute when cache size is 10",
  );

  expect.toDoesNotThrow(
    () => memoizedSquareWithEviction(12),
    "Cache eviction should not throw errors",
  );
});

runner.test(
  "EFunction.limitCallingRateWithDiscard limits function calls",
  (done) => {
    let callCount = 0;
    const testFunction = () => {
      callCount++;
      return callCount;
    };

    const limitedFunction = EFunction.limitCallingRateWithDiscard(
      testFunction,
      100,
    );

    limitedFunction();
    expect.toBe(callCount, 1, "Function should be called initially");

    limitedFunction(); // discarded
    expect.toBe(
      callCount,
      1,
      "Function should not be called again immediately",
    );

    setTimeout(() => {
      limitedFunction();
      expect.toBe(
        callCount,
        2,
        "Function should be called again after the delay",
      );

      limitedFunction(); // discarded
      limitedFunction(); // discarded
      expect.toBe(
        callCount,
        2,
        "Function should be called only once per delay period",
      );

      if (done) done(); // For async test completion
    }, 150);
  },
);

runner.test(
  "EFunction.addRuntimeTypeTest validates function arguments and return types",
  () => {
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

    const result = sumWithTypeTest(1, 2);
    expect.toBe(
      result,
      3,
      "Function should work correctly with valid arguments",
    );

    expect.toThrow(
      () => {
        sumWithTypeTest("asdf", "wer");
      },
      "function argument asdf expected to be of type number",
      "Function should throw with invalid argument types",
    );
  },
);

runner.test(
  "EFunction.addRuntimeTypeTest handles array and void return types",
  () => {
    function returnArray() {
      return [1, 2, 3];
    }
    const returnArrayWithTypeTest = EFunction.addRuntimeTypeTest(
      returnArray,
      [],
      "array",
    );

    const result = returnArrayWithTypeTest();
    expect.toBeType(result, "array", "Function should return an array");

    function returnVoid() {}
    const returnVoidWithTypeTest = EFunction.addRuntimeTypeTest(
      returnVoid,
      [],
      "void",
    );

    const voidResult = returnVoidWithTypeTest();
    expect.toBeUndefined(
      voidResult,
      "Function should return undefined for void type",
    );
  },
);

// Run all tests
runner.run();
