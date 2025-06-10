// actions based on temporal constraint

"use strict";

import { Time } from "./time.js";

let TimeConstrainedAction = {};

/**
 * Runs a function repeatedly until a condition is met, then executes a callback
 * @param {Function} FnToRun - Function to run repeatedly while waiting for condition
 * @param {Function} conditionFn - Function that returns a boolean indicating if condition is met
 * @param {Function} ExecuteWhenReadyFn - Function to execute when condition is ready
 * @param {number} testInterval - Interval in milliseconds between condition checks
 * @param {number|null} maxWaitTime - Maximum time to wait in milliseconds, null for no limit
 * @param {string|null} message - Optional message to log while waiting
 * @param {boolean} startWaiting - Whether to start with a delay (true) or immediately (false)
 * @returns {Promise<boolean>} Promise that resolves to true when condition is met, false if timeout
 */
TimeConstrainedAction.runUntilConditionReady = (
  FnToRun,
  conditionFn,
  ExecuteWhenReadyFn,
  testInterval,
  maxWaitTime = null,
  message = null,
  startWaiting = false,
) => {
  let initialTime = Time.currentTime();
  return new Promise((resolve) => {
    let tester = () => {
      if (conditionFn()) {
        ExecuteWhenReadyFn();
        resolve(true);
        return;
      }
      FnToRun();
      if (maxWaitTime) {
        let currentTime = Time.currentTime();
        if (currentTime - initialTime > maxWaitTime) {
          resolve(false);
          return;
        }
      }
      if (message) console.log("waiting for: " + message);
      setTimeout(tester, testInterval);
    };
    if (startWaiting) setTimeout(tester, testInterval); // first interval
    else tester(); // start right away
  });
};

/**
 * Returns a promise that resolves when a condition is ready
 * @param {Function} conditionFn - Function that returns a boolean indicating if condition is met
 * @param {number} testInterval - Interval in milliseconds between condition checks
 * @param {number|null} maxWaitTime - Maximum time to wait in milliseconds, null for no limit
 * @param {string|null} message - Optional message to log while waiting
 * @param {boolean} startWaiting - Whether to start with a delay (true) or immediately (false)
 * @returns {Promise<boolean>} Promise that resolves to true when condition is met, false if timeout
 */
TimeConstrainedAction.returnWhenConditionReady = (
  conditionFn,
  testInterval,
  maxWaitTime = null,
  message = null,
  startWaiting = false,
) => {
  TimeConstrainedAction.runUntilConditionReady(
    () => {},
    conditionFn,
    () => {},
    testInterval,
    maxWaitTime,
    message,
    startWaiting,
  );
};

/**
 * Calls a function with a specified delay
 * @param {Function} func - The function to call after the delay
 * @param {number} time - Delay time in milliseconds
 * @param {Array} argsArray - Array of arguments to pass to the function
 * @returns {Promise<any>} Promise that resolves with the function's return value
 */
TimeConstrainedAction.callWithDelay = async (func, time, argsArray = []) => {
  let asyncCallback = async (resolve) => {
    resolve(await func.apply(this, argsArray));
  };
  return new Promise((resolve) => {
    setTimeout(() => asyncCallback(resolve), time);
  });
};

/**
 * Waits for a specified amount of time
 * @param {number} time - Time to wait in milliseconds
 * @returns {Promise<boolean>} Promise that resolves to true after the specified time
 */
TimeConstrainedAction.wait = async (time) => {
  return new Promise((resolve) => setTimeout(() => resolve(true), time));
};

export { TimeConstrainedAction };
