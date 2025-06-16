"use strict";

import { Assert } from "../assert.js";
var EFunction = {};

/**
 * Runs both functions sequentially with the same arguments and returns result of the last one
 * @param {Function} f - First function to execute
 * @param {Function} g - Second function to execute (its result will be returned)
 * @param {Object} context - The functions' 'this' context. If not provided, current 'this' will be used
 * @returns {Function} A new function that executes f then g with the same arguments
 */
//run both functions with the same arguments and return result of the last one
// NOTE: 'context' is the functions' 'this'. If not provided, current 'this' will
//       be used.
EFunction.sequence = (f, g, context) => {
  Assert.assertIsFunction(f);
  Assert.assertIsFunction(g);
  Assert.assert(context, "No function running context found.");
  let self = context || this;
  let fBounded = f.bind(self);
  let gBounded = g.bind(self);
  return (arg) => {
    fBounded(arg);
    return gBounded(arg);
  };
};

/**
 * Composes functions and returns the final transformation of input passed through them
 * @param {Function} f - Outer function that receives the result of g
 * @param {Function} g - Inner function that processes the initial argument
 * @param {Object} context - The functions' 'this' context. If not provided, current 'this' will be used
 * @returns {Function} A new function that executes f(g(args))
 */
//compose functions and return the final transformation of input passed throught them
//EFunction.compose(f,g) -> f(g(args))
EFunction.compose = (f, g, context) => {
  Assert.assertIsFunction(f);
  Assert.assertIsFunction(g);
  Assert.assert(context, "No function running context found.");
  let self = context || this;
  let fBounded = f.bind(self);
  let gBounded = g.bind(self);
  let intermediaryResult = null;
  return (arg) => {
    intermediaryResult = gBounded(arg);
    return fBounded(intermediaryResult);
  };
};

/*
//TODO: continue when needed...
//put in simulation after separating concerns with a worker
Function.addThrottleControl = function(functionToBeThrottled, ...args) {
// let startDrawTime, endDrawTime;
// startDrawTime = endDrawTime = Date.now();
// let drawTimeIntegral = 0;
// let drawTimeCounter = 1;
return function throttleControl() {

// startDrawTime = Date.now();
// if ((drawTimeIntegral / drawTimeCounter) < BEClient.Definitions.ANIMATION_INTERVAL) {

functionToBeThrottled.apply(args);

// }
// endDrawTime = Date.now();
// drawTimeIntegral += endDrawTime - startDrawTime;
// drawTimeCounter++;
// if (drawTimeCounter > 100000) {//restart timer to avoid geting negative
//   drawTimeIntegral = drawTimeCounter = 1;
// }
throttleControl();//tail call (need tco to not explode the stack)
}
};
*/

/**
 * Memoizes a function that has one argument, which supports "toString()" for cache key generation.
 *
 * @param {Function} f - The function to be memoized.
 * @param {number} [maxEntries=1000000] - The maximum number of entries in the cache before eviction starts.
 * @returns {Function} - A memoized version of the input function.
 *
 * @example
 * // Define a simple function that squares a number
 * function square(n) { return n * n; }
 *
 * // Memoize the square function
 * const memoizedSquare = EFunction.memoize(square);
 *
 * // Correct usage
 * memoizedSquare(2); // 4
 * memoizedSquare(2); // 4 (retrieved from cache)
 */
EFunction.memoize = (f, maxEntries = 1000000) => {
  let cache = {};
  let count = 0;
  return (arg) => {
    const key = arg.toString(); // Ensure the key is a string
    if (key in cache) {
      return cache[key];
    } else {
      if (count < maxEntries) {
        count++;
        return (cache[key] = f(arg));
      }
      // random eviction:
      let keys = Object.keys(cache);
      let randomKey = keys[Math.floor(Math.random() * keys.length)];
      delete cache[randomKey];
      return (cache[key] = f(arg));
    }
  };
};

/**
 * Limits the calling rate of a function to a given delay. Discards extra calls made within the delay period.
 * @param {Function} f - The function to be rate-limited
 * @param {number} delay - The delay in milliseconds to wait before allowing the function to be called again
 * @returns {Function} A rate-limited version of the input function that only allows calls at the specified interval
 */
