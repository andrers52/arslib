# arslib - Andre's JavaScript Utility Library

A comprehensive, zero-dependency JavaScript utility library providing essential functions for web development, data structures, Node.js applications, and now advanced LLM (Large Language Model) integration.

## 🚀 Quick Start

### Installation

```bash
npm install arslib
```

### Basic Usage

```javascript
// ES6 Module import (recommended)
import { Util, LLMService } from "arslib";

// Example LLMService usage (mock LLM):
const mockLLM = async (prompt) => `Echo: ${prompt}`;
const llmService = new LLMService();
await llmService.initialize({ llmFunction: mockLLM, modelName: "mock" });
const response = await llmService.generate("Hello!");
console.log(response); // Echo: Hello!
```

## 🧠 LLMService (Large Language Model Integration)

- Advanced LLM integration with support for memory and persistent caching, transformers.js, and test utilities.
- See `llm/llm-service.js` for API details and usage examples.

## 🛡️ ToxicTextFilter (Content Moderation)

- AI-powered content filtering utility that detects and replaces toxic content with polite alternatives.
- Features toxicity detection, scoring, batch processing, and configurable filtering modes.
- Robust error handling and graceful degradation for production use.
- Compatible with both mock LLMs for testing and real LLMs for production.

### Quick Example:
```javascript
import { ToxicTextFilter } from "arslib";

const filter = new ToxicTextFilter();
const result = await filter.filterText("You are an idiot!");
console.log(result); // "You are not very intelligent!"

const score = await filter.getToxicityScore("I hate you");
console.log(score); // 0.7

const hasToxic = await filter.hasToxicContent("Hello, how are you?");
console.log(hasToxic); // false
```

### Advanced Usage:
```javascript
// Batch processing
const texts = ["Hello!", "You are stupid", "Have a great day!"];
const filtered = await filter.filterTexts(texts);
console.log(filtered); // ["Hello!", "You are not very smart", "Have a great day!"]

// Strict mode for more aggressive filtering
const strictResult = await filter.filterText("This is offensive", { strict: true });

// Custom LLM service
const customLLM = new YourLLMService();
filter.setLLMService(customLLM);
```

### Suppressing ONNX Warnings

When running LLMService tests or using transformers.js, you may see ONNX Runtime warnings about unused initializers. To suppress these, set the environment variable before running tests:

```sh
ORT_LOGGING_LEVEL=error npm test
```

Or use the provided npm script (see below).

## 🧪 LLMService Testing

arslib provides dedicated test scripts for LLMService:

```bash
npm run test:llm           # Main LLMService tests
npm run test:llm:caching   # Caching tests
npm run test:llm:integration # Integration tests
npm run test:llm:all       # All LLMService tests
npm run test:llm:real      # Run all LLMService tests with real model (set TEST_REAL_LLM=true)
npm run test:llm:mock      # Run all LLMService tests in mock mode
```

- **Mock mode**: Fast, no real model loading (default)
- **Real mode**: Loads actual models (set `TEST_REAL_LLM=true`)

## 📦 Available Modules

To see all available exports, check `index.js` in the package root folder.

### Core Utilities

- **Util** - Mathematical operations, type checking, value manipulation
- **Assert** - Comprehensive assertion library for testing and validation
- **Random** - Random number generation with various distributions
- **Time** - Time manipulation and formatting utilities
- **LLMService** - Large Language Model integration, caching, and inference
- **ToxicTextFilter** - AI-powered content moderation and filtering

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

### Testing LLMService

```bash
# Run all LLMService tests (recommended) - ONNX warnings filtered by default
npm run test:llm:all

# Run specific test suites - ONNX warnings filtered by default
npm run test:llm              # Basic functionality tests
npm run test:llm:caching      # Caching behavior tests  
npm run test:llm:integration  # Integration tests

# Test with real vs mock LLMs - ONNX warnings filtered by default
npm run test:llm:real         # Use real transformers.js models
npm run test:llm:mock         # Use mock LLM functions

# Show all output including ONNX warnings (for debugging)
npm run test:llm:verbose      # Unfiltered output

# Test ToxicTextFilter - ONNX warnings filtered by default
npm run test:text-filter      # Text filter tests (mock LLM)
npm run test:text-filter:verbose # (ONNX warnings Unfiltered) text filter tests
npm run demo:text-filter      # Run text filter demo
```

**Note:** All LLMService test scripts automatically filter out ONNX Runtime warnings for cleaner output. Use `test:llm:verbose` if you need to see the full output including warnings for debugging purposes.

**ToxicTextFilter Testing:** The text filter tests use mock LLMs by default for fast, reliable testing. To test with real LLMs, set the `TEST_REAL_LLM=true` environment variable before running tests. Real LLM tests are more lenient and account for model behavior variations.

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
├── test/               # Test runner and test files
└── index.js           # Main entry point
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass with `npm test`
5. Submit a pull request

---

**arslib** - Making JavaScript development more productive, one utility at a time. 🚀

## 📝 Migration Note

LLMService and its comprehensive test suite were migrated from the brainiac-engine project to arslib as of v0.9.0, making advanced LLM features available to all arslib users.
