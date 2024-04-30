import Assert from "../util/assert.js";
import EArray from "./e-array.js";

// enable test mode
Assert.testMode = true;

function testRange() {
  let range = EArray.range(1, 5);
  let expectedValues = [1, 2, 3, 4];

  for (let expectedValue of expectedValues) {
    let actualValue = range.next().value;
    Assert.assertIsEqual(
      actualValue,
      expectedValue,
      `Value should be ${expectedValue}`,
    );
  }

  // Check that the range is exhausted
  Assert.assertIsTrue(range.next().done, "Range should be exhausted");
}

// Run the test
testRange();
