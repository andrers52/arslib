"use strict";

var OrderedArray = {};

// ------------------------------------------------------ //
// Define static methods in OrderedArray
// ------------------------------------------------------ //

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
