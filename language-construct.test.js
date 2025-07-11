import { strict as assert } from "assert";
import { EArray } from "./enhancements/e-array.js";
import { LanguageConstruct } from "./language-construct.js";

// Mock EArray.choiceWithProbabilities to control which function is chosen
let mockChosenFunction = null;
const originalChoiceWithProbabilities = EArray.choiceWithProbabilities;

describe("LanguageConstruct.probabilitySwitch", function() {
  beforeEach(function() {
    EArray.choiceWithProbabilities = (functions, probabilities) => {
      if (mockChosenFunction && functions.includes(mockChosenFunction)) {
        return mockChosenFunction;
      }
      return functions[0];
    };
  });

  afterEach(function() {
    EArray.choiceWithProbabilities = originalChoiceWithProbabilities;
    mockChosenFunction = null;
  });

  it("should call the chosen function", function() {
    const func1 = () => "result1";
    const func2 = () => "result2";

    mockChosenFunction = func1;
    let result = LanguageConstruct.probabilitySwitch(func1, 0.5, func2, 0.5);
    assert.strictEqual(result, "result1", "Should return result of func1 when func1 is chosen");

    mockChosenFunction = func2;
    result = LanguageConstruct.probabilitySwitch(func1, 0.5, func2, 0.5);
    assert.strictEqual(result, "result2", "Should return result of func2 when func2 is chosen");
  });

  it("should work with a single function (probability 1)", function() {
    const func1 = () => "single";
    mockChosenFunction = func1;
    const result = LanguageConstruct.probabilitySwitch(func1, 1.0);
    assert.strictEqual(result, "single");
  });

  it("should pass arguments to the chosen function", function() {
    const funcWithArgs = (a, b) => a + b;
    EArray.choiceWithProbabilities = () => (...args) => funcWithArgs(5, 10);
    const result = LanguageConstruct.probabilitySwitch(funcWithArgs, 1.0);
    assert.strictEqual(result, 15, "Chosen function should receive and process arguments");
  });

  it("should throw if an odd number of arguments is provided", function() {
    const func1 = () => {};
    assert.throws(
      () => LanguageConstruct.probabilitySwitch(func1, 0.5, func1),
      /Expecting an even number of parameters/,
      "Should throw for odd number of arguments"
    );
  });

  it("should throw if a non-function is provided as a function argument", function() {
    assert.throws(
      () => LanguageConstruct.probabilitySwitch("not-a-function", 0.5, () => {}, 0.5),
      /Expected \(func1, prob1, func2, prob2,..., funcN, probN\)/,
      "Should throw if a function argument is not a function"
    );
  });

  it("should throw if a non-number is provided as a probability argument", function() {
    const func1 = () => {};
    assert.throws(
      () => LanguageConstruct.probabilitySwitch(func1, "not-a-number", func1, 0.5),
      /Expected \(func1, prob1, func2, prob2,..., funcN, probN\)/,
      "Should throw if a probability argument is not a number"
    );
  });

  it("should throw if no arguments are provided (becomes odd number internally)", function() {
    EArray.choiceWithProbabilities = (functions, probabilities) => {
      if (functions.length === 0)
        throw new Error("No functions to choose from");
      return functions[0];
    };
    assert.throws(
      () => LanguageConstruct.probabilitySwitch(),
      /No functions to choose from/,
      "Should handle or throw for no arguments if EArray.choiceWithProbabilities expects non-empty arrays"
    );
  });
});
