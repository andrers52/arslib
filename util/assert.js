"use strict";

import { Platform } from "./platform.js";

var Assert = {};

// set this to disable asserts globally
Assert.disableAllVerifications = false;
// set this to enable test mode
Assert.testMode = false;

/**
 * Basic assertion function that throws an error if expression is falsy
 * @param {any} exp - Expression to test for truthiness
 * @param {string} message - Error message to display if assertion fails
 * @returns {boolean} True if assertion passes
 * @throws {string} Throws message if assertion fails
 */
Assert.assert = (exp, message = "Error") => {
  if (Assert.disableAllVerifications) return; //go faster!
  if (exp !== 0 && (!exp || typeof exp === "undefined")) {
    const error = new Error("Test failed: " + message);
    if (Assert.testMode && Platform.isNode()) {
      console.error("Test failed: " + message);
      console.error(error.stack);
      process.exit(1); // exit with error code 1, so that the test fails
    }
    throw message;
  }
  return true;
};

/**
 * Asserts that an object has all specified properties
 * @param {Object} object - Object to check for properties
 * @param {string[]} propertiesArray - Array of property names to check
 * @param {string} message - Error message if any property is missing
 */
Assert.assertHasProperties = (object, propertiesArray, message) => {
  propertiesArray.forEach((p) => {
    Assert.hasProperty(object, p, message);
  });
};

/**
 * Asserts that an object has a specific property
 * @param {Object} object - Object to check
 * @param {string} property - Property name to check for
 * @param {string} message - Error message if property is missing
 */
Assert.hasProperty = (object, property, message = "Property not found") => {
  Assert.assert(object[property], message);
};

/**
 * Asserts that two elements are strictly equal (===)
 * @param {any} element1 - First element to compare
 * @param {any} element2 - Second element to compare
 * @param {string} message - Error message if elements are not equal
 */
Assert.assertIsEqual = (
  element1,
  element2,
  message = "Elements should be equal",
) => {
  Assert.assert(element1 === element2, message);
};

/**
 * Asserts that two elements are not strictly equal (!==)
 * @param {any} received - Received value
 * @param {any} expected - Expected value (should be different)
 * @param {string} message - Error message if elements are equal
 */
Assert.assertIsNotEqual = (
  received,
  expected,
  message = "Error: should not be equal",
) => {
  Assert.assert(received !== expected, message);
};

/**
 * Asserts that a string is one of the valid options
 * @param {string} stringToTest - String to validate
 * @param {string[]} arrayOfValidStrings - Array of valid string options
 * @param {string} message - Error message if string is not valid
 */
Assert.assertIsValidString = (
  stringToTest,
  arrayOfValidStrings,
  message = "Error: invalid string",
) => {
  Assert.assertIsString(stringToTest, "Test Error: string to test not found");
  Assert.assertIsArray(
    arrayOfValidStrings,
    "Test Error: array of valid strings not found",
  );
  Assert.assert(arrayOfValidStrings.includes(stringToTest), message);
};

/**
 * Asserts that a value is a function
 * @param {any} functionToTest - Value to test
 * @param {string} message - Error message if value is not a function
 */
Assert.assertIsFunction = (
  functionToTest,
  message = "Error: expecting a function",
) => {
  Assert.assert(typeof functionToTest === "function", message);
};

/**
 * Asserts that a value is an object
 * @param {any} objectToTest - Value to test
 * @param {string} message - Error message if value is not an object
 */
Assert.assertIsObject = (
  objectToTest,
  message = "Error: expecting an object",
) => {
  Assert.assert(typeof objectToTest === "object", message);
};

/**
 * Asserts that a value is either undefined or a function
 * @param {any} functionToTest - Value to test
 * @param {string} message - Error message if value is defined but not a function
 */
Assert.assertIsOptionalFunction = (
  functionToTest,
  message = "Error: expecting a(n optional) function",
) => {
  if (functionToTest) {
    Assert.assert(typeof functionToTest === "function", message);
  }
};

/**
 * Asserts that a value is a valid number (not NaN or Infinity)
 * @param {any} number - Value to test
 * @param {string} message - Error message if value is not a valid number
 */
Assert.assertIsNumber = (number, message = "Error: expecting a number") => {
  Assert.assert(
    typeof number === "number" &&
      !isNaN(parseFloat(number)) &&
      isFinite(number),
    message,
  );
};

/**
 * Asserts that a value is a string
 * @param {any} string - Value to test
 * @param {string} message - Error message if value is not a string
 */
Assert.assertIsString = (string, message = "Error: expecting a string") => {
  Assert.assert(typeof string === "string", message);
};

/**
 * Asserts that a value is an array
 * @param {any} array - Value to test
 * @param {string} message - Error message if value is not an array
 */
Assert.assertIsArray = (array, message = "Error: expecting an array") => {
  Assert.assert(Array.isArray(array), message);
};

/**
 * Asserts that an array is empty
 * @param {any[]} array - Array to test
 * @param {string} message - Error message if array is not empty
 */
Assert.assertIsEmptyArray = (array, message = "Error: array not empty") => {
  Assert.assert(array.length === 0, message);
};

/**
 * Asserts that an array is not empty
 * @param {any[]} array - Array to test
 * @param {string} message - Error message if array is empty
 */
