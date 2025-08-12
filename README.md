# arslib - Andre's JavaScript Utility Library

A comprehensive, JavaScript utility library providing essential functions for web development, data structures, Node.js applications, and now advanced LLM (Large Language Model) integration.

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

arslib uses [Mocha](https://mochajs.org/) as the test framework with ES modules support. Tests are configured via `.mocharc.json` and support standard Mocha features like `beforeEach`, `afterEach`, and `describe` blocks.

```javascript
import { expect } from "chai"; // or use Node.js assert
import { YourModule } from "./your-module.js";

describe("YourModule", () => {
  beforeEach(() => {
    // Setup code to run before each test
    // e.g., mock browser globals like window or localStorage
  });

  afterEach(() => {
    // Teardown code to run after each test
    // e.g., restore original globals
  });

  it("should return sum of two numbers", () => {
    const result = YourModule.someFunction(5, 10);
    expect(result).to.equal(15);
  });

  it("should handle edge cases", () => {
    const result = YourModule.someFunction(0, 0);
    expect(result).to.equal(0);
  });
});
```

### Test Configuration

The project uses `.mocharc.json` for Mocha configuration:

- **ES Modules**: Configured with `"require": "esm"` for ES6 import support
- **File Extensions**: Tests use `.js` extension
- **Test Specs**: Automatically finds test files in all subdirectories
- **Timeout**: Set to 10 seconds for longer-running tests

### Available Assertions

arslib uses **Sinon** for assertions and mocking. Sinon provides a comprehensive testing toolkit with built-in assertion methods:

```javascript
import { expect } from "sinon";

// Basic assertions
expect(result).to.equal(expectedValue);
expect(array).to.have.length(3);
expect(object).to.have.property('key');
expect(function).to.throw(Error);

// Mocking and stubbing
const stub = sinon.stub(object, 'method');
const spy = sinon.spy(object, 'method');
const mock = sinon.mock(object);
```

**Alternative Options:**
- **Node.js assert**: Built-in assertion module (no additional dependencies)
- **Custom assertions**: You can also write your own assertion functions

**Note:** Sinon is already included as a dev dependency and provides both assertion methods and powerful mocking capabilities.

## 📖 Documentation

### Key Features


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
├── llm/                # LLM integration and AI services
├── text-filter/        # Content moderation utilities
├── test/               # Test files (using Mocha)
├── .mocharc.json       # Mocha configuration
├── package.json        # Dependencies and scripts
└── index.js           # Main entry point
```

### Dependencies

**Production Dependencies:**
- `@xenova/transformers` - For local AI model inference and text processing

**Development Dependencies:**
- `mocha` - Test framework
- `sinon` - Mocking and stubbing utilities
- `esm` - ES modules support for Node.js

### Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality using Mocha
4. Ensure all tests pass with `npm test`
5. For LLM-related features, test both mock and real modes
6. Submit a pull request

**Testing Guidelines:**
- Use Mocha's `describe` and `it` blocks for test organization
- Include both positive and negative test cases
- Mock external dependencies using Sinon when appropriate
- For LLM features, provide both mock and real LLM test options

---

**arslib** - Making JavaScript development more productive, one utility at a time. 🚀

## 📝 Migration Note

LLMService and its comprehensive test suite were migrated from the brainiac-engine project to arslib as of v0.9.0, making advanced LLM features available to all arslib users.
