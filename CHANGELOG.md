# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.1] - 2025-06-15

### Fixed

- **Test Runner**: Improved `expect.toEqual` to correctly perform deep comparisons for objects and arrays by using new `Assert.assertObjectsEqual` and existing `Assert.assertArraysEqual` methods.
- **Assert.js**: Added `Assert.assertObjectsEqual` for deep object comparison, enhancing the accuracy of test assertions.

### Changed

- **Platform.js**: Added `isBrowser` and `isWorker` detection methods.

## [0.6.0]

### Added

- **TestRunner**: Added `beforeEach(fn)` and `afterEach(fn)` methods to `TestRunner` for setting up and tearing down test contexts, enhancing test structure and reusability.
- **Browser Module Tests**: Created and updated tests for all browser-specific modules (`browser-util.test.js`, `canvas-util.test.js`, `cookie.test.js`, `file-store.test.js`, `image-util.test.js`, `sound.test.js`, `persistence.test.js`) to verify they export an empty object in Node.js and function correctly in browser-like environments (using mocks where appropriate).

### Changed

- **Browser Modules Refactor**: Refactored browser-specific modules (`arslib/browser/*`) to conditionally define their exports. They now export an empty object (`{}`) when running in a Node.js environment and their full functionality in a browser environment. This ensures that attempting to import these modules in Node.js does not cause errors due to missing browser-specific globals like `window` or `document`.
- **Test Standardization**: All browser module test files (`*.test.js`) were updated or created to use the custom `TestRunner` and its `expect` API, replacing any previous Mocha-style or manual assertion patterns. This includes fixing `ReferenceError` issues for `describe` and `it`.

### Fixed

- **Illegal Return Statement**: Removed top-level `return` statements from browser modules (e.g., `sound.js`, `persistence.js`, `cookie.js`) that caused `SyntaxError: Illegal return statement` when these modules were processed or imported in certain contexts. Logic is now correctly wrapped within the `if (!Platform.isNode()) { ... }` block.
- **Node.js Module Behavior**: Ensured Node.js specific modules (e.g., `node-http-request.js`, `node-console-log.js`, `mixins/node-log-to-file.js`) are innocuous or no-ops when accidentally imported or run in a browser environment.

## [0.5.2] - 2025-06-12

### Changed

- **Assert.js**: Simplified assertion behavior for better compatibility
  - Removed `process.exit(1)` calls that terminated the entire process
  - Removed `testMode` property and Platform dependency (no longer needed)
  - Now simply throws Error objects with "Test failed: " prefix for all failures
  - Maintains proper error stack traces for better debugging
  - Compatible with all test frameworks without special configuration

### Improved

- **Error Handling**: More predictable and standard JavaScript error handling behavior
- **Test Framework Compatibility**: Works seamlessly with Mocha, Jest, and other test runners
- **Debugging Experience**: Preserves full stack traces when assertions fail

## [0.5.1] - 2025-06-12

### Fixed

- **Assert.js**: Consolidated redundant `testMode` and `insideTestRunner` variables into single `testMode` variable for cleaner, more maintainable code
- **Test Cleanup**: Added automatic cleanup of test-generated log files after test completion
  - `node-console-log.test.js` now removes `log.txt` after tests
  - `node-log-to-file.test.js` now removes all test log files and directories after tests

### Changed

- **Documentation**: Significantly enhanced README.md with comprehensive module documentation, better structure, usage examples, and professional presentation
- **Test Environment**: Tests now maintain clean workspace by automatically removing generated files

## [0.5.0] - 2025-06-12

### Fixed

- **Util.linearConversionWithMaxAndMin**: Fixed test parameter naming to match function signature
- **Util.removeTagsFromString**: Added Node.js compatibility with regex fallback when DOM is not available

### Added

- **Test Runner**: Implemented comprehensive, zero-dependency test runner with modern expect API
  - New `test/test-runner.js` with fluent assertion methods
  - Complete test coverage for all previously untested modules
  - Updated all existing tests to use new test runner
  - **Enhanced Error Messages**: All expect methods now accept optional descriptive messages for better test failure reporting
