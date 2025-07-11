import { strict as assert } from "assert";
import { TimeConstrainedAction } from "./time-constrained-action.js";

describe("TimeConstrainedAction", function() {
  it("wait waits for specified time", async function() {
    const startTime = Date.now();
    const result = await TimeConstrainedAction.wait(100);
    const endTime = Date.now();
    assert.ok(result, "Wait should resolve successfully");
    assert.ok(endTime - startTime >= 95, "Should wait at least 95ms (allowing for timing variance)");
    assert.ok(endTime - startTime < 150, "Should not wait more than 150ms");
  });

  it("callWithDelay calls function after delay", async function() {
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
    assert.ok(called, "Function should be called after delay");
    assert.strictEqual(result, 8, "Function should return correct result (5 + 3 = 8)");
    assert.ok(endTime - startTime >= 95, "Should wait at least 95ms before calling function");
    assert.ok(endTime - startTime < 150, "Should not wait more than 150ms");
  });

  it("runUntilConditionReady works with immediate condition", async function() {
    let fnCallCount = 0;
    let executeCallCount = 0;
    const fnToRun = () => { fnCallCount++; };
    const conditionFn = () => true;
    const executeFn = () => { executeCallCount++; };
    const result = await TimeConstrainedAction.runUntilConditionReady(
      fnToRun,
      conditionFn,
      executeFn,
      50,
    );
    assert.ok(result, "Should succeed when condition is immediately true");
    assert.strictEqual(executeCallCount, 1, "Execute function should be called once");
    assert.strictEqual(fnCallCount, 0, "Polling function should not be called when condition is immediately true");
  });

  it("runUntilConditionReady works with delayed condition", async function() {
    let fnCallCount = 0;
    let executeCallCount = 0;
    let conditionMet = false;
    setTimeout(() => { conditionMet = true; }, 80);
    const fnToRun = () => { fnCallCount++; };
    const conditionFn = () => conditionMet;
    const executeFn = () => { executeCallCount++; };
    const startTime = Date.now();
    const result = await TimeConstrainedAction.runUntilConditionReady(
      fnToRun,
      conditionFn,
      executeFn,
      25,
    );
    const endTime = Date.now();
    assert.ok(result, "Should succeed when condition becomes true");
    assert.strictEqual(executeCallCount, 1, "Execute function should be called once when condition is met");
    assert.ok(fnCallCount > 0, "Polling function should be called multiple times while waiting");
    assert.ok(endTime - startTime >= 75, "Should wait at least until condition becomes true");
  });

  it("runUntilConditionReady times out correctly", async function() {
    let fnCallCount = 0;
    let executeCallCount = 0;
    const fnToRun = () => { fnCallCount++; };
    const conditionFn = () => false;
    const executeFn = () => { executeCallCount++; };
    const startTime = Date.now();
    const result = await TimeConstrainedAction.runUntilConditionReady(
      fnToRun,
      conditionFn,
      executeFn,
      25,
      100,
    );
    const endTime = Date.now();
    assert.ok(!result, "Should timeout and return false when condition never becomes true");
    assert.strictEqual(executeCallCount, 0, "Execute function should not be called on timeout");
    assert.ok(fnCallCount > 0, "Polling function should be called multiple times during timeout");
    assert.ok(endTime - startTime >= 100, "Should wait at least the specified max wait time");
    assert.ok(endTime - startTime < 150, "Should not wait significantly longer than max wait time");
  });

  it("runUntilConditionReady with startWaiting=true", async function() {
    let fnCallCount = 0;
    let executeCallCount = 0;
    let conditionMet = false;
    conditionMet = true;
    const fnToRun = () => { fnCallCount++; };
    const conditionFn = () => conditionMet;
    const executeFn = () => { executeCallCount++; };
    const startTime = Date.now();
    const result = await TimeConstrainedAction.runUntilConditionReady(
      fnToRun,
      conditionFn,
      executeFn,
      50,
      null,
      null,
      true,
    );
    const endTime = Date.now();
    assert.ok(result, "Should succeed with startWaiting=true");
    assert.strictEqual(executeCallCount, 1, "Execute function should be called once");
    assert.ok(endTime - startTime >= 45, "Should wait at least one interval even when condition is immediately true");
  });

  it("callWithDelay with no arguments", async function() {
    let called = false;
    const testFunction = () => {
      called = true;
      return "success";
    };
    const result = await TimeConstrainedAction.callWithDelay(testFunction, 50);
    assert.ok(called, "Function should be called even without arguments");
    assert.strictEqual(result, "success", "Function should return correct result");
  });
});