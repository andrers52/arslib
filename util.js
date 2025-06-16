"use strict";

var Util = {};

/**
 * Sanitizes JavaScript floating point precision issues by rounding to 5 significant digits
 * @param {number} number - Number to sanitize
 * @returns {number} Number with corrected precision
 * @example
 * // to "sanitize" some incredible JavaScript float point results, like
 * // 99.9 - 100 = -0.09999999999999432
 */
// to "sanitize" some incredible JavaScript float point results, like
// 99.9 - 100 = -0.09999999999999432
Util.floatSanitize = (number) => Number(number.toPrecision(5));

/**
 * Rounds a number to a specified number of significant digits
 * @param {number} number - Number to round
 * @param {number} significantDigits - Number of significant digits to keep
 * @returns {number} Rounded number
 */
Util.roundToSignificantDigits = (number, significantDigits) =>
  Number(number.toPrecision(significantDigits));

/**
 * Truncates a number to a specified number of significant digits
 * @param {number} number - Number to truncate
 * @param {number} significantDigits - Number of significant digits to keep
 * @returns {number} Truncated number
 */
Util.truncateToSignificantDigits = (number, significantDigits) => {
  if (Math.trunc(number) > 0)
    return Util.roundToSignificantDigits(number, significantDigits);

  let numberStr = number.toString();
  let stringIndex = 0;
  while (true) {
    let charAtIndex = numberStr.charAt(stringIndex);
    if (charAtIndex !== "0" && charAtIndex !== ".") break;
    stringIndex++;
  }

  let finalIndex = stringIndex + significantDigits;
  if (finalIndex + 1 > numberStr.length) finalIndex = numberStr.length - 1;

  return Number(numberStr.slice(0, finalIndex));
};

/**
 * Recursively converts object properties to numbers where possible
 * @param {Object} Obj - Object to process
 * @returns {Object} Object with numeric properties converted to numbers
 */
Util.changeObjectPropertiesToNumber = function (Obj) {
  for (let prop in Obj) {
    if (!Obj.hasOwnProperty(prop)) continue;
    if (Util.isObj(Obj[prop])) {
      Util.changeObjectPropertiesToNumber(Obj[prop]);
      continue;
    }
    let propNumber = Number(Obj[prop]);
    let propIsNotNumber = isNaN(propNumber);
    Obj[prop] = propIsNotNumber ? Obj[prop] : propNumber;
  }
  return Obj;
};

/**
 * Checks if a value is an object
 * @param {any} v - Value to check
 * @returns {boolean} True if value is an object
 */
Util.isObj = function (v) {
  return typeof v === "object";
};

/**
 * Limits a value to be within min and max bounds
 * @param {number} value - Value to limit
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} Value clamped between min and max
 */
Util.limitValueToMinMax = function (value, min, max) {
  if (value > max) return max;
  if (value < min) return min;
  return value;
};

/**
 * Coerces a value to be within min-max range using modulo operation
 * @param {number} value - Value to coerce
 * @param {number} min - Minimum value of range
 * @param {number} max - Maximum value of range
 * @returns {number} Value coerced to be within range using linear wrapping
 */
// change number to value inside [max,min] using %
Util.linearCoerceValueToMinMax = function (value, min, max) {
  if (value >= min && value <= max) return value;

  let amplitude = max - min;
  let valueAdjustedToAmplitude = Math.abs(value) % amplitude;
  let coercedValue = valueAdjustedToAmplitude + min;

  return coercedValue;
};

/**
 * Coerces a value to be within min-max range using cosine function
 * @param {number} value - Value to coerce
 * @param {number} min - Minimum value of range
 * @param {number} max - Maximum value of range
 * @returns {number} Value coerced to be within range using non-linear (cosine) mapping
 */
// change number to value inside [max,min] using cos
Util.nonLinearCoerceValueToMinMax = function (value, min, max) {
  if (value >= min && value <= max) return value;
  let coercedToValueBetween0And1 = Math.abs(Math.cos(value));
  let amplitude = max - min;
  let valueAdjustedToAmplitude = coercedToValueBetween0And1 * amplitude;
  let coercedValueAdjustedToMinMax = valueAdjustedToAmplitude + min;

  return coercedValueAdjustedToMinMax;
};

/**
 * Converts radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
Util.rad2Deg = (radians) => {
  return (radians * 180) / Math.PI;
};

/**
 * Converts degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
Util.deg2Rad = (degrees) => {
  return (degrees * Math.PI) / 180;
};

/**
 * Converts a value from one base to another proportionally
 * @param {Object} params - Conversion parameters
 * @param {number} params.value - Value to convert
 * @param {number} params.fromBase - Original base value
 * @param {number} params.toBase - Target base value
 * @returns {number} Converted value
 */
Util.convert = ({ value, fromBase, toBase }) => {
  return (value * toBase) / (fromBase || 1);
};

/**
 * Performs linear conversion between two ranges with min/max bounds
 * @param {Object} params - Conversion parameters
 * @param {number} params.fromBaseMin - Minimum value of source range
 * @param {number} params.fromBaseMax - Maximum value of source range
 * @param {number} params.toBaseMin - Minimum value of target range
 * @param {number} params.toBaseMax - Maximum value of target range
 * @param {number} params.valueToConvert - Value to convert from source to target range
 * @returns {number} Converted value in target range
 */
Util.linearConversionWithMaxAndMin = ({
  fromBaseMin,
  fromBaseMax,
  toBaseMin,
  toBaseMax,
  valueToConvert,
}) => {
  let minMaxFromToFactor =
    (toBaseMax - toBaseMin) / (fromBaseMax - fromBaseMin);
  let result = toBaseMin + (valueToConvert - fromBaseMin) * minMaxFromToFactor;
  return result;
};

/**
 * Removes HTML tags from a string, leaving only text content
 * @param {string} html - HTML string to process
 * @returns {string} Plain text with HTML tags removed
 */
Util.removeTagsFromString = (html) => {
  // Check if we're in a browser environment
  if (typeof document !== "undefined") {
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    let resultText = tmp.textContent || tmp.innerText || "";
    tmp.remove();
    return resultText;
  } else {
    // Fallback for Node.js environment - use regex to strip tags
    return html.replace(/<[^>]*>/g, "");
  }
};

export { Util };
