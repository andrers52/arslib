import { strict as assert } from "assert";
import { EFunction } from "./e-function.js";

describe("EFunction.memoize", function() {
  it("caches function results correctly", function() {
    const square = (n) => n * n;
    const memoizedSquare = EFunction.memoize(square, 10);

    const result1 = memoizedSquare(2);
    const result2 = memoizedSquare(2);

    assert.strictEqual(result1, 4, "First call should return correct result");
    assert.strictEqual(result2, 4, "Second call should return same cached result");

    let callCount = 0;
    const squareWithCount = (n) => {
      callCount++;
      return n * n;
    };
    const memoizedSquareWithCount = EFunction.memoize(squareWithCount, 10);

    memoizedSquareWithCount(3);
    memoizedSquareWithCount(3);
    assert.strictEqual(
      callCount,
      1,
      "Function should only be called once for cached input"
    );
  });

  it("handles cache eviction correctly", function() {
    let callCount = 0;
    const squareWithCount = (n) => {
      callCount++;
      return n * n;
    };
    const memoizedSquareWithEviction = EFunction.memoize(squareWithCount, 10);

    for (let i = 0; i < 11; i++) {
      memoizedSquareWithEviction(i);
    }
    assert.strictEqual(
      callCount,
      11,
      "All 11 unique calls should execute when cache size is 10"
    );

    assert.doesNotThrow(
      () => memoizedSquareWithEviction(12),
      undefined,
      "Cache eviction should not throw errors"
    );
  });
});

describe("EFunction.limitCallingRateWithDiscard", function() {
  it("limits function calls", function(done) {
    let callCount = 0;
    const testFunction = () => {
      callCount++;
      return callCount;
    };

    const limitedFunction = EFunction.limitCallingRateWithDiscard(
      testFunction,
      100
    );

    limitedFunction();
    assert.strictEqual(callCount, 1, "Function should be called initially");

    limitedFunction(); // discarded
    assert.strictEqual(
      callCount,
      1,
      "Function should not be called again immediately"
    );

    setTimeout(() => {
      limitedFunction();
      assert.strictEqual(
        callCount,
        2,
        "Function should be called again after the delay"
      );

      limitedFunction(); // discarded
      limitedFunction(); // discarded
      assert.strictEqual(
        callCount,
        2,
        "Function should be called only once per delay period"
      );

      done();
    }, 150);
  });
});

describe("EFunction.addRuntimeTypeTest", function() {
  it("validates function arguments and return types", function() {
    // Define a simple sum function
    function sum(a, b) {
      return a + b;
    }

    // Add type assertions to the sum function
    const sumWithTypeTest = EFunction.addRuntimeTypeTest(
      sum,
      ["number", "number"],
      "number"
    );

    const result = sumWithTypeTest(1, 2);
    assert.strictEqual(
      result,
      3,
      "Function should work correctly with valid arguments"
    );

    assert.throws(
      () => sumWithTypeTest("asdf", "wer"),
      /function argument asdf expected to be of type number/,
      "Function should throw with invalid argument types"
    );
  });

  it("handles array and void return types", function() {
    function returnArray() {
      return [1, 2, 3];
    }
    const returnArrayWithTypeTest = EFunction.addRuntimeTypeTest(
      returnArray,
      [],
      "array"
    );

    const result = returnArrayWithTypeTest();
    assert.ok(Array.isArray(result), "Function should return an array");

    function returnVoid() {}
    const returnVoidWithTypeTest = EFunction.addRuntimeTypeTest(
      returnVoid,
      [],
      "void"
    );

    const voidResult = returnVoidWithTypeTest();
    assert.strictEqual(
      voidResult,
      undefined,
      "Function should return undefined for void type"
    );
  });
});