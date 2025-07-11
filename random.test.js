import { strict as assert } from "assert";
import { Random } from "./random.js";

describe("Random.randomInt generates integers in correct range", function() {
  it("should work", function() {
    for (let i = 0; i < 100; i++) {
      const result = Random.randomInt(10);
      assert.ok(typeof result === "number", "randomInt should return a number");
      assert.ok(Number.isInteger(result), "randomInt should return an integer");
      assert.ok(
        result >= 0 && result < 10,
        "randomInt(10) should return value between 0 and 9"
      );
    }

    const result = Random.randomInt(1);
    assert.strictEqual(result, 0, "randomInt(1) should always return 0");
  });
});

describe("Random.randomFromIntervalInclusive works correctly", function() {
  it("should work", function() {
    for (let i = 0; i < 50; i++) {
      const result = Random.randomFromIntervalInclusive(1, 5);
      assert.ok(typeof result === "number", "Should return a number");
      assert.ok(Number.isInteger(result), "Should return an integer");
      assert.ok(
        result >= 1 && result <= 5,
        "Should return value between 1 and 5 inclusive"
      );
    }

    for (let i = 0; i < 50; i++) {
      const result = Random.randomFromIntervalInclusive(-5, -1);
      assert.ok(
        result >= -5 && result <= -1,
        "Should work with negative integers"
      );
    }

    assert.strictEqual(
      Random.randomFromIntervalInclusive(3, 3),
      3,
      "Should return the same value when min equals max"
    );

    for (let i = 0; i < 20; i++) {
      const result = Random.randomFromIntervalInclusive(10, 5);
      assert.ok(
        result >= 5 && result <= 10,
        "Should handle reversed order (min > max)"
      );
    }
  });
});

describe("Random.randomFromIntervalInclusive throws on non-integers", function() {
  it("should work", function() {
    assert.throws(
      () => Random.randomFromIntervalInclusive(1.5, 5),
      /expecting two integer values/,
      "Should throw when first argument is not an integer"
    );
    assert.throws(
      () => Random.randomFromIntervalInclusive(1, 5.5),
      /expecting two integer values/,
      "Should throw when second argument is not an integer"
    );
  });
});

describe("Random.randomFromInterval works correctly", function() {
  it("should work", function() {
    for (let i = 0; i < 50; i++) {
      const result = Random.randomFromInterval(1, 5);
      assert.ok(typeof result === "number", "Should return a number");
      assert.ok(
        result >= 1 && result <= 5,
        "Should return value in range (using Math.round can reach max)"
      );
    }

    for (let i = 0; i < 50; i++) {
      const result = Random.randomFromInterval(1.0, 5.5);
      assert.ok(typeof result === "number", "Should work with float values");
      assert.ok(
        result >= 1.0 && result < 5.5,
        "Should return value in float range"
      );
    }

    const sameResult = Random.randomFromInterval(3, 3);
    assert.strictEqual(sameResult, 3, "Should return the same value when min equals max");
  });
});

describe("Random.occurrenceProbability works correctly", function() {
  it("should work", function() {
    assert.ok(!Random.occurrenceProbability(0), "Probability 0 should always return false");
    assert.ok(!Random.occurrenceProbability(-0.1), "Negative probability should always return false");
    assert.ok(Random.occurrenceProbability(1), "Probability 1 should always return true");
    assert.ok(Random.occurrenceProbability(1.1), "Probability > 1 should always return true");

    let trueCount = 0;
    const trials = 1000;

    for (let i = 0; i < trials; i++) {
      if (Random.occurrenceProbability(0.5)) {
        trueCount++;
      }
    }

    assert.ok(
      trueCount > trials * 0.35 && trueCount < trials * 0.65,
      "50% probability should occur roughly 50% of the time (±15%)"
    );

    let lowTrueCount = 0;
    for (let i = 0; i < trials; i++) {
      if (Random.occurrenceProbability(0.1)) {
        lowTrueCount++;
      }
    }

    assert.ok(
      lowTrueCount > trials * 0.03 && lowTrueCount < trials * 0.17,
      "10% probability should occur roughly 10% of the time (±7%)"
    );
  });
});