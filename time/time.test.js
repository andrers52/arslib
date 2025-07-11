import { strict as assert } from "assert";
import { Time } from "./time.js";

describe("Time constants are correct", function() {
  it("should work", function() {
    assert.strictEqual(Time.TIME_1_SEC, 1000, "1 second should equal 1000 milliseconds");
    assert.strictEqual(Time.TIME_1_MIN, 60000, "1 minute should equal 60000 milliseconds");
    assert.strictEqual(Time.TIME_1_H, 3600000, "1 hour should equal 3600000 milliseconds");
    assert.strictEqual(Time.TIME_1_DAY, 86400000, "1 day should equal 86400000 milliseconds");
  });
});

describe("Time.frequencyToDelay calculates correctly", function() {
  it("should work", function() {
    assert.strictEqual(Time.frequencyToDelay(10, 1000), 100, "10 times per second should have 100ms delay");
    assert.strictEqual(Time.frequencyToDelay(2, 1000), 500, "2 times per second should have 500ms delay");
    assert.strictEqual(Time.frequencyToDelay(1, 1000), 1000, "1 time per second should have 1000ms delay");
    assert.strictEqual(Time.frequencyToDelay(4, 2000), 500, "4 times in 2 seconds should have 500ms delay");
  });
});

describe("Time.currentTime returns valid timestamp", function() {
  it("should work", function() {
    const time1 = Time.currentTime();
    const time2 = Time.currentTime();
    assert.ok(typeof time1 === "number", "currentTime should return a number");
    assert.ok(typeof time2 === "number", "currentTime should return a number");
    assert.ok(time2 >= time1, "Time should move forward or stay the same");
    assert.ok(time1 > 1000000000000, "Should be a reasonable timestamp (after year 2001)");
  });
});

describe("Time.getCurrentUnixTimeStamp returns valid Unix timestamp", function() {
  it("should work", function() {
    const timestamp1 = Time.getCurrentUnixTimeStamp();
    const timestamp2 = Time.getCurrentUnixTimeStamp();
    assert.ok(typeof timestamp1 === "number", "Unix timestamp should be a number");
    assert.ok(typeof timestamp2 === "number", "Unix timestamp should be a number");
    assert.ok(Number.isInteger(timestamp1), "Unix timestamp should be an integer");
    assert.ok(timestamp2 >= timestamp1, "Unix timestamp should move forward or stay the same");
    assert.ok(timestamp1 > 1000000000, "Should be a reasonable Unix timestamp (after year 2001)");
    const currentTime = Time.currentTime();
    const expectedUnixTime = Math.floor(currentTime / 1000);
    assert.ok(Math.abs(timestamp1 - expectedUnixTime) <= 1, "Unix timestamp should be current time divided by 1000");
  });
});

describe("Time.dateAs_yyyy_mm_dd_hh_mm_ss formats correctly", function() {
  it("should work", function() {
    const testDate = new Date(2023, 11, 25, 14, 30, 45); // December 25, 2023, 14:30:45
    const formatted = Time.dateAs_yyyy_mm_dd_hh_mm_ss(testDate);
    assert.strictEqual(formatted, "2023-12-25 14:30:45", "Should format December 25, 2023 correctly");
    const testDate2 = new Date(2023, 0, 5, 9, 7, 3); // January 5, 2023, 09:07:03
    const formatted2 = Time.dateAs_yyyy_mm_dd_hh_mm_ss(testDate2);
    assert.strictEqual(formatted2, "2023-01-05 09:07:03", "Should zero-pad single digit values");
    const currentFormatted = Time.dateAs_yyyy_mm_dd_hh_mm_ss();
    assert.strictEqual(typeof currentFormatted, "string", "Should return string when called without arguments");
    assert.ok(currentFormatted.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/), "Should match yyyy-mm-dd hh:mm:ss format");
  });
});

describe("Time.dateAs_yyyy_mm_dd_hh_mm_ss with edge cases", function() {
  it("should work", function() {
    const newYearEve = new Date(2023, 11, 31, 23, 59, 59);
    const formatted = Time.dateAs_yyyy_mm_dd_hh_mm_ss(newYearEve);
    assert.strictEqual(formatted, "2023-12-31 23:59:59", "Should format New Year's Eve correctly");
    const newYearDay = new Date(2024, 0, 1, 0, 0, 0);
    const formatted2 = Time.dateAs_yyyy_mm_dd_hh_mm_ss(newYearDay);
    assert.strictEqual(formatted2, "2024-01-01 00:00:00", "Should format New Year's Day correctly");
  });
});