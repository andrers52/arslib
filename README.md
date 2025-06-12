# Andre's JavaScript Utility library

## Usage example:

(browser import) -> import {Util} from '<relative_path_to_node_modules>/arslib/util/util.js'
(node import) -> import {Util} from 'arslib'

console.log(Util.limitValueToMinMax(10, 5, 11))

## Importing

To check wich files you can import, look into index.js, in the package root folder.

## NPM package page

(https://www.npmjs.com/package/arslib)[https://www.npmjs.com/package/arslib]

## NPM package installation

```bash
npm install arslib
```

## Run tests

```bash
npm test
```

## Creating new tests

This library uses a custom, zero-dependency test runner. To create new tests:

1. Create a `.test.js` file in the same directory as your module
2. Import the test runner and expect API:

```javascript
import { TestRunner, expect } from "../test/test-runner.js";
import { YourModule } from "./your-module.js";

const runner = new TestRunner();

runner.test("Your test description", () => {
  const result = YourModule.someFunction();
  expect.toBe(
    result,
    expectedValue,
    "Function should return expected calculated value",
  );
});

// Run all tests
runner.run();
```

Available assertions via `expect` (all accept optional descriptive messages):

- `toBe(actual, expected, message?)` - strict equality
- `toBeTruthy(value, message?)` - truthy check
- `toBeFalsy(value, message?)` - falsy check
- `toThrow(fn, expectedMessage?, message?)` - expects function to throw
- `toDoesNotThrow(fn, message?)` - expects function not to throw
- `toBeType(value, type, message?)` - type checking
- `toHaveLength(array, length, message?)` - array length check
- `toHaveProperty(object, property, message?)` - object property check
