/**
 * Simple, dependency-free test runner for arslib
 * Uses the existing Assert.js library for all assertions
 */

import { Assert } from "../assert.js";
import { Platform } from "../platform.js";

/**
 * Simple test runner that integrates with arslib's Assert utility
 */
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.startTime = Date.now();
    this.currentTestName = "";
    this.beforeEachFn = null;
    this.afterEachFn = null;
  }

  /**
   * Sets a function to run before each test
   * @param {Function} fn - Function to run before each test (can be async)
   */
  beforeEach(fn) {
    this.beforeEachFn = fn;
  }

  /**
   * Sets a function to run after each test
   * @param {Function} fn - Function to run after each test (can be async)
   */
  afterEach(fn) {
    this.afterEachFn = fn;
  }

  /**
   * Adds a test to the test suite
   * @param {string} name - Test name
   * @param {Function} testFn - Test function (can be async)
   */
  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  /**
   * Runs all registered tests
   * @returns {Promise<boolean>} True if all tests pass
   */
  async run() {
    console.log(`\\n🧪 Running ${this.tests.length} tests...\\n`);

    for (const { name, testFn } of this.tests) {
      this.currentTestName = name;
      try {
        if (this.beforeEachFn) {
          await this.beforeEachFn();
        }
        await testFn();
        if (this.afterEachFn) {
          await this.afterEachFn();
        }
        console.log(`✅ ${name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${name}`);
        console.log(`   Error: ${error.message || error}`);
        if (error.stack && Platform.isNode()) {
          console.log(`   Stack: ${error.stack.split("\n")[1]?.trim()}`);
        }
        this.failed++;
      }
    }

    this._printSummary();

    const allPassed = this.failed === 0;
    if (!allPassed && Platform.isNode()) {
      process.exit(1);
    }
    return allPassed;
  }

  /**
   * Prints test summary
   * @private
   */
  _printSummary() {
    const duration = Date.now() - this.startTime;
    const total = this.passed + this.failed;

    console.log(`\n📊 Test Results:`);
    console.log(`   Total: ${total}`);
    console.log(`   Passed: ${this.passed} ✅`);
    console.log(`   Failed: ${this.failed} ${this.failed > 0 ? "❌" : ""}`);
    console.log(`   Duration: ${duration}ms`);

    if (this.failed === 0) {
      console.log(`\n🎉 All tests passed!`);
    } else {
      console.log(`\n💥 ${this.failed} test(s) failed!`);
    }
  }
}

/**
 * Convenient assertion helpers that wrap Assert.js functions
 * These provide a more fluent testing API while using your existing assertions
 */
const expect = {
  /**
   * Expects actual value to be strictly equal to expected
   * @param {any} actual - Actual value
   * @param {any} expected - Expected value
   * @param {string} [message] - Optional custom error message
   */
  toBe(actual, expected, message) {
    Assert.assertIsEqual(
      actual,
      expected,
      message || `Expected ${expected}, but got ${actual}`,
    );
  },

  /**
   * Expects actual value to be loosely equal to expected
   * @param {any} actual - Actual value
   * @param {any} expected - Expected value
   * @param {string} [message] - Optional custom error message
   */
  toEqual(actual, expected, message) {
    if (Array.isArray(actual) && Array.isArray(expected)) {
      Assert.assertArraysEqual(
        actual,
        expected,
        message ||
          `Expected arrays to be equal. Expected ${JSON.stringify(
            expected,
          )}, but got ${JSON.stringify(actual)}`,
      );
    } else if (
      typeof actual === "object" &&
      actual !== null &&
      typeof expected === "object" &&
      expected !== null &&
      !Array.isArray(actual) &&
      !Array.isArray(expected)
    ) {
      Assert.assertObjectsEqual(
        actual,
        expected,
        message ||
          `Expected objects to be equal. Expected ${JSON.stringify(
            expected,
          )}, but got ${JSON.stringify(actual)}`,
      );
    } else {
      Assert.assertIsEquivalent(
        actual,
        expected,
        message || `Expected ${expected}, but got ${actual}`,
      );
    }
  },

  /**
   * Expects value to be truthy
   * @param {any} value - Value to test
   * @param {string} [message] - Optional custom error message
   */
  toBeTruthy(value, message) {
    Assert.assertIsTruthy(
      value,
      message || `Expected truthy value, but got ${value}`,
    );
  },

  /**
   * Expects value to be falsy
   * @param {any} value - Value to test
   * @param {string} [message] - Optional custom error message
   */
  toBeFalsy(value, message) {
    Assert.assertIsFalsy(
      value,
      message || `Expected falsy value, but got ${value}`,
    );
  },

  /**
   * Expects value to be null
   * @param {any} value - Value to test
   * @param {string} [message] - Optional custom error message
   */
  toBeNull(value, message) {
    Assert.assertIsNull(value, message || `Expected null, but got ${value}`);
  },

  /**
   * Expects value to be undefined
   * @param {any} value - Value to test
   * @param {string} [message] - Optional custom error message
   */
  toBeUndefined(value, message) {
    Assert.assertIsUndefined(
      value,
      message || `Expected undefined, but got ${value}`,
    );
  },

  /**
   * Expects value to be defined (not undefined)
   * @param {any} value - Value to test
   * @param {string} [message] - Optional custom error message
   */
  toBeDefined(value, message) {
    Assert.assertIsNotUndefined(
      value,
      message || `Expected defined value, but got undefined`,
    );
  },

  /**
   * Expects function to throw an error
   * @param {Function} fn - Function that should throw
   * @param {string} [expectedMessage] - Optional expected error message
   * @param {string} [message] - Optional custom error message
   */
  toThrow(fn, expectedMessage, message) {
    Assert.assertThrowsWithMessage(
      fn,
      expectedMessage,
      message || "Expected function to throw, but it did not",
    );
  },

  /**
   * Expects function to NOT throw an error
   * @param {Function} fn - Function that should not throw
   * @param {string} [message] - Optional custom error message
   */
  toDoesNotThrow(fn, message) {
    Assert.assertDoesNotThrow(
      fn,
      message || "Expected function to not throw, but it did",
    );
  },

  /**
   * Expects value to be a specific type
   * @param {any} value - Value to test
   * @param {string} type - Expected type ('string', 'number', 'object', 'function', 'array')
   * @param {string} [message] - Optional custom error message
   */
  toBeType(value, type, message) {
    Assert.assertIsType(
      value,
      type,
      message || `Expected ${type}, but got ${typeof value}`,
    );
  },

  /**
   * Expects array to have specific length
   * @param {any[]} array - Array to test
   * @param {number} length - Expected length
   * @param {string} [message] - Optional custom error message
   */
  toHaveLength(array, length, message) {
    Assert.assertHasLength(
      array,
      length,
      message || `Expected array length ${length}, but got ${array.length}`,
    );
  },

  /**
   * Expects object to have specific property
   * @param {Object} object - Object to test
   * @param {string} property - Property name to check
   * @param {string} [message] - Optional custom error message
   */
  toHaveProperty(object, property, message) {
    Assert.assertHasProperty(
      object,
      property,
      message || `Expected object to have property "${property}"`,
    );
  },
};

export { expect, TestRunner };
