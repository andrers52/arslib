import { TestRunner, expect } from "../test/test-runner.js";
import { EArray } from "./e-array.js";

const runner = new TestRunner();

runner.test("EArray.range generates correct sequence", () => {
  let range = EArray.range(1, 5);
  let expectedValues = [1, 2, 3, 4];

  for (let expectedValue of expectedValues) {
    let actualValue = range.next().value;
    expect.toBe(
      actualValue,
      expectedValue,
      `Range should generate value ${expectedValue} in sequence`,
    );
  }

  expect.toBeTruthy(
    range.next().done,
    "Range should be exhausted after generating all values",
  );
});

// Run all tests
runner.run();