EFunction.limitCallingRateWithDiscard = (f, delay) => {
  let canCall = true;
  return (arg) => {
    if (!canCall) return;
    canCall = false;
    setTimeout(() => {
      canCall = true;
    }, delay);
    return f(arg);
  };
};

/**
 * Adds runtime type assertions to a function's arguments and return value.
 *
 * @param {Function} fn - The function to add type assertions to.
 * @param {Array<string>} argsTypesArray - An array of strings representing the expected types of the function's arguments.
 * @param {string} resultType - A string representing the expected return type of the function. Can be any type recognizable by `typeof` or 'void'.
 * @param {Object} [context] - An optional context to bind to the function.
 * @returns {Function} - A new function with runtime type assertions for its arguments and return value.
 * @throws {Error} - Throws an error if an argument or the return value does not match the expected type.
 *
 * @example
 * // Define a simple sum function
 * function sum(a, b) { return a + b; }
 *
 * // Add type assertions to the sum function
 * sum = EFunction.addRuntimeTypeTest(sum, ['number', 'number'], 'number');
 *
 * // Correct usage results in the expected return value
 * sum(1, 2); // 3
 *
 * // Incorrect usage throws an error
 * sum('asdf', 'wer'); // Throws "Error: function argument asdf expected to be of type number"
 */
EFunction.addRuntimeTypeTest = (fn, argsTypesArray, resultType, context) => {
  return (...args) => {
    for (let argIndex = 0; argIndex <= argsTypesArray.length; argIndex++) {
      if (
        args[argIndex] &&
        (typeof args[argIndex] !== argsTypesArray[argIndex] ||
          (argsTypesArray[argIndex] === "array" &&
            !Array.isArray(args[argIndex])))
      ) {
        throw `Error: function argument ${args[argIndex]} expected to be of type ${argsTypesArray[argIndex]}`;
      }
    }

    let result = context ? fn.call(context, ...args) : fn(...args);

    if (resultType === "void") return;
    if (resultType === "array") {
      if (!Array.isArray(result)) {
        throw "Error: function return type expected to be of type 'array'";
      }
    } else if (typeof result !== resultType) {
      throw `Error: function return type expected to be of type ${resultType}`;
    }
    return result;
  };
};

// *** OBSERVE ***
var observedFncId = 0;
var observedToObservers = {};

/**
 * Runs all registered observers for a given observed function
 * @param {number} observed - The ID of the observed function
 */
function runObservers(observed) {
  observedToObservers[observed].forEach((observer) => {
    observer();
  });
}

/**
 * Adds an observer to function invocation (creates new function with observer call)
 * @param {Function} observedFnc - The function to be observed
 * @param {Function} observerFnc - The observer function to be called after the observed function
 * @returns {Function} The observed function (possibly wrapped to call observers)
 */
//add observer to function invocation (creates new function with observer call)
EFunction.registerObserver = (observedFnc, observerFnc) => {
  let result;
  if (observedToObservers[observedFnc.id]) {
    observedToObservers[observedFnc.id].push(observerFnc);
    result = observedFnc;
  } else {
    observedFnc.id = observedFncId++;
    observedToObservers[observedFnc.id] = [observerFnc];
    result = (arg) => {
      observedFnc(arg);
      runObservers(observedFnc.id);
    };
  }
  return result;
};

/**
 * Removes an observer from a function (creates new function without the observer)
 * @param {Function} observedFnc - The observed function to remove observer from
 * @param {Function} observerFnc - The observer function to remove
 * @returns {Function} The observed function without the specified observer
 */
//remove observer (create new function without the observer)
EFunction.unregisterObserver = (observedFnc, observerFnc) => {
  if (!observedToObservers[observedFnc.id]) return observedFnc;
  observedToObservers[observedFnc.id] = observedToObservers[
    observedFnc.id
  ].filter((observer) => {
    return observer !== observerFnc;
  });
  return observedFnc;
};

export { EFunction };
