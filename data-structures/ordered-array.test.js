import { strict as assert } from "assert";
import { OrderedArray } from "./ordered-array.js";

describe("OrderedArray", function() {
  describe("binarySearch finds correct indices", function() {
    it("should work", function() {
      let array = [1, 2, 4, 5];
      assert.strictEqual(
        OrderedArray.binarySearch(array, 3),
        -1,
        "Should return -1 when element is not in array",
      );

      array = [1, 2, 3, 4, 5];
      assert.strictEqual(
        OrderedArray.binarySearch(array, 3),
        2,
        "Should find correct index for element in array",
      );

      array = [1, 2, 3, 4, 5];
      assert.strictEqual(
        OrderedArray.binarySearch(array, 1),
        0,
        "Should find first element at index 0",
      );
      assert.strictEqual(
        OrderedArray.binarySearch(array, 5),
        4,
        "Should find last element at correct index",
      );
    });
  });

  describe("findFirstIndexGreaterOrEqual works correctly", function() {
    it("should work", function() {
      let array = [1, 2, 4, 5];
      assert.strictEqual(
        OrderedArray.findFirstIndexGreaterOrEqual(array, 3),
        2,
        "Should find index of first element >= 3 when 3 is not in array",
      );

      array = [1, 2, 3, 4, 5];
      assert.strictEqual(
        OrderedArray.findFirstIndexGreaterOrEqual(array, 3),
        2,
        "Should find index of element when it exists in array",
      );

      array = [1, 3, 4, 5];
      assert.strictEqual(
        OrderedArray.findFirstIndexGreaterOrEqual(array, 2),
        1,
        "Should find next greater element when target is smaller than existing elements",
      );
      array = [1, 2, 3, 5];
      assert.strictEqual(
        OrderedArray.findFirstIndexGreaterOrEqual(array, 4),
        3,
        "Should find next greater element in gaps",
      );
    });
  });

  describe("findLastIndexSmallerOrEqual works correctly", function() {
    it("should work", function() {
      let array = [1, 2, 3, 4, 5];
      assert.strictEqual(
        OrderedArray.findLastIndexSmallerOrEqual(array, 3),
        2,
        "Should find index of element when it exists in array",
      );

      array = [1, 2, 4, 5];
      assert.strictEqual(
        OrderedArray.findLastIndexSmallerOrEqual(array, 3),
        1,
        "Should find index of last element <= 3 when 3 is not in array",
      );
    });
  });
});