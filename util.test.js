import { strict as assert } from "assert";
import { Util } from "./util.js";

describe("Util", function() {
  describe("floatSanitize", function() {
    it("should fix floating point precision", function() {
      const problematic = 0.1 + 0.2; // equals 0.30000000000000004
      const sanitized = Util.floatSanitize(problematic);
      assert.strictEqual(
        sanitized,
        0.3,
        "Should fix typical floating point precision issue (0.1 + 0.2)"
      );

      assert.strictEqual(
        Util.floatSanitize(1.5),
        1.5,
        "Normal numbers should remain unchanged"
      );
      assert.strictEqual(Util.floatSanitize(10), 10, "Integers should remain unchanged");
      assert.strictEqual(Util.floatSanitize(0), 0, "Zero should remain unchanged");
    });
  });

  describe("roundToSignificantDigits", function() {
    it("should work correctly", function() {
      assert.strictEqual(
        Util.roundToSignificantDigits(123.456, 3),
        123,
        "Should round 123.456 to 3 significant digits"
      );
      assert.strictEqual(
        Util.roundToSignificantDigits(123.456, 4),
        123.5,
        "Should round 123.456 to 4 significant digits"
      );
      assert.strictEqual(
        Util.roundToSignificantDigits(0.001234, 2),
        0.0012,
        "Should handle small decimal numbers correctly"
      );
      assert.strictEqual(
        Util.roundToSignificantDigits(1000, 2),
        1000,
        "Should handle large numbers correctly"
      );
    });
  });

  describe("truncateToSignificantDigits", function() {
    it("should work correctly", function() {
      assert.strictEqual(
        Util.truncateToSignificantDigits(123.456, 3),
        123,
        "Should truncate 123.456 to 3 significant digits"
      );
      assert.strictEqual(
        Util.truncateToSignificantDigits(0.001234, 2),
        0.0012,
        "Should handle small decimal numbers correctly"
      );
      assert.strictEqual(
        Util.truncateToSignificantDigits(1000, 2),
        1000,
        "Should handle large numbers correctly"
      );
    });
  });

  describe("changeObjectPropertiesToNumber", function() {
    it("should convert string numbers", function() {
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

      assert.strictEqual(obj.a, 123, "String '123' should be converted to number 123");
      assert.strictEqual(
        obj.b,
        45.67,
        "String '45.67' should be converted to number 45.67"
      );
      assert.strictEqual(
        obj.c,
        "not a number",
        "Non-numeric strings should remain unchanged"
      );
      assert.strictEqual(
        obj.d.e,
        89,
        "Nested string '89' should be converted to number 89"
      );
      assert.strictEqual(
        obj.d.f,
        "invalid",
        "Nested non-numeric strings should remain unchanged"
      );
    });
  });

  describe("isObj", function() {
    it("should correctly identify objects", function() {
      assert.ok(Util.isObj({}), "Empty object should be identified as object");
      assert.ok(Util.isObj([]), "Array should be identified as object");
      assert.ok(Util.isObj(null), "null should be identified as object");
      assert.ok(!Util.isObj("string"), "String should not be identified as object");
      assert.ok(!Util.isObj(123), "Number should not be identified as object");
      assert.ok(!Util.isObj(true), "Boolean should not be identified as object");
      assert.ok(!Util.isObj(undefined), "undefined should not be identified as object");
    });
  });

  describe("limitValueToMinMax", function() {
    it("should clamp values correctly", function() {
      assert.strictEqual(Util.limitValueToMinMax(5, 0, 10), 5);
      assert.strictEqual(Util.limitValueToMinMax(-5, 0, 10), 0);
      assert.strictEqual(Util.limitValueToMinMax(15, 0, 10), 10);
      assert.strictEqual(Util.limitValueToMinMax(0, 0, 10), 0);
      assert.strictEqual(Util.limitValueToMinMax(10, 0, 10), 10);
    });
  });

  describe("linearCoerceValueToMinMax", function() {
    it("should wrap values correctly", function() {
      assert.strictEqual(
        Util.linearCoerceValueToMinMax(5, 0, 10),
        5,
        "Values already in range should remain unchanged"
      );
      assert.strictEqual(
        Util.linearCoerceValueToMinMax(0, 0, 10),
        0,
        "Minimum value should remain unchanged"
      );
      assert.strictEqual(
        Util.linearCoerceValueToMinMax(10, 0, 10),
        10,
        "Maximum value should remain unchanged"
      );

      const result1 = Util.linearCoerceValueToMinMax(15, 0, 10);
      assert.ok(
        result1 >= 0 && result1 <= 10,
        "Values outside range should be wrapped to within range"
      );

      const result2 = Util.linearCoerceValueToMinMax(-5, 0, 10);
      assert.ok(
        result2 >= 0 && result2 <= 10,
        "Negative values should be wrapped to within range"
      );
    });
  });

  describe("nonLinearCoerceValueToMinMax", function() {
    it("should use cosine mapping", function() {
      assert.strictEqual(
        Util.nonLinearCoerceValueToMinMax(5, 0, 10),
        5,
        "Values already in range should remain unchanged"
      );

      const result1 = Util.nonLinearCoerceValueToMinMax(15, 0, 10);
      assert.ok(
        result1 >= 0 && result1 <= 10,
        "Values outside range should be mapped using cosine function"
      );

      const result2 = Util.nonLinearCoerceValueToMinMax(-5, 0, 10);
      assert.ok(
        result2 >= 0 && result2 <= 10,
        "Negative values should be mapped using cosine function"
      );
    });
  });

  describe("rad2Deg", function() {
    it("should convert radians to degrees", function() {
      assert.strictEqual(Util.rad2Deg(0), 0);
      assert.strictEqual(Util.rad2Deg(Math.PI), 180);
      assert.strictEqual(Util.rad2Deg(Math.PI / 2), 90);
      assert.strictEqual(Util.rad2Deg(2 * Math.PI), 360);
    });
  });

  describe("deg2Rad", function() {
    it("should convert degrees to radians", function() {
      assert.strictEqual(Util.deg2Rad(0), 0);
      assert.strictEqual(Util.deg2Rad(180), Math.PI);
      assert.strictEqual(Util.deg2Rad(90), Math.PI / 2);
      assert.strictEqual(Util.deg2Rad(360), 2 * Math.PI);
    });
  });
});