Assert.assertIsNotEmptyArray = (array, message = "Error: array empty") => {
  Assert.assert(array.length !== 0, message);
};

/**
 * Asserts that a value is an array containing only numbers
 * @param {any} array - Value to test
 * @param {string} message - Error message if value is not an array of numbers
 */
Assert.assertIsArrayOfNumbers = (
  array,
  message = "Error: expecting an array of numbers",
) => {
  if (Assert.disableAllVerifications) return; //test added here to avoid loop below
  Assert.assertIsArray(array, message);
  array.forEach((elem) => Assert.assertIsNumber(elem, message));
};

/**
 * Asserts that a value is an array containing only objects
 * @param {any} array - Value to test
 * @param {string} message - Error message if value is not an array of objects
 */
Assert.assertIsArrayOfObjects = (
  array,
  message = "Error: expecting an array of objects",
) => {
  if (Assert.disableAllVerifications) return; //test added here to avoid loop
  Assert.assertIsArray(array, message);
  array.forEach((elem) => Assert.assertIsObject(elem, message));
};

/**
 * Asserts that a value is a literal string
 * @param {any} string - Value to test
 * @param {string} message - Error message if value is not a literal string
 */
Assert.assertIsLiteralString = (
  string,
  message = "Error: expecting a literal string",
) => {
  Assert.assert(typeof string === "string", message);
};

/**
 * Asserts that a value is within specified limits (inclusive)
 * @param {number} valueToTest - Value to test
 * @param {number} minValue - Minimum allowed value (inclusive)
 * @param {number} maxValue - Maximum allowed value (inclusive)
 * @param {string} message - Error message if value is out of range
 */
Assert.assertValueIsInsideLimits = (
  valueToTest,
  minValue,
  maxValue,
  message = "Error: value out of limits",
) => {
  Assert.assert(valueToTest >= minValue && valueToTest <= maxValue, message);
};

/**
 * Asserts that a value is boolean true
 * @param {any} expression - Value to test
 * @param {string} message - Error message if value is not true
 */
Assert.assertIsTrue = (expression, message = "Error: should be true") => {
  Assert.assert(typeof expression === "boolean" && expression, message);
};

/**
 * Asserts that a value is boolean false
 * @param {any} expression - Value to test
 * @param {string} message - Error message if value is not false
 */
Assert.assertIsFalse = (expression, message = "Error: should be false") => {
  Assert.assert(typeof expression === "boolean" && !expression, message);
};

/**
 * Asserts that a value is truthy
 * @param {any} expression - Value to test
 * @param {string} message - Error message if value is falsy
 */
Assert.assertIsTruthy = (expression, message = "Error: should be truthy") => {
  Assert.assert(expression, message); // Equivalent to Assert.assert
};

/**
 * Asserts that a value is falsy
 * @param {any} expression - Value to test
 * @param {string} message - Error message if value is truthy
 */
Assert.assertIsFalsy = (expression, message = "Error: should be falsy") => {
  Assert.assertIsTruthy(!expression, message);
};

/**
 * Asserts that two values are equivalent using loose equality (==)
 * @param {any} received - Received value
 * @param {any} expected - Expected value
 * @param {string} message - Error message if values are not equivalent
 */
Assert.assertIsEquivalent = (
  received,
  expected,
  message = "Error: should be the equivalent",
) => {
  Assert.assert(received == expected, message);
};

/**
 * Asserts that two values are not equivalent using loose equality (!=)
 * @param {any} received - Received value
 * @param {any} expected - Expected value (should be different)
 * @param {string} message - Error message if values are equivalent
 */
Assert.assertIsNotEquivalent = (
  received,
  expected,
  message = "Error: should not be the equivalent",
) => {
  Assert.assert(received != expected, message);
};

/**
 * Asserts that a value is undefined
 * @param {any} expression - Value to test
 * @param {string} message - Error message if value is not undefined
 */
Assert.assertIsUndefined = (expression, message = "Should be undefined") => {
  Assert.assert(typeof expression === "undefined", message);
};

/**
 * Asserts that a value is not undefined
 * @param {any} expression - Value to test
 * @param {string} message - Error message if value is undefined
 */
Assert.assertIsNotUndefined = (
  expression,
  message = "Should not be undefined",
) => {
  Assert.assert(typeof expression !== "undefined", message);
};

/**
 * Asserts that a value is null
 * @param {any} expression - Value to test
 * @param {string} message - Error message if value is not null
 */
Assert.assertIsNull = (expression, message = "Should be null") => {
  Assert.assert(expression === null, message);
};

/**
 * Asserts that a value is not null
 * @param {any} expression - Value to test
 * @param {string} message - Error message if value is null
 */
Assert.assertIsNotNull = (expression, message = "Should not be null") => {
  Assert.assert(expression !== null, message);
};

/**
 * Disables all assertion functions by replacing them with no-op functions
 * Useful for production builds to remove assertion overhead
 */
Assert.disable = () => {
  let properties = Object.getOwnPropertyNames(Assert);
  for (let property of properties)
    if (typeof Assert[property] === "function" && property.includes("assert"))
      Assert[property] = () => {};
};

export { Assert };
