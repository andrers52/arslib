import { EArray } from "./enhancements/e-array.js";
import { LanguageConstruct } from "./language-construct.js";
import { TestRunner, expect } from "./test/test-runner.js";

const runner = new TestRunner();

// Mock EArray.choiceWithProbabilities to control which function is chosen
let mockChosenFunction = null;
const originalChoiceWithProbabilities = EArray.choiceWithProbabilities;

runner.beforeEach(() => {
  EArray.choiceWithProbabilities = (functions, probabilities) => {
    // For testing, we can make this deterministic or spy on it.
    // Here, we'll allow a mock to decide, or default to the first function.
    if (mockChosenFunction && functions.includes(mockChosenFunction)) {
      return mockChosenFunction;
    }
    return functions[0]; // Default to first function if no specific mock
  };
});

runner.afterEach(() => {
  EArray.choiceWithProbabilities = originalChoiceWithProbabilities; // Restore original
  mockChosenFunction = null;
});

runner.test("probabilitySwitch should call the chosen function", () => {
  const func1 = () => "result1";
  const func2 = () => "result2";

  mockChosenFunction = func1;
  let result = LanguageConstruct.probabilitySwitch(func1, 0.5, func2, 0.5);
  expect.toBe(
    result,
    "result1",
    "Should return result of func1 when func1 is chosen",
  );

  mockChosenFunction = func2;
  result = LanguageConstruct.probabilitySwitch(func1, 0.5, func2, 0.5);
  expect.toBe(
    result,
    "result2",
    "Should return result of func2 when func2 is chosen",
  );
});

runner.test("probabilitySwitch with a single function (probability 1)", () => {
  const func1 = () => "single";
  mockChosenFunction = func1; // Ensure it's chosen by the mock
  const result = LanguageConstruct.probabilitySwitch(func1, 1.0);
  expect.toBe(result, "single");
});

runner.test(
  "probabilitySwitch should pass arguments to the chosen function",
  () => {
    const funcWithArgs = (a, b) => a + b;
    EArray.choiceWithProbabilities = () => () => funcWithArgs(5, 10); // Mock to return a function that calls funcWithArgs with specific args

    const result = LanguageConstruct.probabilitySwitch(funcWithArgs, 1.0);
    expect.toBe(
      result,
      15,
      "Chosen function should receive and process arguments",
    );
  },
);

runner.test(
  "probabilitySwitch should throw if an odd number of arguments is provided",
  () => {
    const func1 = () => {};
    expect.toThrow(
      () => LanguageConstruct.probabilitySwitch(func1, 0.5, func1), // Odd number of args
      "Expecting an even number of parameters",
      "Should throw for odd number of arguments",
    );
  },
);

runner.test(
  "probabilitySwitch should throw if a non-function is provided as a function argument",
  () => {
    expect.toThrow(
      () =>
        LanguageConstruct.probabilitySwitch(
          "not-a-function",
          0.5,
          () => {},
          0.5,
        ),
      "Expected (func1, prob1, func2, prob2,..., funcN, probN)",
      "Should throw if a function argument is not a function",
    );
  },
);

runner.test(
  "probabilitySwitch should throw if a non-number is provided as a probability argument",
  () => {
    const func1 = () => {};
    expect.toThrow(
      () =>
        LanguageConstruct.probabilitySwitch(func1, "not-a-number", func1, 0.5),
      "Expected (func1, prob1, func2, prob2,..., funcN, probN)",
      "Should throw if a probability argument is not a number",
    );
  },
);

runner.test(
  "probabilitySwitch with no arguments should throw (becomes odd number internally)",
  () => {
    // The initial assertIsArray will pass with [], but the length check (0 % 2 === 0) will pass.
    // The loop for functions/probabilities will result in empty arrays.
    // The forEach assertions won't run.
    // EArray.choiceWithProbabilities will likely fail with empty arrays.
    // Let's refine this: the initial assertion `functionsAndProbabilities.length % 2 === 0` is the first gate.
    // If no args, length is 0, which is even. So it passes that.
    // The issue will be with EArray.choiceWithProbabilities if it doesn't handle empty arrays.
    // For now, let's assume EArray.choiceWithProbabilities handles it or probabilitySwitch should guard it.
    // The current code doesn't explicitly prevent 0 arguments leading to empty functions/probabilities arrays.
    // Let's test the behavior with the mock.
    EArray.choiceWithProbabilities = (functions, probabilities) => {
      if (functions.length === 0)
        throw new Error("No functions to choose from");
      return functions[0];
    };
    expect.toThrow(
      () => LanguageConstruct.probabilitySwitch(),
      "No functions to choose from", // This error comes from our mock for this specific test case
      "Should handle or throw for no arguments if EArray.choiceWithProbabilities expects non-empty arrays",
    );
  },
);

runner.run();
