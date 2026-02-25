import { TestRunner, expect } from "./test/test-runner.js";
import { LanguageConstruct } from "./language-construct.js";

const runner = new TestRunner();

runner.test("LanguageConstruct.probabilitySwitch throws with odd number of parameters", () => {
  expect.toThrow(
    () => LanguageConstruct.probabilitySwitch(() => {}, 0.5, () => {}),
    "Expecting an even number of parameters",
    "Should throw when odd number of parameters",
  );
});

runner.test("LanguageConstruct.probabilitySwitch throws with non-function", () => {
  expect.toThrow(
    () => LanguageConstruct.probabilitySwitch("not a function", 0.5, () => {}, 0.5),
    "Expected (func1, prob1, func2, prob2,..., funcN, probN)",
    "Should throw when first parameter is not a function",
  );
});

runner.test("LanguageConstruct.probabilitySwitch throws with non-number probability", () => {
  expect.toThrow(
    () => LanguageConstruct.probabilitySwitch(() => {}, "not a number", () => {}, 0.5),
    "Expected (func1, prob1, func2, prob2,..., funcN, probN)",
    "Should throw when probability is not a number",
  );
});

runner.test("LanguageConstruct.probabilitySwitch executes one of the functions", () => {
  let func1Called = false;
  let func2Called = false;
  
  const result = LanguageConstruct.probabilitySwitch(
    () => { func1Called = true; return 1; },
    0.5,
    () => { func2Called = true; return 2; },
    0.5
  );
  
  // One of the functions should have been called
  expect.toBeTruthy(
    (func1Called && !func2Called) || (!func1Called && func2Called),
    "Exactly one function should be called",
  );
  expect.toBeTruthy(
    result === 1 || result === 2,
    "Should return result from one of the functions",
  );
});

runner.test("LanguageConstruct.probabilitySwitch with 100% probability always selects that function", () => {
  let func1Called = false;
  let func2Called = false;
  
  // Run multiple times to verify consistency
  for (let i = 0; i < 10; i++) {
    func1Called = false;
    func2Called = false;
    
    LanguageConstruct.probabilitySwitch(
      () => { func1Called = true; },
      1.0,
      () => { func2Called = true; },
      0.0
    );
    
    expect.toBeTruthy(
      func1Called && !func2Called,
      "Function with 100% probability should always be selected",
    );
  }
});

runner.test("LanguageConstruct.probabilitySwitch with three functions works correctly", () => {
  let func1Called = false;
  let func2Called = false;
  let func3Called = false;
  
  const result = LanguageConstruct.probabilitySwitch(
    () => { func1Called = true; return 1; },
    0.33,
    () => { func2Called = true; return 2; },
    0.33,
    () => { func3Called = true; return 3; },
    0.34
  );
  
  // Exactly one function should have been called
  const calledCount = [func1Called, func2Called, func3Called].filter(Boolean).length;
  expect.toBe(calledCount, 1, "Exactly one function should be called");
  expect.toBeTruthy(
    result === 1 || result === 2 || result === 3,
    "Should return result from one of the functions",
  );
});

// Run all tests
runner.run();
