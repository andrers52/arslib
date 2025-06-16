"use strict";

import { Assert } from "../assert.js";
import { Random } from "../random.js";

var EArray = {};

// ------------------------------------------------------ //
// Define the static methods in EArray
// ------------------------------------------------------ //

/**
 * Calculates the sum of all numbers in an array
 * @param {number[]} array - Array of numbers to sum
 * @returns {number} The sum of all array elements
 */
EArray.sum = (array) => array.reduce((total, num) => total + num, 0);

/**
 * Calculates the arithmetic mean (average) of all numbers in an array
 * @param {number[]} array - Array of numbers to average
 * @returns {number} The arithmetic mean of all array elements
 */
EArray.mean = (array) =>
  array.reduce((total, num) => total + num, 0) / array.length;

/**
 * Calculates the mean difference between consecutive elements in an array
 * @param {number[]} array - Array of numbers (must have at least 2 elements)
 * @returns {number} The mean difference between consecutive pairs
 * @throws {string} Throws error if array has fewer than 2 elements
 */
// mean difference, taken two by two (-1 if not applicable)
EArray.meanDifferenceTwoByTwo = (array) => {
  if (array.length === 0 || array.length === 1)
    throw "cannot calculate meanDifferenceTwoByTwo";
  let diffSum = 0;
  for (let i = 1; i < array.length; i++) {
    diffSum += array[i] - array[i - 1];
  }
  return diffSum / (array.length - 1);
};

/**
 * Gets the last valid index of an array
 * @param {any[]} array - The array to get the last index from
 * @returns {number} The index of the last element (array.length - 1)
 */
EArray.lastIndex = (array) => {
  return array.length - 1;
};

/**
 * Gets the last element of an array
 * @param {any[]} array - The array to get the last element from
 * @returns {any|string} The last element, or "undefined" if array is empty
 */
EArray.last = (array) => {
  return array.length >= 1 ? array[EArray.lastIndex(array)] : "undefined";
};

/**
 * Gets the first element of an array
 * @param {any[]} array - The array to get the first element from
 * @returns {any|string} The first element, or "undefined" if array is empty
 */
EArray.first = (array) => (array.length >= 1 ? array[0] : "undefined");

/**
 * Checks if an item is the last element of an array
 * @param {any[]} array - The array to check against
 * @param {any} item - The item to check
 * @returns {boolean} True if item is the last element
 */
EArray.isLast = (array, item) => item === this.last();

/**
 * Checks if an item is the first element of an array
 * @param {any[]} array - The array to check against
 * @param {any} item - The item to check
 * @returns {boolean} True if item is the first element
 */
EArray.isFirst = (array, item) => item === this.first();

/**
 * Flattens an array of arrays into a single array
 * @param {any[][]} array - Array of arrays to flatten
 * @param {boolean} preserveOriginalArray - Whether to preserve the original array (default: true)
 * @returns {any[]} Flattened single-dimensional array
 */
// from array of arrays to single array
// Note: preserveOriginalArray === true is slower
EArray.flatten = (array, preserveOriginalArray = true) => {
  let arrayToUse = preserveOriginalArray ? [...array] : array;
  return arrayToUse.concat.apply([], arrayToUse);
};

/**
 * Converts a flat array into an array of arrays of specified size
 * @param {any[]} flattenedArray - The flat array to unflatten
 * @param {number} size - Size of each sub-array
 * @param {boolean} preserveOriginalArray - Whether to preserve the original array (default: true)
 * @returns {any[][]} Array of arrays, each with 'size' elements
 */
// from 'flat' array to array of arrays of length 'size'
// Note: preserveOriginalArray === true is slower
EArray.unflatten = (flattenedArray, size, preserveOriginalArray = true) => {
  let arrayToUse = preserveOriginalArray
    ? JSON.parse(JSON.stringify(flattenedArray))
    : flattenedArray;
  let resultArray = [];
  while (arrayToUse.length > 0) resultArray.push(arrayToUse.splice(0, size));
  return resultArray;
};

/**
 * Removes the last element from an array
 * @param {any[]} array - The array to modify
 * @returns {any[]} The modified array with last element removed
 */
EArray.removeLast = (array) => {
  array.splice(-1, 1);
  return array;
};

/**
 * Creates a deep clone of an array
 * @param {any[]} array - The array to clone
 * @param {Function} [cloneFunction] - Optional custom clone function for array elements
 * @returns {any[]} Deep clone of the array
 */
EArray.clone = (array, cloneFunction) => {
  if (!cloneFunction)
    return array.map((e) =>
      Array.isArray(e) || e.clone
        ? e.clone()
        : typeof e === "object"
        ? Object.assign({}, e)
        : e,
    );
  return array.map(function (item) {
    return cloneFunction(item);
  });
};

/**
 * Selects a random element from an array with weighted probabilities
 * @param {any[]} array - Array of elements to choose from
 * @param {number[]} probabilities - Array of probability weights (must match array length)
 * @returns {any} Randomly selected element based on probability weights
 */
//get random element from array (with different chances for each one)
EArray.choiceWithProbabilities = (array, probabilities) => {
  Assert.assertIsArray(probabilities);
  Assert.assert(
    probabilities.length === array.length,
    "Probabilities size must be equal to array size",
  );
  //each one select a number based on its probability and the
  //one with the bigger number wins.
  let generatedValues = probabilities.map((prob) => Math.random() * prob);
  let selectedIndex = EArray.indexOfGreaterValue(generatedValues);
  return array[selectedIndex];
};

/**
 * Selects a random element from an array
 * @param {any[]} array - Array of elements to choose from
 * @returns {any} Randomly selected element
 */
//get random element from array
EArray.choice = (array) => array[Random.randomInt(array.length)];

/**
 * Gets a random index from an array
 * @param {any[]} array - Array to get random index from
 * @returns {number} Random valid index for the array
 */
//get random index from array
EArray.indexChoice = (array) => Random.randomInt(array.length);

/**
 * Finds the index of the element with the greatest value in an array
 * @param {number[]} array - Array of numbers to search
 * @returns {number} Index of the element with the greatest value
 */
EArray.indexOfGreaterValue = (array) => {
  let greater = array[0];
  let resultIndex = 0;
  for (let i = 1; i < array.length; i++)
    if (array[i] > greater) {
      greater = array[i];
      resultIndex = i;
    }

  return resultIndex;
};

/**
 * Generator function that yields all values between begin (inclusive) and end (exclusive)
 * @param {number} begin - Starting value (inclusive)
 * @param {number} end - Ending value (exclusive)
 * @yields {number} Sequential numbers from begin to end-1
 * @example
 * // Create a generator object
 * let numbers = EArray.range(1, 5);
 * // Use the generator
 * for(let num of numbers) {
 *     console.log(num); // Will print numbers 1 through 4
 * }
 */
// EArray.range() is a generator that returns all the values between begin and end-1.
// We can use it like this:
// Create a generator object
// let numbers = EArray.range(1, 5);
// Use the generator
// for(let num of numbers) {
//     console.log(num); // Will print numbers 1 through 4
// }

EArray.range = function* (begin, end) {
  for (let i = begin; i < end; ++i) {
    yield i;
  }
};

export { EArray };
