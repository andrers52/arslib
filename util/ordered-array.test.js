import { TestRunner, expect } from "../test/test-runner.js";
import { OrderedArray } from "./ordered-array.js";

const runner = new TestRunner();

runner.test("OrderedArray.binarySearch finds correct indices", () => {
  let array = [1, 2, 4, 5];
  expect.toBe(
    OrderedArray.binarySearch(array, 3),
    -1,
    "Should return -1 when element is not in array",
  );

  array = [1, 2, 3, 4, 5];
  expect.toBe(
    OrderedArray.binarySearch(array, 3),
    2,
    "Should find correct index for element in array",
  );

  array = [1, 2, 3, 4, 5];
  expect.toBe(
    OrderedArray.binarySearch(array, 1),
    0,
    "Should find first element at index 0",
  );
  expect.toBe(
    OrderedArray.binarySearch(array, 5),
    4,
    "Should find last element at correct index",
  );
});

runner.test("OrderedArray.findFirstIndexGreaterOrEqual works correctly", () => {
  let array = [1, 2, 4, 5];
  expect.toBe(
    OrderedArray.findFirstIndexGreaterOrEqual(array, 3),
    2,
    "Should find index of first element >= 3 when 3 is not in array",
  );

  array = [1, 2, 3, 4, 5];
  expect.toBe(
    OrderedArray.findFirstIndexGreaterOrEqual(array, 3),
    2,
    "Should find index of element when it exists in array",
  );

  array = [1, 3, 4, 5];
  expect.toBe(
    OrderedArray.findFirstIndexGreaterOrEqual(array, 2),
    1,
    "Should find next greater element when target is smaller than existing elements",
  );
  array = [1, 2, 3, 5];
  expect.toBe(
    OrderedArray.findFirstIndexGreaterOrEqual(array, 4),
    3,
    "Should find next greater element in gaps",
  );
});

runner.test("OrderedArray.findLastIndexSmallerOrEqual works correctly", () => {
  let array = [1, 2, 3, 4, 5];
  expect.toBe(
    OrderedArray.findLastIndexSmallerOrEqual(array, 3),
    2,
    "Should find index of element when it exists in array",
  );

  array = [1, 2, 4, 5];
  expect.toBe(
    OrderedArray.findLastIndexSmallerOrEqual(array, 3),
    1,
    "Should find index of last element <= 3 when 3 is not in array",
  );
});

// Run all tests
runner.run();
