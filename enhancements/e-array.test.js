import { strict as assert } from "assert";
import { EArray } from "./e-array.js";

describe("EArray.range generates correct sequence", function() {
  it("should work", function() {
    let range = EArray.range(1, 5);
    let expectedValues = [1, 2, 3, 4];

    for (let expectedValue of expectedValues) {
      let actualValue = range.next().value;
      assert.strictEqual(
        actualValue,
        expectedValue,
        `Range should generate value ${expectedValue} in sequence`
      );
    }

    // After all values, the iterator should be done
    const result = range.next();
    assert.ok(
      result.done,
      "Range should be exhausted after generating all values"
    );
  });
});