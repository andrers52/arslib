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

Remember to add

```javascript
Assert.testMode = true;
```

at the beginning of your test file. This allows node process to fail when an assertion fails. So the test script knows when a test has failed.