- **Assert.js**: Enhanced with new assertion methods
  - `assertHasProperty`, `assertHasLength`, `assertIsType`
  - `assertThrowsWithMessage`, `assertContains`
  - Improved error messages and Node.js compatibility
- **Node.js Module Tests**: Added comprehensive test coverage for Node.js-specific modules
  - `node/node-http-request.test.js` - HTTP request functionality testing
  - `node/node-console-log.test.js` - Console log override functionality testing
  - `node/mixins/node-log-to-file.test.js` - File logging mixin testing

### Changed

- **Test Quality Improvement**: Systematically removed all assertion/check comments from test files and converted them into descriptive error messages for better debugging experience
- **Code Clarity**: All test assertions now use descriptive messages as third parameter to expect methods instead of inline comments
- **Documentation**: Updated README and test documentation to reflect new testing best practices

## [0.4.0] - 2025-06-11

### Changed

- **Architecture Refactor**: Converted singleton pattern utilities to regular function constructors for better encapsulation and flexibility
  - `FileStore`: Converted from class to function constructor with proper closure-based privacy
  - `CommWSUtil`: Converted from static class to function constructor, enabling multiple WebSocket connections
  - `Localization`: Enhanced from factory function to constructor with improved API and state management

### Fixed

- **FileStore**: Fixed database initialization timing issues and transaction handling
  - Added pending operations queue to handle calls before database is ready
  - Replaced deprecated `IDBTransaction` constants with standard string values
  - Fixed `getFile` method transaction handling and event processing
- **CommWSUtil**: Improved WebSocket connection reliability
  - Added WebSocket state checking before sending messages
  - Enhanced error handling and reconnection logic
  - Better separation of concerns with private methods

### Added

- **Enhanced Localization API**: New methods for better usability
  - `getCurrentLanguage()`: Get current language setting
  - `getString(key)`: Get specific localized string by key
  - `updateLanguage(newLanguage, newSymbols)`: Dynamically change language
  - `getSupportedLanguages()`: Get list of supported languages
  - `getLocalizedStrings()`: Get all localized strings (returns immutable copy)

### Removed

- **Singleton Pattern**: Removed singleton implementations in favor of regular constructors
  - Files moved from `util/singleton/` to `util/` directory
  - Static class methods converted to instance methods

### Migration Guide

- **FileStore**: `const fileStore = new FileStore()` (same usage)
- **CommWSUtil**: `const commUtil = new CommWSUtil(); commUtil.start(...)` (instead of `CommWSUtil.start(...)`)
- **Localization**: `const localizer = new Localization(lang, symbols); localizer.getString(key)` (instead of direct property access)

### Technical Notes

- All utilities now use closure-based privacy for better encapsulation
- Function constructors provide better flexibility than singleton patterns
- Breaking changes require major version bump (0.3.x → 0.4.x)

## [0.3.2] - 2025-06-10

### Fixed

- **ES Module Compatibility**: Replaced all `require()` statements with dynamic `import()` for Node.js built-in modules
  - Updated `node/node-http-request.js` to use `import("http")` and `import("https")`
  - Updated `node/node-console-log.js` to use `import("fs")`
  - Updated `node/mixins/node-log-to-file.js` to use `import("fs")`
- **Mocha Test Compatibility**: Fixed interference with Mocha tests in projects that import this library
- **Pure ES Modules**: Library now uses ES modules throughout, eliminating CommonJS/ESM mixing issues

### Changed

- Node.js utility functions are now `async` functions due to dynamic imports
- Function signatures updated to reflect async nature in JSDoc documentation

### Technical Notes

- This change ensures compatibility with modern testing frameworks like Mocha
- Maintains backward compatibility while using modern ES module patterns
- Supports Node.js 14+ with native ES module support

## [0.3.0] - 2025-06-10

### Added

- **Complete JSDoc type annotations** across all utility functions
- **Comprehensive documentation** with parameter types, return types, and usage examples
- **Enhanced IDE support** with IntelliSense and auto-completion for all functions
- **Type safety** without compilation requirements - pure JavaScript with rich type information

### Enhanced Modules with JSDoc Types

