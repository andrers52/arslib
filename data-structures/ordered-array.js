"use strict";

var OrderedArray = {};

// ------------------------------------------------------ //
// Define static methods in OrderedArray
// ------------------------------------------------------ //

/**
 * Performs binary search on a sorted array with O(log n) time complexity.
 * 
 * This function implements a standard binary search algorithm that works on any sorted array.
 * It can be configured to either find exact matches only or return the closest element's index.
 * 
 * @param {any[]} array - Sorted array to search in (must be in ascending order)
 * @param {any} target - Value to search for
 * @param {boolean} searchOnlyExactValue - If true, returns -1 when exact match not found; 
 *                                        if false, returns index of closest element
 * @returns {number} Index of found element, closest element index, or -1 if not found 
 *                  (when searchOnlyExactValue is true)
 * 
 * @example
 * // Exact search (returns -1 if not found)
 * OrderedArray.binarySearch([1, 3, 5, 7, 9], 5, true);  // returns 2
 * OrderedArray.binarySearch([1, 3, 5, 7, 9], 4, true);  // returns -1
 * 
 * // Closest element search
 * OrderedArray.binarySearch([1, 3, 5, 7, 9], 4, false); // returns 1 (closest to 3)
 * OrderedArray.binarySearch([1, 3, 5, 7, 9], 6, false); // returns 2 (closest to 5)
 */
OrderedArray.binarySearch = (array, target, searchOnlyExactValue = true) => {
  // Define Start and End Index
  let startIndex = 0;
  let endIndex = array.length - 1;
  let middleIndex;
  // While Start Index is less than or equal to End Index
  while (startIndex <= endIndex) {
    // Define Middle Index (This will change when comparing )
    middleIndex = Math.floor((startIndex + endIndex) / 2);

    // Compare Middle Index with Target for match
    if (target === array[middleIndex]) {
      return middleIndex;
    }

    // Search Right Side Of Array
    if (target > array[middleIndex]) {
      // Assign Start Index and increase the Index by 1 to narrow search
      startIndex = middleIndex + 1;
    }

    // Search Left Side Of Array
    if (target < array[middleIndex]) {
      // Assign End Index and increase the Index by 1 to narrow search
      endIndex = middleIndex - 1;
    }
  }

  // If Target Is Not Found, return closest index, or -1 if searchOnlyExactValue
  return searchOnlyExactValue ? -1 : middleIndex;
};

/**
 * Finds the first index where the value is greater than or equal to the target.
 * This is useful for finding the lower bound of a value in a sorted array.
 * 
 * @param {number[]} array - Sorted array of numbers (must be in ascending order)
 * @param {number} value - Target value to compare against
 * @returns {number} Index of first element >= value, or -1 if no such element exists
 * 
 * @example
 * OrderedArray.findFirstIndexGreaterOrEqual([1, 3, 5, 7, 9], 4);  // returns 2 (index of 5)
 * OrderedArray.findFirstIndexGreaterOrEqual([1, 3, 5, 7, 9], 5);  // returns 2 (index of 5)
 * OrderedArray.findFirstIndexGreaterOrEqual([1, 3, 5, 7, 9], 10); // returns -1 (no element >= 10)
 */
OrderedArray.findFirstIndexGreaterOrEqual = (array, value) => {
  let resultIndex = OrderedArray.binarySearch(array, value, false);
  if (array[resultIndex] >= value) return resultIndex;
  let adjustedResultIndex = resultIndex + 1;
  if (
    adjustedResultIndex < 0 ||
    adjustedResultIndex >= array.length ||
    array[adjustedResultIndex] < value
  )
    return -1;
  return adjustedResultIndex;
};

/**
 * Finds the last index where the value is smaller than or equal to the target.
 * This is useful for finding the upper bound of a value in a sorted array.
 * 
 * @param {number[]} array - Sorted array of numbers (must be in ascending order)
 * @param {number} value - Target value to compare against
 * @returns {number} Index of last element <= value, or -1 if no such element exists
 * 
 * @example
 * OrderedArray.findLastIndexSmallerOrEqual([1, 3, 5, 7, 9], 4);  // returns 1 (index of 3)
 * OrderedArray.findLastIndexSmallerOrEqual([1, 3, 5, 7, 9], 5);  // returns 2 (index of 5)
 * OrderedArray.findLastIndexSmallerOrEqual([1, 3, 5, 7, 9], 0);  // returns -1 (no element <= 0)
 */
OrderedArray.findLastIndexSmallerOrEqual = (array, value) => {
  let resultIndex = OrderedArray.binarySearch(array, value, false);
  if (array[resultIndex] <= value) return resultIndex;
  let adjustedResultIndex = resultIndex - 1;
  if (
    adjustedResultIndex < 0 ||
    adjustedResultIndex >= array.length ||
    array[adjustedResultIndex] > value
  )
    return -1;
  return adjustedResultIndex;
};

export { OrderedArray };
