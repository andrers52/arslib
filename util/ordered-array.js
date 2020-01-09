'use strict'

import Assert from './assert.js'
var OrderedArray ={}

// ------------------------------------------------------ //
// Define static methods in OrderedArray
// ------------------------------------------------------ //

// return index of element found, or index of closest element in the array
// If searchOnlyExactValue === true returns the index of the element or -1 if not found, 
// otherwise return the index of the closest element
OrderedArray.binarySearch = (array, target, searchOnlyExactValue = true) => {
  // Define Start and End Index
  let startIndex = 0
  let endIndex = array.length - 1
  let middleIndex
  // While Start Index is less than or equal to End Index
  while(startIndex <= endIndex) {

    // Define Middle Index (This will change when comparing )
    middleIndex = Math.floor((startIndex + endIndex) / 2)

    // Compare Middle Index with Target for match
    if(target === array[middleIndex]) {
      return middleIndex
    }

    // Search Right Side Of Array
    if(target > array[middleIndex]) {
      // Assign Start Index and increase the Index by 1 to narrow search
      startIndex = middleIndex + 1
    }

    // Search Left Side Of Array
    if(target < array[middleIndex]) {
      // Assign End Index and increase the Index by 1 to narrow search
      endIndex = middleIndex - 1
    }
  }

  // If Target Is Not Found, return closest index, or -1 if searchOnlyExactValue
  return searchOnlyExactValue? -1 : middleIndex
}

OrderedArray.findFirstIndexGreaterOrEqual = (array, value) => {
  let resultIndex = OrderedArray.binarySearch(array, value, false)
  if(array[resultIndex] >= value) return resultIndex
  let adjustedResultIndex = resultIndex + 1
  if( adjustedResultIndex < 0 || 
      adjustedResultIndex >= array.length ||
      array[adjustedResultIndex] < value) 
    return -1
  return adjustedResultIndex
} 
OrderedArray.findLastIndexSmallerOrEqual = (array, value) => {
  let resultIndex = OrderedArray.binarySearch(array, value, false)
  if(array[resultIndex] <= value) return resultIndex
  let adjustedResultIndex = resultIndex - 1
  if( adjustedResultIndex < 0 || 
      adjustedResultIndex >= array.length ||
      array[adjustedResultIndex] > value) 
    return -1
  return adjustedResultIndex
}

// *** SELF TEST ***

function selfTest () {
  console.log('OrderedArray self test started')

  // test #1, do not find index for element not in the array
  // when searching with searchOnlyExactValue = true
  let array = [1,2, 4,5]
  Assert.assertIsEqual(
    OrderedArray.binarySearch(array,3),
    -1
  )
  // test #2, do find index for element in the array
  array = [1,2,3,4,5]
  Assert.assertIsEqual(
    OrderedArray.binarySearch(array,3),
    2
  )
  // test #3, do find index for greater element when target is not in the array
  array = [1,2, 4,5]
  Assert.assertIsEqual(
    OrderedArray.findFirstIndexGreaterOrEqual(array,3),
    2
  )
  // test #4, do find index for greater element when target is in the array
  array = [1,2,3,4,5]
  Assert.assertIsEqual(
    OrderedArray.findFirstIndexGreaterOrEqual(array,3),
    2
  )
  // test #6, do find index for smaller element not in the array
  array = [1,2, 4,5]
  Assert.assertIsEqual(
    OrderedArray.findLastIndexSmallerOrEqual(array,3,false),
    1
  )
  // test #5, do find index for smaller element when target is in the array
  array = [1,2,3,4,5]
  Assert.assertIsEqual(
    OrderedArray.findLastIndexSmallerOrEqual(array,3),
    2
  )
  // test #6, do find index for elements at extremities
  array = [1,2,3,4,5]
  Assert.assertIsEqual(
    OrderedArray.binarySearch(array,1),
    0
  )
  Assert.assertIsEqual(
    OrderedArray.binarySearch(array,5),
    4
  )
  // test #7, do find index for aprox elements at extremities
  array = [1,3,4,5]
  Assert.assertIsEqual(
    OrderedArray.findLastIndexSmallerOrEqual(array,2),
    0
  )
  array = [1,2,3,5]
  Assert.assertIsEqual(
    OrderedArray.findFirstIndexGreaterOrEqual(array,4),
    3
  )

  console.log('OrderedArray self test finished successfully')
}

selfTest()
export {OrderedArray as default}
export {OrderedArray}
