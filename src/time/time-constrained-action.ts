// @ts-nocheck
import { Time } from "./time.js";

export class TimeConstrainedAction {
// actions based on temporal constraint



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
  static runUntilConditionReady = (FnToRun: any, conditionFn: any, ExecuteWhenReadyFn: any, testInterval: any, maxWaitTime: any = null, message: any = null, startWaiting: any = false, ) => {
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
  static returnWhenConditionReady = (conditionFn: any, testInterval: any, maxWaitTime: any = null, message: any = null, startWaiting: any = false, ) => {
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
  static callWithDelay = async (func: any, time: any, argsArray: any = []) => {
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
  static wait = async (time: any) => {
  return new Promise((resolve) => setTimeout(() => resolve(true), time));
};


}
