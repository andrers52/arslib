# arslib - Andre's JavaScript Utility Library

A comprehensive, zero-dependency JavaScript utility library providing essential functions for web development, data structures, and Node.js applications.

## 🚀 Quick Start

### Installation

```bash
npm install arslib
```

### Basic Usage

```javascript
// ES6 Module import (recommended)
import { Util } from "arslib";

// Browser import with relative path
import { Util } from "<relative_path_to_node_modules>/arslib/util/util.js";

// Example usage
console.log(Util.limitValueToMinMax(10, 5, 15)); // 10
console.log(Util.floatSanitize(0.1 + 0.2)); // 0.3
```

## 📦 Available Modules

To see all available exports, check `index.js` in the package root folder.

### Core Utilities

- **Util** - Mathematical operations, type checking, value manipulation
- **Assert** - Comprehensive assertion library for testing and validation
- **Random** - Random number generation with various distributions
- **Time** - Time manipulation and formatting utilities

### Data Structures

- **Fifo** - First-In-First-Out queue implementation
- **OrderedArray** - Utilities for working with sorted arrays (e.g., binary search)

### Enhancements

- **EArray** - Array utility extensions
- **EFunction** - Function enhancement utilities (memoization, rate limiting)
- **EObject** - Object manipulation utilities
- **EString** - String processing utilities

### Mixins

- **Observable** - Observer pattern implementation

### Node.js Specific

- **NodeHttpRequest** - HTTP request utilities for Node.js
- **NodeConsoleLog** - Enhanced console logging with file output
- **NodeLogToFile** - File logging mixin for objects
- **NodeFileStore** - Persistent file storage for Node.js (filesystem-based, compatible API with browser)

### Browser Utilities

- **BrowserUtil** - Browser-specific utilities
- **CanvasUtil** - HTML5 Canvas helper functions
- **ImageUtil** - Image processing utilities
- **SoundUtil** - Audio processing utilities
- **BrowserFileStore** - Persistent file storage for browsers (IndexedDB-based)

## 🗄️ Cross-Platform Persistent Storage

arslib provides a unified API for persistent file storage in both browser and Node.js environments:

- Use `BrowserFileStore` in browsers (IndexedDB-backed)
- Use `NodeFileStore` in Node.js (filesystem-backed)

Both modules expose the following API:

```js
isAvailable(): boolean // Check if persistent storage is available
putFile(identifier, blob, successCallback, errorCallback) // Store a file/blob
getFile(identifier, successCallback, errorCallback) // Retrieve a file/blob
```

#### Example Usage (Node.js):

```js
import { NodeFileStore } from "arslib";

if (NodeFileStore.isAvailable()) {
  NodeFileStore.putFile("my-key", { parts: ["hello world"] }, () => {
    NodeFileStore.getFile("my-key", (blob) => {
      console.log(blob.parts[0]); // "hello world"
    });
  });
}
```

#### Example Usage (Browser):

```js
import { BrowserFileStore } from "arslib";

if (BrowserFileStore.isAvailable()) {
  BrowserFileStore.putFile("my-key", new Blob(["hello world"]), () => {
    BrowserFileStore.getFile("my-key", (blob) => {
      blob.text().then(console.log); // "hello world"
    });
  });
}
```

## 🧪 Testing

### Running Tests

```bash
npm test
```

### Creating New Tests

arslib uses a custom, zero-dependency test runner with a modern expect API.
It also supports `beforeEach` and `afterEach` for setting up and tearing down test contexts.

```javascript
import { TestRunner, expect } from "../test/test-runner.js";
import { YourModule } from "./your-module.js";

const runner = new TestRunner();

runner.beforeEach(() => {
  // Setup code to run before each test
  // e.g., mock browser globals like window or localStorage
});

runner.afterEach(() => {
  // Teardown code to run after each test
  // e.g., restore original globals
});

runner.test("Your test description", () => {
  const result = YourModule.someFunction(5, 10);
  expect.toBe(result, 15, "Function should return sum of two numbers");
});

// Run all tests
runner.run();
```

### Available Assertions

All assertion methods accept an optional descriptive message as the last parameter:

- `expect.toBe(actual, expected, message?)` - Strict equality (===)
- `expect.toEqual(actual, expected, message?)` - Loose equality (==)
- `expect.toBeTruthy(value, message?)` - Truthy check
- `expect.toBeFalsy(value, message?)` - Falsy check
- `expect.toBeNull(value, message?)` - Null check
- `expect.toBeUndefined(value, message?)` - Undefined check
- `expect.toBeDefined(value, message?)` - Defined check
- `expect.toThrow(fn, expectedMessage?, message?)` - Function should throw
- `expect.toDoesNotThrow(fn, message?)` - Function should not throw
- `expect.toBeType(value, type, message?)` - Type checking
- `expect.toHaveLength(array, length, message?)` - Array length check
- `expect.toHaveProperty(object, property, message?)` - Object property check

## 📖 Documentation

### Key Features

- **Zero Dependencies** - Pure JavaScript with no external dependencies
- **Cross-Platform** - Works in both browser and Node.js environments
- **Comprehensive Testing** - All modules include thorough test coverage
- **TypeScript-Friendly** - Well-documented functions with clear parameter types
- **Modular Design** - Import only what you need

### Example Use Cases

```javascript
import { Util, Random, Time, EFunction } from "arslib";

// Mathematical utilities
const clampedValue = Util.limitValueToMinMax(100, 0, 50); // 50
const precisFloat = Util.floatSanitize(0.1 + 0.2); // 0.3

// Random number generation
const randomInt = Random.randomInt(1, 10); // Random integer 1-10
const randomFloat = Random.randomFromInterval(0, 1); // Random float 0-1

// Time utilities
const timestamp = Time.getCurrentUnixTimeStamp();
const formatted = Time.dateAs_yyyy_mm_dd_hh_mm_ss(new Date());

// Function enhancements
const memoizedFn = EFunction.memoize(expensiveFunction);
const throttledFn = EFunction.limitCallingRateWithDiscard(rapidFunction, 100);
```

## 🔗 Links

- **NPM Package**: [https://www.npmjs.com/package/arslib](https://www.npmjs.com/package/arslib)
- **GitHub Repository**: [https://github.com/andrers52/arslib](https://github.com/andrers52/arslib)

## 📝 License

MIT

## 🛠️ Development

### Project Structure

```
arslib/
├── data-structures/     # Queue, stack implementations
├── enhancements/        # Extensions for built-in types
├── mixins/             # Reusable behavior mixins
├── node/               # Node.js specific utilities
├── time/               # Time and date utilities
├── util/               # Core utility functions
├── text-filter/        # Content moderation utilities
├── test/               # Test files (using Mocha)
├── .mocharc.json       # Mocha configuration
├── package.json        # Dependencies and scripts
└── index.js           # Main entry point
```

### Dependencies

**Development Dependencies:**

- `sinon` - Mocking and stubbing utilities
- `esm` - ES modules support for Node.js

### Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality using Mocha
4. Ensure all tests pass with `npm test`
5. Submit a pull request

**Testing Guidelines:**

- Use Mocha's `describe` and `it` blocks for test organization
- Include both positive and negative test cases
- Mock external dependencies using Sinon when appropriate

---

**arslib** - Making JavaScript development more productive, one utility at a time. 🚀
