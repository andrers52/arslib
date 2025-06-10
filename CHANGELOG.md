# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
