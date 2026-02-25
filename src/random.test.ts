import { Random } from "./random.js";
import { TestRunner, expect } from "./test/test-runner.js";

const runner = new TestRunner();

runner.test("Random.randomInt generates integers in correct range", () => {
  for (let i = 0; i < 100; i++) {
    const result = Random.randomInt(10);
    expect.toBeType(result, "number", "randomInt should return a number");
    expect.toBeTruthy(
      Number.isInteger(result),
      "randomInt should return an integer",
    );
    expect.toBeTruthy(
      result >= 0 && result < 10,
      "randomInt(10) should return value between 0 and 9",
    );
  }

  const result = Random.randomInt(1);
  expect.toBe(result, 0, "randomInt(1) should always return 0");
});

runner.test("Random.randomFromIntervalInclusive works correctly", () => {
  for (let i = 0; i < 50; i++) {
    const result = Random.randomFromIntervalInclusive(1, 5);
    expect.toBeType(result, "number", "Should return a number");
    expect.toBeTruthy(Number.isInteger(result), "Should return an integer");
    expect.toBeTruthy(
      result >= 1 && result <= 5,
      "Should return value between 1 and 5 inclusive",
    );
  }

  for (let i = 0; i < 50; i++) {
    const result = Random.randomFromIntervalInclusive(-5, -1);
    expect.toBeTruthy(
      result >= -5 && result <= -1,
      "Should work with negative integers",
    );
  }

  expect.toBe(
    Random.randomFromIntervalInclusive(3, 3),
    3,
    "Should return the same value when min equals max",
  );

  for (let i = 0; i < 20; i++) {
    const result = Random.randomFromIntervalInclusive(10, 5);
    expect.toBeTruthy(
      result >= 5 && result <= 10,
      "Should handle reversed order (min > max)",
    );
  }
});

runner.test("Random.randomFromIntervalInclusive throws on non-integers", () => {
  expect.toThrow(
    () => Random.randomFromIntervalInclusive(1.5, 5),
    "expecting two integer values",
    "Should throw when first argument is not an integer",
  );
  expect.toThrow(
    () => Random.randomFromIntervalInclusive(1, 5.5),
    "expecting two integer values",
    "Should throw when second argument is not an integer",
  );
});

runner.test("Random.randomFromInterval works correctly", () => {
  for (let i = 0; i < 50; i++) {
    const result = Random.randomFromInterval(1, 5);
    expect.toBeType(result, "number", "Should return a number");
    expect.toBeTruthy(
      result >= 1 && result <= 5,
      "Should return value in range (using Math.round can reach max)",
    );
  }

  for (let i = 0; i < 50; i++) {
    const result = Random.randomFromInterval(1.0, 5.5);
    expect.toBeType(result, "number", "Should work with float values");
    expect.toBeTruthy(
      result >= 1.0 && result < 5.5,
      "Should return value in float range",
    );
  }

  const sameResult = Random.randomFromInterval(3, 3);
  expect.toBe(
    sameResult,
    3,
    "Should return the same value when min equals max",
  );
});

runner.test("Random.occurrenceProbability works correctly", () => {
  expect.toBeFalsy(
    Random.occurrenceProbability(0),
    "Probability 0 should always return false",
  );
  expect.toBeFalsy(
    Random.occurrenceProbability(-0.1),
    "Negative probability should always return false",
  );
  expect.toBeTruthy(
    Random.occurrenceProbability(1),
    "Probability 1 should always return true",
  );
  expect.toBeTruthy(
    Random.occurrenceProbability(1.1),
    "Probability > 1 should always return true",
  );

  let trueCount = 0;
  const trials = 1000;

  for (let i = 0; i < trials; i++) {
    if (Random.occurrenceProbability(0.5)) {
      trueCount++;
    }
  }

  expect.toBeTruthy(
    trueCount > trials * 0.35 && trueCount < trials * 0.65,
    "50% probability should occur roughly 50% of the time (±15%)",
  );

  let lowTrueCount = 0;
  for (let i = 0; i < trials; i++) {
    if (Random.occurrenceProbability(0.1)) {
      lowTrueCount++;
    }
  }

  expect.toBeTruthy(
    lowTrueCount > trials * 0.03 && lowTrueCount < trials * 0.17,
    "10% probability should occur roughly 10% of the time (±7%)",
  );
});

// Run all tests
runner.run();
