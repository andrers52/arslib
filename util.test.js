import { TestRunner, expect } from "./test/test-runner.js";
import { Util } from "./util.js";

const runner = new TestRunner();

runner.test("Util.floatSanitize fixes floating point precision", () => {
  const problematic = 0.1 + 0.2; // equals 0.30000000000000004
  const sanitized = Util.floatSanitize(problematic);
  expect.toBe(
    sanitized,
    0.3,
    "Should fix typical floating point precision issue (0.1 + 0.2)",
  );

  expect.toBe(
    Util.floatSanitize(1.5),
    1.5,
    "Normal numbers should remain unchanged",
  );
  expect.toBe(Util.floatSanitize(10), 10, "Integers should remain unchanged");
  expect.toBe(Util.floatSanitize(0), 0, "Zero should remain unchanged");
});

runner.test("Util.roundToSignificantDigits works correctly", () => {
  expect.toBe(
    Util.roundToSignificantDigits(123.456, 3),
    123,
    "Should round 123.456 to 3 significant digits",
  );
  expect.toBe(
    Util.roundToSignificantDigits(123.456, 4),
    123.5,
    "Should round 123.456 to 4 significant digits",
  );
  expect.toBe(
    Util.roundToSignificantDigits(0.001234, 2),
    0.0012,
    "Should handle small decimal numbers correctly",
  );
  expect.toBe(
    Util.roundToSignificantDigits(1000, 2),
    1000,
    "Should handle large numbers correctly",
  );
});

runner.test("Util.truncateToSignificantDigits works correctly", () => {
  expect.toBe(
    Util.truncateToSignificantDigits(123.456, 3),
    123,
    "Should truncate 123.456 to 3 significant digits",
  );
  expect.toBe(
    Util.truncateToSignificantDigits(0.001234, 2),
    0.0012,
    "Should handle small decimal numbers correctly",
  );
  expect.toBe(
    Util.truncateToSignificantDigits(1000, 2),
    1000,
    "Should handle large numbers correctly",
  );
});

runner.test(
  "Util.changeObjectPropertiesToNumber converts string numbers",
  () => {
    const obj = {
      a: "123",
      b: "45.67",
      c: "not a number",
      d: {
        e: "89",
        f: "invalid",
      },
    };

    Util.changeObjectPropertiesToNumber(obj);

    expect.toBe(obj.a, 123, "String '123' should be converted to number 123");
    expect.toBe(
      obj.b,
      45.67,
      "String '45.67' should be converted to number 45.67",
    );
    expect.toBe(
      obj.c,
      "not a number",
      "Non-numeric strings should remain unchanged",
    );
    expect.toBe(
      obj.d.e,
      89,
      "Nested string '89' should be converted to number 89",
    );
    expect.toBe(
      obj.d.f,
      "invalid",
      "Nested non-numeric strings should remain unchanged",
    );
  },
);

runner.test("Util.isObj correctly identifies objects", () => {
  expect.toBeTruthy(
    Util.isObj({}),
    "Empty object should be identified as object",
  );
  expect.toBeTruthy(Util.isObj([]), "Array should be identified as object");
  expect.toBeTruthy(Util.isObj(null), "null should be identified as object");
  expect.toBeFalsy(
    Util.isObj("string"),
    "String should not be identified as object",
  );
  expect.toBeFalsy(
    Util.isObj(123),
    "Number should not be identified as object",
  );
  expect.toBeFalsy(
    Util.isObj(true),
    "Boolean should not be identified as object",
  );
  expect.toBeFalsy(
    Util.isObj(undefined),
    "undefined should not be identified as object",
  );
});

runner.test("Util.limitValueToMinMax clamps values correctly", () => {
  expect.toBe(Util.limitValueToMinMax(5, 0, 10), 5);
  expect.toBe(Util.limitValueToMinMax(-5, 0, 10), 0);
  expect.toBe(Util.limitValueToMinMax(15, 0, 10), 10);
  expect.toBe(Util.limitValueToMinMax(0, 0, 10), 0);
  expect.toBe(Util.limitValueToMinMax(10, 0, 10), 10);
});

