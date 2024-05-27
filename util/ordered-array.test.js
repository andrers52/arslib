"use strict";

import { Assert } from "./assert.js";
import { OrderedArray } from "./ordered-array.js";

// Enable test mode for testing
Assert.testMode = true;

function testBinarySearch() {
  try {
    // test #1, do not find index for element not in the array when searching with searchOnlyExactValue = true
    let array = [1, 2, 4, 5];
    Assert.assertIsEqual(
      OrderedArray.binarySearch(array, 3),
      -1,
      "test #1: Element not in array should return -1",
    );

    // test #2, do find index for element in the array
    array = [1, 2, 3, 4, 5];
    Assert.assertIsEqual(
      OrderedArray.binarySearch(array, 3),
      2,
      "test #2: Element in array should return correct index",
    );

    // test #6, do find index for elements at extremities
    array = [1, 2, 3, 4, 5];
    Assert.assertIsEqual(
      OrderedArray.binarySearch(array, 1),
      0,
      "test #6a: First element should return index 0",
    );
    Assert.assertIsEqual(
      OrderedArray.binarySearch(array, 5),
      4,
      "test #6b: Last element should return correct index",
    );

    console.log("testBinarySearch: PASS");
  } catch (error) {
    console.error("testBinarySearch: FAIL", error);
  }
}

function testFindFirstIndexGreaterOrEqual() {
  try {
    // test #3, do find index for greater element when target is not in the array
    let array = [1, 2, 4, 5];
    Assert.assertIsEqual(
      OrderedArray.findFirstIndexGreaterOrEqual(array, 3),
      2,
      "test #3: Should return index of first greater element",
    );

    // test #4, do find index for greater element when target is in the array
    array = [1, 2, 3, 4, 5];
    Assert.assertIsEqual(
      OrderedArray.findFirstIndexGreaterOrEqual(array, 3),
      2,
      "test #4: Should return index of target element",
    );

    // test #7, do find index for approximate elements at extremities
    array = [1, 3, 4, 5];
    Assert.assertIsEqual(
      OrderedArray.findFirstIndexGreaterOrEqual(array, 2),
      1,
      "test #7a: Should return index of first greater element",
    );
    array = [1, 2, 3, 5];
    Assert.assertIsEqual(
      OrderedArray.findFirstIndexGreaterOrEqual(array, 4),
      3,
      "test #7b: Should return index of first greater element",
    );

    console.log("testFindFirstIndexGreaterOrEqual: PASS");
  } catch (error) {
    console.error("testFindFirstIndexGreaterOrEqual: FAIL", error);
  }
}

function testFindLastIndexSmallerOrEqual() {
  try {
    // test #5, do find index for smaller element when target is in the array
    let array = [1, 2, 3, 4, 5];
    Assert.assertIsEqual(
      OrderedArray.findLastIndexSmallerOrEqual(array, 3),
      2,
      "test #5: Should return index of target element",
    );

    // test #6, do find index for smaller element not in the array
    array = [1, 2, 4, 5];
    Assert.assertIsEqual(
      OrderedArray.findLastIndexSmallerOrEqual(array, 3),
      1,
      "test #6: Should return index of last smaller element",
    );

    console.log("testFindLastIndexSmallerOrEqual: PASS");
  } catch (error) {
    console.error("testFindLastIndexSmallerOrEqual: FAIL", error);
  }
}

// Run the tests
testBinarySearch();
testFindFirstIndexGreaterOrEqual();
testFindLastIndexSmallerOrEqual();
