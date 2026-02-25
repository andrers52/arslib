import { TestRunner, expect } from "../test/test-runner.js";
import { TimeConstrainedAction } from "./time-constrained-action.js";

const runner = new TestRunner();

runner.test("TimeConstrainedAction.wait waits for specified time", async () => {
  const startTime = Date.now();
  const result = await TimeConstrainedAction.wait(100);
  const endTime = Date.now();

  expect.toBeTruthy(result, "Wait should resolve successfully");
  expect.toBeTruthy(
    endTime - startTime >= 95,
    "Should wait at least 95ms (allowing for timing variance)",
  );
  expect.toBeTruthy(
    endTime - startTime < 150,
    "Should not wait more than 150ms",
  );
});

runner.test(
  "TimeConstrainedAction.callWithDelay calls function after delay",
  async () => {
    let called = false;
    const testFunction = (arg1, arg2) => {
      called = true;
      return arg1 + arg2;
    };

    const startTime = Date.now();
    const result = await TimeConstrainedAction.callWithDelay(
      testFunction,
      100,
      [5, 3],
    );
    const endTime = Date.now();

    expect.toBeTruthy(called, "Function should be called after delay");
    expect.toBe(result, 8, "Function should return correct result (5 + 3 = 8)");
    expect.toBeTruthy(
      endTime - startTime >= 95,
      "Should wait at least 95ms before calling function",
    );
    expect.toBeTruthy(
      endTime - startTime < 150,
      "Should not wait more than 150ms",
    );
  },
);

runner.test(
  "TimeConstrainedAction.runUntilConditionReady works with immediate condition",
  async () => {
    let fnCallCount = 0;
    let executeCallCount = 0;

    const fnToRun = () => {
      fnCallCount++;
    };
    const conditionFn = () => true; // Always ready
    const executeFn = () => {
      executeCallCount++;
    };

    const result = await TimeConstrainedAction.runUntilConditionReady(
      fnToRun,
      conditionFn,
      executeFn,
      50,
    );

    expect.toBeTruthy(
      result,
      "Should succeed when condition is immediately true",
    );
    expect.toBe(executeCallCount, 1, "Execute function should be called once");
    expect.toBe(
      fnCallCount,
      0,
      "Polling function should not be called when condition is immediately true",
    );
  },
);

runner.test(
  "TimeConstrainedAction.runUntilConditionReady works with delayed condition",
  async () => {
    let fnCallCount = 0;
    let executeCallCount = 0;
    let conditionMet = false;

    setTimeout(() => {
      conditionMet = true;
    }, 80);

    const fnToRun = () => {
      fnCallCount++;
    };
    const conditionFn = () => conditionMet;
    const executeFn = () => {
      executeCallCount++;
    };

    const startTime = Date.now();
    const result = await TimeConstrainedAction.runUntilConditionReady(
      fnToRun,
      conditionFn,
      executeFn,
      25,
    );
    const endTime = Date.now();

    expect.toBeTruthy(result, "Should succeed when condition becomes true");
    expect.toBe(
      executeCallCount,
      1,
      "Execute function should be called once when condition is met",
    );
    expect.toBeTruthy(
      fnCallCount > 0,
      "Polling function should be called multiple times while waiting",
    );
    expect.toBeTruthy(
      endTime - startTime >= 75,
      "Should wait at least until condition becomes true",
    );
  },
);

runner.test(
  "TimeConstrainedAction.runUntilConditionReady times out correctly",
  async () => {
    let fnCallCount = 0;
    let executeCallCount = 0;

    const fnToRun = () => {
      fnCallCount++;
    };
    const conditionFn = () => false; // Never ready
    const executeFn = () => {
      executeCallCount++;
    };

    const startTime = Date.now();
    const result = await TimeConstrainedAction.runUntilConditionReady(
      fnToRun,
      conditionFn,
      executeFn,
      25,
      100, // Max wait time of 100ms
    );
    const endTime = Date.now();

    expect.toBeFalsy(
      result,
      "Should timeout and return false when condition never becomes true",
    );
    expect.toBe(
      executeCallCount,
      0,
      "Execute function should not be called on timeout",
    );
    expect.toBeTruthy(
      fnCallCount > 0,
      "Polling function should be called multiple times during timeout",
    );
    expect.toBeTruthy(
      endTime - startTime >= 100,
      "Should wait at least the specified max wait time",
    );
    expect.toBeTruthy(
      endTime - startTime < 150,
      "Should not wait significantly longer than max wait time",
    );
  },
);

runner.test(
  "TimeConstrainedAction.runUntilConditionReady with startWaiting=true",
  async () => {
    let fnCallCount = 0;
    let executeCallCount = 0;
    let conditionMet = false;

    conditionMet = true;

    const fnToRun = () => {
      fnCallCount++;
    };
    const conditionFn = () => conditionMet;
    const executeFn = () => {
      executeCallCount++;
    };

    const startTime = Date.now();
    const result = await TimeConstrainedAction.runUntilConditionReady(
      fnToRun,
      conditionFn,
      executeFn,
      50,
      null,
      null,
      true, // Start waiting
    );
    const endTime = Date.now();

    expect.toBeTruthy(result, "Should succeed with startWaiting=true");
    expect.toBe(executeCallCount, 1, "Execute function should be called once");
    expect.toBeTruthy(
      endTime - startTime >= 45,
      "Should wait at least one interval even when condition is immediately true",
    );
  },
);

runner.test(
  "TimeConstrainedAction.callWithDelay with no arguments",
  async () => {
    let called = false;
    const testFunction = () => {
      called = true;
      return "success";
    };

    const result = await TimeConstrainedAction.callWithDelay(testFunction, 50);

    expect.toBeTruthy(
      called,
      "Function should be called even without arguments",
    );
    expect.toBe(result, "success", "Function should return correct result");
  },
);

// Run all tests
runner.run();