- **Time utilities** (`time/time.js`, `time/time-constrained-action.js`)

  - `frequencyToDelay`, `currentTime`, `getCurrentUnixTimeStamp`, `dateAs_yyyy_mm_dd_hh_mm_ss`
  - `runUntilConditionReady`, `returnWhenConditionReady`, `callWithDelay`, `wait`

- **Array enhancements** (`enhancements/e-array.js`)

  - Mathematical functions: `sum`, `mean`, `meanDifferenceTwoByTwo`
  - Array access: `lastIndex`, `last`, `first`, `isLast`, `isFirst`
  - Transformations: `flatten`, `unflatten`, `removeLast`, `clone`
  - Random selection: `choiceWithProbabilities`, `choice`, `indexChoice`
  - Utilities: `indexOfGreaterValue`, `range` (generator function)

- **Function enhancements** (`enhancements/e-function.js`)

  - `sequence`, `compose` - function composition utilities
  - `memoize` - function memoization with cache eviction
  - `limitCallingRateWithDiscard` - rate limiting
  - `addRuntimeTypeTest` - runtime type validation
  - `registerObserver`, `unregisterObserver` - observer pattern

- **Object utilities** (`enhancements/e-object.js`)

  - `isEmpty`, `swapObjectKeysAndValues`, `hasSameProperties`, `extend`

- **String utilities** (`enhancements/e-string.js`)

  - `capitalize`, `replaceAll`, `createHash`

- **Assertion library** (`util/assert.js`)

  - Comprehensive type checking functions with detailed documentation
  - Boolean, null/undefined, array, object, and custom type assertions
  - Runtime validation utilities

- **Browser utilities** (`util/browser-util.js`)

  - Video format detection, fullscreen management, orientation locking

- **Mathematical utilities** (`util/util.js`)

  - Precision handling, range conversions, trigonometric functions
  - Linear mapping, text processing, file download utilities

- **Communication utilities** (`util/comm-util.js`)

  - HTTP request handling with Promise interface

- **Storage utilities**

  - Cookie management (`util/cookie.js`)
  - LocalStorage persistence (`util/persistence.js`)
  - IndexedDB file storage (`util/singleton/file-store.js`)

- **Localization** (`util/singleton/localization.js`)

  - Multi-language support with automatic browser detection

- **Random utilities** (`util/random.js`)

  - Various random number generation and probability functions

- **Audio utilities** (`util/sound.js`)

  - Audio playback management and looping

- **Canvas utilities** (`util/canvas-util.js`)

  - Canvas manipulation and drawing utilities

- **Image utilities** (`util/image-util.js`)

  - Pie chart generation and canvas creation

- **Data structures** (`data-structures/fifo.js`)

  - FIFO queue implementation

- **Node.js utilities**

  - HTTP request handling (`node/node-http-request.js`)
  - Enhanced console logging (`node/node-console-log.js`)
  - Structured file logging mixin (`node/mixins/node-log-to-file.js`)

- **Observable pattern** (`mixins/observable.js`)
  - Event-driven programming utilities

### Fixed

- **Bug fix in `assert.js`**: Corrected condition in `assertIsArrayOfNumbers` and `assertIsArrayOfObjects`
- **Bug fix in `e-string.js`**: Fixed `capitalize` function to use correct string reference

### Changed

- **Repository field** in package.json now properly formatted as object
- **Enhanced documentation** throughout the codebase with consistent JSDoc format

## [0.2.1] - Previous Release

### Features

- Core utility library with comprehensive JavaScript enhancements
- Time management utilities
- Array and object manipulation functions
- Browser compatibility utilities
- Node.js specific functions
- Data structures (FIFO)
- Observable pattern implementation
- Mathematical and random utilities
- File and storage management
- Communication helpers

---

## Contributing

When adding new features or making changes, please:

1. Add appropriate JSDoc type annotations
2. Include usage examples in documentation
3. Add tests for new functionality
4. Update this CHANGELOG.md file
5. Follow semantic versioning for version numbers

## Version Number Guidelines

- **Major version** (X.0.0): Breaking changes
- **Minor version** (0.X.0): New features, backwards compatible
- **Patch version** (0.0.X): Bug fixes, backwards compatible
