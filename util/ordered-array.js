"use strict";

var OrderedArray = {};

// ------------------------------------------------------ //
// Define static methods in OrderedArray
// ------------------------------------------------------ //

/**
 * Performs binary search on a sorted array
 * @param {any[]} array - Sorted array to search in
 * @param {any} target - Value to search for
 * @param {boolean} searchOnlyExactValue - If true, returns -1 when not found; if false, returns closest element index
 * @returns {number} Index of found element, closest element index, or -1 if not found (when searchOnlyExactValue is true)
 */
// return index of element found, or index of closest element in the array
// If searchOnlyExactValue === true returns the index of the element or -1 if not found,
// otherwise return the index of the closest element
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
 * Finds the first index where the value is greater than or equal to the target
 * @param {number[]} array - Sorted array of numbers
 * @param {number} value - Target value to compare against
 * @returns {number} Index of first element >= value, or -1 if no such element exists
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
 * Finds the last index where the value is smaller than or equal to the target
 * @param {number[]} array - Sorted array of numbers
 * @param {number} value - Target value to compare against
 * @returns {number} Index of last element <= value, or -1 if no such element exists
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
