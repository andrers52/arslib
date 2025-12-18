# Test Runner

This directory contains the custom, zero-dependency test runner for arslib.

## Overview

The test runner (`test-runner.js`) provides a modern testing framework built on top of the existing `Assert.js` library. It features:

- **Zero Dependencies**: Uses only the existing arslib Assert utility
- **Modern API**: Fluent `expect` syntax for better readability
- **Async Support**: Full support for async test functions
- **Cross-Platform**: Works in both Node.js and browser environments
- **Comprehensive Assertions**: Extended assertion library with type checking, property checking, and more

## Usage

### Basic Test Structure

```javascript
import { TestRunner, expect } from "../test/test-runner.js";
import { YourModule } from "./your-module.js";

const runner = new TestRunner();

// Optional: Setup and Teardown
runner.beforeEach(() => {
  // This function runs before each test
  // Example: Initialize a mock environment
});

runner.afterEach(() => {
  // This function runs after each test
  // Example: Clean up mocks or reset state
});

runner.test("Test description", () => {
  const result = YourModule.someFunction();
  expect.toBe(result, expectedValue);
});

// Basic usage
runner.test("Basic test", () => {
  const result = YourModule.someFunction();
  expect.toBe(result, expectedValue);
});

// With descriptive error messages
runner.test("Test with descriptive messages", () => {
  const result = YourModule.someFunction();
  expect.toBe(
    result,
    expectedValue,
    "Function should return the expected calculated value",
  );
  expect.toBeTruthy(result > 0, "Result should be a positive number");
});

// For async tests
runner.test("Async test", async () => {
  const result = await YourModule.asyncFunction();
  expect.toBeTruthy(result, "Async function should return a truthy result");
});

// Run all tests
runner.run();
```

### Available Assertions

All assertion methods accept an optional message parameter for clearer error reporting:

- `expect.toBe(actual, expected, message?)` - Strict equality (`===`)
- `expect.toEqual(actual, expected, message?)` - Loose equality (`==`)
- `expect.toBeTruthy(value, message?)` - Truthy check
- `expect.toBeFalsy(value, message?)` - Falsy check
- `expect.toBeNull(value, message?)` - Null check
- `expect.toBeUndefined(value, message?)` - Undefined check
- `expect.toBeDefined(value, message?)` - Defined (not undefined) check
- `expect.toThrow(fn, expectedMessage?, message?)` - Expects function to throw an error
- `expect.toDoesNotThrow(fn, message?)` - Expects function not to throw
- `expect.toBeType(value, type, message?)` - Type checking ('string', 'number', 'object', 'function', 'array')
- `expect.toHaveLength(array, length, message?)` - Array length validation
- `expect.toHaveProperty(object, property, message?)` - Object property existence

### Error Message Best Practices

Instead of comments explaining what tests do, use descriptive error messages:

```javascript
// ❌ Before: Using comments
runner.test("Math operations", () => {
  const result = Math.sqrt(16);
  expect.toBe(result, 4); // Should calculate square root correctly
});

// ✅ After: Using descriptive messages
runner.test("Math operations", () => {
  const result = Math.sqrt(16);
  expect.toBe(result, 4, "Square root of 16 should equal 4");
});
```

### Running Tests

**Individual test file:**

```bash
node path/to/test-file.test.js
```

**All tests:**

```bash
npm test
```

## Test Coverage

All major modules in arslib now have comprehensive test coverage:

- **Data Structures**: `fifo.test.js`
- **Enhancements**: `e-array.test.js`, `e-function.test.js`, `e-object.test.js`, `e-string.test.js`
- **Mixins**: `observable.test.js`
- **Node.js Modules**: `node-http-request.test.js`, `node-console-log.test.js`, `node-log-to-file.test.js`
- **Time Utilities**: `time.test.js`, `time-constrained-action.test.js`
- **Utilities**: `ordered-array.test.js`, `random.test.js`, `util.test.js`

## Architecture

The test runner integrates seamlessly with arslib's existing `Assert.js` utility:

1. **TestRunner Class**: Manages test execution, timing, and reporting
2. **Expect API**: Provides fluent syntax that wraps Assert.js functions
3. **Error Handling**: Comprehensive error reporting with stack traces
4. **Test Mode**: Configures Assert.js for optimal test execution

## Best Practices

1. **One test file per module**: Place test files alongside the modules they test
2. **Descriptive test names**: Use clear, descriptive names for test cases
3. **Focused tests**: Each test should verify one specific behavior
4. **Async handling**: Use `async/await` for asynchronous operations
5. **Clean tests**: Avoid side effects between tests

## Node.js Compatibility

The test runner automatically handles Node.js-specific requirements:

- Configures Assert.js test mode
- Provides proper exit codes for CI/CD integration
- Handles environment-specific functionality (e.g., DOM operations)
