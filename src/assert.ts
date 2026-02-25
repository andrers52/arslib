// @ts-nocheck


export class Assert {
// set this to disable asserts globally
  static disableAllVerifications = false;

/**
 * Basic assertion function that throws an error if expression is falsy
 * @param {any} exp - Expression to test for truthiness
 * @param {string} message - Error message to display if assertion fails
 * @returns {boolean} True if assertion passes
 * @throws {Error} Throws Error object with "Test failed: " prefix if assertion fails
 */
  static assert = (exp: any, message: any = "Error") => {
  if (Assert.disableAllVerifications) return; //go faster!
  if (exp !== 0 && (!exp || typeof exp === "undefined")) {
    const error = new Error("Test failed: " + message);
    throw error;
  }
  return true;
};

/**
 * Asserts that an object has all specified properties
 * @param {Object} object - Object to check for properties
 * @param {string[]} propertiesArray - Array of property names to check
 * @param {string} message - Error message if any property is missing
 */
  static assertHasProperties = (object: any, propertiesArray: any, message: any) => {
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
  static hasProperty = (object: any, property: any, message: any = "Property not found") => {
  Assert.assert(object[property], message);
};

/**
 * Asserts that two elements are strictly equal (===)
 * @param {any} element1 - First element to compare
 * @param {any} element2 - Second element to compare
 * @param {string} message - Error message to display if elements are not equal
 */
  static assertIsEqual = (element1: any, element2: any, message: any = "Elements should be equal", ) => {
  Assert.assert(element1 === element2, message);
};

/**
 * Asserts that two elements are not strictly equal (!==)
 * @param {any} received - Received value
 * @param {any} expected - Expected value (should be different)
 * @param {string} message - Error message to display if elements are equal
 */
  static assertIsNotEqual = (received: any, expected: any, message: any = "Error: should not be equal", ) => {
  Assert.assert(received !== expected, message);
};

/**
 * Asserts that a string is one of the valid options
 * @param {string} stringToTest - String to validate
 * @param {string[]} arrayOfValidStrings - Array of valid string options
 * @param {string} message - Error message if string is not valid
 */
  static assertIsValidString = (stringToTest: any, arrayOfValidStrings: any, message: any = "Error: invalid string", ) => {
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
 * @param {string} message - Error message to display if value is not a function
 */
  static assertIsFunction = (functionToTest: any, message: any = "Error: expecting a function", ) => {
  Assert.assert(typeof functionToTest === "function", message);
};

/**
 * Asserts that a value is an object
 * @param {any} objectToTest - Value to test
 * @param {string} message - Error message to display if value is not an object
 */
  static assertIsObject = (objectToTest: any, message: any = "Error: expecting an object", ) => {
  Assert.assert(typeof objectToTest === "object", message);
};

/**
 * Asserts that a value is either undefined or a function
 * @param {any} functionToTest - Value to test
 * @param {string} message - Error message if value is defined but not a function
 */
  static assertIsOptionalFunction = (
  functionToTest: any,
  message: any = "Error: expecting a(n optional) function",
) => {
  if (functionToTest) {
    Assert.assert(typeof functionToTest === "function", message);
  }
};

/**
 * Asserts that a value is a valid number (not NaN or Infinity)
 * @param {any} number - Value to test
 * @param {string} message - Error message to display if value is not a valid number
 */
  static assertIsNumber = (number: any, message: any = "Error: expecting a number") => {
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
 * @param {string} message - Error message to display if value is not a string
 */
  static assertIsString = (string: any, message: any = "Error: expecting a string") => {
  Assert.assert(typeof string === "string", message);
};

/**
 * Asserts that a value is an array
 * @param {any} array - Value to test
 * @param {string} message - Error message to display if value is not an array
 */
  static assertIsArray = (array: any, message: any = "Error: expecting an array") => {
  Assert.assert(Array.isArray(array), message);
};

/**
 * Asserts that an array is empty
 * @param {any[]} array - Array to test
 * @param {string} message - Error message to display if array is not empty
 */
  static assertIsEmptyArray = (array: any, message: any = "Error: array not empty") => {
  Assert.assert(array.length === 0, message);
};

/**
 * Asserts that an array is not empty
 * @param {any[]} array - Array to test
 * @param {string} message - Error message to display if array is empty
 */
  static assertIsNotEmptyArray = (array: any, message: any = "Error: array empty") => {
  Assert.assert(array.length !== 0, message);
};

/**
 * Asserts that a value is an array containing only numbers
 * @param {any} array - Value to test
 * @param {string} message - Error message if value is not an array of numbers
 */
  static assertIsArrayOfNumbers = (array: any, message: any = "Error: expecting an array of numbers", ) => {
  if (Assert.disableAllVerifications) return; //test added here to avoid loop below
  Assert.assertIsArray(array, message);
  array.forEach((elem) => Assert.assertIsNumber(elem, message));
};

/**
 * Asserts that a value is an array containing only objects
 * @param {any} array - Value to test
 * @param {string} message - Error message if value is not an array of objects
 */
  static assertIsArrayOfObjects = (array: any, message: any = "Error: expecting an array of objects", ) => {
  if (Assert.disableAllVerifications) return; //test added here to avoid loop
  Assert.assertIsArray(array, message);
  array.forEach((elem) => Assert.assertIsObject(elem, message));
};

/**
 * Asserts that a value is a literal string
 * @param {any} string - Value to test
 * @param {string} message - Error message if value is not a literal string
 */
  static assertIsLiteralString = (string: any, message: any = "Error: expecting a literal string", ) => {
  Assert.assert(typeof string === "string", message);
};

/**
 * Asserts that a value is within specified limits (inclusive)
 * @param {number} valueToTest - Value to test
 * @param {number} minValue - Minimum allowed value (inclusive)
 * @param {number} maxValue - Maximum allowed value (inclusive)
 * @param {string} message - Error message if value is out of range
 */
  static assertValueIsInsideLimits = (valueToTest: any, minValue: any, maxValue: any, message: any = "Error: value out of limits", ) => {
  Assert.assert(valueToTest >= minValue && valueToTest <= maxValue, message);
};

/**
 * Asserts that a value is boolean true
 * @param {any} expression - Value to test
 * @param {string} message - Error message if value is not true
 */
  static assertIsTrue = (expression: any, message: any = "Error: should be true") => {
  Assert.assert(typeof expression === "boolean" && expression, message);
};

/**
 * Asserts that a value is boolean false
 * @param {any} expression - Value to test
 * @param {string} message - Error message if value is not false
 */
  static assertIsFalse = (expression: any, message: any = "Error: should be false") => {
  Assert.assert(typeof expression === "boolean" && !expression, message);
};

/**
 * Asserts that a value is truthy
 * @param {any} expression - Value to test
 * @param {string} message - Error message if value is falsy
 */
  static assertIsTruthy = (expression: any, message: any = "Error: should be truthy") => {
  Assert.assert(expression, message); // Equivalent to Assert.assert
};

/**
 * Asserts that a value is falsy
 * @param {any} expression - Value to test
 * @param {string} message - Error message if value is truthy
 */
  static assertIsFalsy = (expression: any, message: any = "Error: should be falsy") => {
  Assert.assertIsTruthy(!expression, message);
};

/**
 * Asserts that two values are equivalent using loose equality (==)
 * @param {any} received - Received value
 * @param {any} expected - Expected value
 * @param {string} message - Error message if values are not equivalent
 */
  static assertIsEquivalent = (received: any, expected: any, message: any = "Error: should be the equivalent", ) => {
  Assert.assert(received == expected, message);
};

/**
 * Asserts that two values are not equivalent using loose equality (!=)
 * @param {any} received - Received value
 * @param {any} expected - Expected value (should be different)
 * @param {string} message - Error message if values are equivalent
 */
  static assertIsNotEquivalent = (received: any, expected: any, message: any = "Error: should not be the equivalent", ) => {
  Assert.assert(received != expected, message);
};

/**
 * Asserts that a value is undefined
 * @param {any} expression - Value to test
 * @param {string} message - Error message if value is not undefined
 */
  static assertIsUndefined = (expression: any, message: any = "Should be undefined") => {
  Assert.assert(typeof expression === "undefined", message);
};

/**
 * Asserts that a value is not undefined
 * @param {any} expression - Value to test
 * @param {string} message - Error message if value is undefined
 */
  static assertIsNotUndefined = (expression: any, message: any = "Should not be undefined", ) => {
  Assert.assert(typeof expression !== "undefined", message);
};

/**
 * Asserts that a value is null
 * @param {any} expression - Value to test
 * @param {string} message - Error message if value is not null
 */
  static assertIsNull = (expression: any, message: any = "Should be null") => {
  Assert.assert(expression === null, message);
};

/**
 * Asserts that a value is not null
 * @param {any} expression - Value to test
 * @param {string} message - Error message if value is null
 */
  static assertIsNotNull = (expression: any, message: any = "Should not be null") => {
  Assert.assert(expression !== null, message);
};

/**
 * Asserts that a value does not contain a substring or array does not contain an element
 * @param {string|any[]} container - String or array to search in
 * @param {any} item - Item that should not be present
 * @param {string} message - Error message if item is found
 */
  static assertNotContains = (container: any, item: any, message: any = "Container should not contain item", ) => {
  if (typeof container === "string") {
    Assert.assertIsString(container, "Expected string container");
    Assert.assert(!container.includes(item), message);
  } else if (Array.isArray(container)) {
    Assert.assertIsArray(container, "Expected array container");
    Assert.assert(!container.includes(item), message);
  } else {
    Assert.assert(false, "Expected string or array for not contains assertion");
  }
};

/**
 * Asserts that a function throws an error when called
 * @param {Function} fn - Function that should throw an error
 * @param {string} message - Error message if function does not throw
 */
  static assertThrows = (fn: any, message: any = "Function should throw an error") => {
  Assert.assertIsFunction(fn, "Expected a function for throw test");
  let thrown = false;
  try {
    fn();
  } catch (error) {
    thrown = true;
  }
  Assert.assert(thrown, message);
};

/**
 * Asserts that a function does not throw an error when called
 * @param {Function} fn - Function that should not throw an error
 * @param {string} message - Error message if function throws
 */
  static assertDoesNotThrow = (fn: any, message: any = "Function should not throw an error", ) => {
  Assert.assertIsFunction(fn, "Expected a function for no-throw test");
  let thrown = false;
  let thrownError = null;
  try {
    fn();
  } catch (error) {
    thrown = true;
    thrownError = error;
  }
  Assert.assert(
    !thrown,
    message + (thrownError ? ` (threw: ${thrownError})` : ""),
  );
};

/**
 * Asserts that a number is greater than another number
 * @param {number} actual - The actual number
 * @param {number} expected - The number that actual should be greater than
 * @param {string} message - Error message if assertion fails
 */
  static assertGreaterThan = (actual: any, expected: any, message: any = "Number should be greater than expected", ) => {
  Assert.assertIsNumber(actual, "Expected actual value to be a number");
  Assert.assertIsNumber(expected, "Expected expected value to be a number");
  Assert.assert(actual > expected, message);
};

/**
 * Asserts that a number is less than another number
 * @param {number} actual - The actual number
 * @param {number} expected - The number that actual should be less than
 * @param {string} message - Error message if assertion fails
 */
  static assertLessThan = (actual: any, expected: any, message: any = "Number should be less than expected", ) => {
  Assert.assertIsNumber(actual, "Expected actual value to be a number");
  Assert.assertIsNumber(expected, "Expected expected value to be a number");
  Assert.assert(actual < expected, message);
};

/**
 * Asserts that a number is greater than or equal to another number
 * @param {number} actual - The actual number
 * @param {number} expected - The number that actual should be greater than or equal to
 * @param {string} message - Error message if assertion fails
 */
  static assertGreaterThanOrEqual = (actual: any, expected: any, message: any = "Number should be greater than or equal to expected", ) => {
  Assert.assertIsNumber(actual, "Expected actual value to be a number");
  Assert.assertIsNumber(expected, "Expected expected value to be a number");
  Assert.assert(actual >= expected, message);
};

/**
 * Asserts that a number is less than or equal to another number
 * @param {number} actual - The actual number
 * @param {number} expected - The number that actual should be less than or equal to
 * @param {string} message - Error message if assertion fails
 */
  static assertLessThanOrEqual = (actual: any, expected: any, message: any = "Number should be less than or equal to expected", ) => {
  Assert.assertIsNumber(actual, "Expected actual value to be a number");
  Assert.assertIsNumber(expected, "Expected expected value to be a number");
  Assert.assert(actual <= expected, message);
};

/**
 * Asserts that a value is an instance of a specific class/constructor
 * @param {any} object - Object to test
 * @param {Function} constructor - Constructor function/class to test against
 * @param {string} message - Error message if assertion fails
 */
  static assertInstanceOf = (object: any, constructor: any, message: any = "Object should be instance of expected constructor", ) => {
  Assert.assertIsFunction(constructor, "Expected constructor to be a function");
  Assert.assert(object instanceof constructor, message);
};

/**
 * Asserts that two arrays are equal (same length and same elements in same order)
 * @param {any[]} actual - Actual array
 * @param {any[]} expected - Expected array
 * @param {string} message - Error message if arrays are not equal
 */
  static assertArraysEqual = (actual: any, expected: any, message: any = "Arrays should be equal", ) => {
  Assert.assertIsArray(actual, "Expected actual to be an array");
  Assert.assertIsArray(expected, "Expected expected to be an array");
  Assert.assertIsEqual(
    actual.length,
    expected.length,
    "Arrays should have same length",
  );

  for (let i = 0; i < actual.length; i++) {
    Assert.assertIsEqual(
      actual[i],
      expected[i],
      `Array elements at index ${i} should be equal`,
    );
  }
};

/**
 * Asserts that two objects are equal (same properties and values)
 * @param {Object} actual - Actual object
 * @param {Object} expected - Expected object
 * @param {string} message - Error message if objects are not equal
 */
  static assertObjectsEqual = (actual: any, expected: any, message: any = "Objects should be equal", ) => {
  Assert.assertIsObject(actual, "Expected actual to be an object");
  Assert.assertIsObject(expected, "Expected expected to be an object");

  const actualKeys = Object.keys(actual);
  const expectedKeys = Object.keys(expected);

  Assert.assertIsEqual(
    actualKeys.length,
    expectedKeys.length,
    message + ": Objects should have the same number of keys",
  );

  for (const key of expectedKeys) {
    Assert.assertHasProperty(
      actual,
      key,
      message + `: Missing key "${key}" in actual object`,
    );
    if (
      typeof actual[key] === "object" &&
      actual[key] !== null &&
      typeof expected[key] === "object" &&
      expected[key] !== null
    ) {
      if (Array.isArray(actual[key]) && Array.isArray(expected[key])) {
        Assert.assertArraysEqual(
          actual[key],
          expected[key],
          message + `: Property "${key}" should be equal`,
        );
      } else if (!Array.isArray(actual[key]) && !Array.isArray(expected[key])) {
        Assert.assertObjectsEqual(
          actual[key],
          expected[key],
          message + `: Property "${key}" should be equal`,
        );
      } else {
        Assert.assert(
          false,
          message + `: Property "${key}" type mismatch (array vs object)`,
        );
      }
    } else {
      Assert.assertIsEqual(
        actual[key],
        expected[key],
        message +
          `: Property "${key}" should be equal (expected ${expected[key]}, got ${actual[key]})`,
      );
    }
  }
};

/**
 * Asserts that a value matches a regular expression pattern
 * @param {string} string - String to test
 * @param {RegExp|string} pattern - Regular expression pattern
 * @param {string} message - Error message if string doesn't match pattern
 */
  static assertMatches = (string: any, pattern: any, message: any = "String should match pattern", ) => {
  Assert.assertIsString(string, "Expected string to test against pattern");
  const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
  Assert.assert(regex.test(string), message);
};

/**
 * Asserts that a value does not match a regular expression pattern
 * @param {string} string - String to test
 * @param {RegExp|string} pattern - Regular expression pattern
 * @param {string} message - Error message if string matches pattern
 */
  static assertNotMatches = (string: any, pattern: any, message: any = "String should not match pattern", ) => {
  Assert.assertIsString(string, "Expected string to test against pattern");
  const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
  Assert.assert(!regex.test(string), message);
};

/**
 * Asserts that a value contains a substring or array contains an element
 * @param {string|any[]} container - String or array to search in
 * @param {any} item - Item to search for
 * @param {string} message - Error message if item is not found
 */
  static assertContains = (container: any, item: any, message: any = "Container should contain item", ) => {
  if (typeof container === "string") {
    Assert.assertIsString(container, "Expected string container");
    Assert.assert(container.includes(item), message);
  } else if (Array.isArray(container)) {
    Assert.assertIsArray(container, "Expected array container");
    Assert.assert(container.includes(item), message);
  } else {
    Assert.assert(false, "Expected string or array for contains assertion");
  }
};

/**
 * Asserts that an object has a specific property
 * @param {Object} object - Object to test
 * @param {string} property - Property name to check
 * @param {string} message - Error message if property is missing
 */
  static assertHasProperty = (object: any, property: any, message: any = "Expected object to have property", ) => {
  Assert.assertIsObject(object, "Expected an object for property check");
  Assert.assertIsString(property, "Expected property name to be a string");
  Assert.assert(
    object.hasOwnProperty(property) || property in object,
    message + ` "${property}"`,
  );
};

/**
 * Asserts that an array has a specific length
 * @param {any[]} array - Array to test
 * @param {number} expectedLength - Expected length
 * @param {string} message - Error message if length doesn't match
 */
  static assertHasLength = (array: any, expectedLength: any, message: any = "Expected array to have specific length", ) => {
  Assert.assertIsArray(array, "Expected an array for length check");
  Assert.assertIsNumber(expectedLength, "Expected length to be a number");
  Assert.assertIsEqual(
    array.length,
    expectedLength,
    message + ` ${expectedLength}, but got ${array.length}`,
  );
};

/**
 * Asserts that a value is of a specific type
 * @param {any} value - Value to test
 * @param {string} expectedType - Expected type ('string', 'number', 'object', 'function', 'array', 'boolean')
 * @param {string} message - Error message if type doesn't match
 */
  static assertIsType = (value: any, expectedType: any, message: any = "Expected value to be of specific type", ) => {
  switch (expectedType) {
    case "string":
      Assert.assertIsString(
        value,
        message + ` string, but got ${typeof value}`,
      );
      break;
    case "number":
      Assert.assertIsNumber(
        value,
        message + ` number, but got ${typeof value}`,
      );
      break;
    case "object":
      Assert.assertIsObject(
        value,
        message + ` object, but got ${typeof value}`,
      );
      break;
    case "function":
      Assert.assertIsFunction(
        value,
        message + ` function, but got ${typeof value}`,
      );
      break;
    case "array":
      Assert.assertIsArray(value, message + ` array, but got ${typeof value}`);
      break;
    case "boolean":
      Assert.assert(
        typeof value === "boolean",
        message + ` boolean, but got ${typeof value}`,
      );
      break;
    default:
      Assert.assert(false, `Unknown type "${expectedType}" for type assertion`);
  }
};

/**
 * Asserts that a function throws an error when called, with optional message checking
 * @param {Function} fn - Function that should throw an error
 * @param {string} [expectedMessage] - Optional expected error message substring
 * @param {string} message - Error message if function does not throw
 */
  static assertThrowsWithMessage = (fn: any, expectedMessage: any, message: any = "Function should throw an error", ) => {
  Assert.assertIsFunction(fn, "Expected a function for throw test");

  let thrown = false;
  let thrownError = null;

  try {
    fn();
  } catch (error) {
    thrown = true;
    thrownError = error;
  }

  Assert.assert(thrown, message);

  if (expectedMessage) {
    const errorMessage = thrownError?.message || thrownError;
    Assert.assert(
      errorMessage.includes(expectedMessage),
      `Expected error message to contain "${expectedMessage}", but got "${errorMessage}"`,
    );
  }
};

/**
 * Asserts that a string is valid JSON
 * @param {string} jsonString - The string to test
 * @param {string} message - Error message if not valid JSON
 */
  static assertIsValidJSON = (jsonString: any, message: any = "Error: invalid JSON string") => {
  try {
    JSON.parse(jsonString);
  } catch (e) {
    Assert.assert(false, message + ": " + e.message);
  }
};

/**
 * Disables all assertion functions by replacing them with no-op functions
 * Useful for production builds to remove assertion overhead
 */
  static disable = () => {
  let properties = Object.getOwnPropertyNames(Assert);
  for (let property of properties)
    if (typeof Assert[property] === "function" && property.includes("assert"))
      Assert[property] = () => {};
};


}