runner.test("Util.linearCoerceValueToMinMax wraps values correctly", () => {
  expect.toBe(
    Util.linearCoerceValueToMinMax(5, 0, 10),
    5,
    "Values already in range should remain unchanged",
  );
  expect.toBe(
    Util.linearCoerceValueToMinMax(0, 0, 10),
    0,
    "Minimum value should remain unchanged",
  );
  expect.toBe(
    Util.linearCoerceValueToMinMax(10, 0, 10),
    10,
    "Maximum value should remain unchanged",
  );

  const result1 = Util.linearCoerceValueToMinMax(15, 0, 10);
  expect.toBeTruthy(
    result1 >= 0 && result1 <= 10,
    "Values outside range should be wrapped to within range",
  );

  const result2 = Util.linearCoerceValueToMinMax(-5, 0, 10);
  expect.toBeTruthy(
    result2 >= 0 && result2 <= 10,
    "Negative values should be wrapped to within range",
  );
});

runner.test("Util.nonLinearCoerceValueToMinMax uses cosine mapping", () => {
  expect.toBe(
    Util.nonLinearCoerceValueToMinMax(5, 0, 10),
    5,
    "Values already in range should remain unchanged",
  );

  const result1 = Util.nonLinearCoerceValueToMinMax(15, 0, 10);
  expect.toBeTruthy(
    result1 >= 0 && result1 <= 10,
    "Values outside range should be mapped using cosine function",
  );

  const result2 = Util.nonLinearCoerceValueToMinMax(-5, 0, 10);
  expect.toBeTruthy(
    result2 >= 0 && result2 <= 10,
    "Negative values should be mapped using cosine function",
  );
});

runner.test("Util.rad2Deg converts radians to degrees", () => {
  expect.toBe(Util.rad2Deg(0), 0);
  expect.toBe(Util.rad2Deg(Math.PI), 180);
  expect.toBe(Util.rad2Deg(Math.PI / 2), 90);
  expect.toBe(Util.rad2Deg(2 * Math.PI), 360);
});

runner.test("Util.deg2Rad converts degrees to radians", () => {
  expect.toBe(Util.deg2Rad(0), 0);
  expect.toBe(Util.deg2Rad(180), Math.PI);
  expect.toBe(Util.deg2Rad(90), Math.PI / 2);
  expect.toBe(Util.deg2Rad(360), 2 * Math.PI);
});

runner.test("Util.convert performs base conversion correctly", () => {
  const result = Util.convert({ value: 50, fromBase: 100, toBase: 200 });
  expect.toBe(result, 100); // 50 out of 100 = 100 out of 200

  const result2 = Util.convert({ value: 25, fromBase: 100, toBase: 10 });
  expect.toBe(result2, 2.5); // 25 out of 100 = 2.5 out of 10
});

runner.test(
  "Util.linearConversionWithMaxAndMin converts values correctly",
  () => {
    const result = Util.linearConversionWithMaxAndMin({
      valueToConvert: 50,
      fromBaseMin: 0,
      fromBaseMax: 100,
      toBaseMin: 0,
      toBaseMax: 10,
    });
    expect.toBe(result, 5); // 50% of range from 0-100 = 5 in range 0-10
  },
);

runner.test("Util.removeTagsFromString strips HTML tags", () => {
  expect.toBe(Util.removeTagsFromString("<p>Hello</p>"), "Hello");
  expect.toBe(
    Util.removeTagsFromString("<div><span>Test</span></div>"),
    "Test",
  );
  expect.toBe(Util.removeTagsFromString("No tags here"), "No tags here");
  expect.toBe(Util.removeTagsFromString(""), "");
});

// Run all tests
runner.run();
