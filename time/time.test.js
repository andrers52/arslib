import { TestRunner, expect } from "../test/test-runner.js";
import { Time } from "./time.js";

const runner = new TestRunner();

runner.test("Time constants are correct", () => {
  expect.toBe(Time.TIME_1_SEC, 1000, "1 second should equal 1000 milliseconds");
  expect.toBe(
    Time.TIME_1_MIN,
    60000,
    "1 minute should equal 60000 milliseconds",
  );
  expect.toBe(
    Time.TIME_1_H,
    3600000,
    "1 hour should equal 3600000 milliseconds",
  );
  expect.toBe(
    Time.TIME_1_DAY,
    86400000,
    "1 day should equal 86400000 milliseconds",
  );
});

runner.test("Time.frequencyToDelay calculates correctly", () => {
  expect.toBe(
    Time.frequencyToDelay(10, 1000),
    100,
    "10 times per second should have 100ms delay",
  );
  expect.toBe(
    Time.frequencyToDelay(2, 1000),
    500,
    "2 times per second should have 500ms delay",
  );
  expect.toBe(
    Time.frequencyToDelay(1, 1000),
    1000,
    "1 time per second should have 1000ms delay",
  );
  expect.toBe(
    Time.frequencyToDelay(4, 2000),
    500,
    "4 times in 2 seconds should have 500ms delay",
  );
});

runner.test("Time.currentTime returns valid timestamp", () => {
  const time1 = Time.currentTime();
  const time2 = Time.currentTime();

  expect.toBeType(time1, "number", "currentTime should return a number");
  expect.toBeType(time2, "number", "currentTime should return a number");
  expect.toBeTruthy(
    time2 >= time1,
    "Time should move forward or stay the same",
  );
  expect.toBeTruthy(
    time1 > 1000000000000,
    "Should be a reasonable timestamp (after year 2001)",
  );
});

runner.test("Time.getCurrentUnixTimeStamp returns valid Unix timestamp", () => {
  const timestamp1 = Time.getCurrentUnixTimeStamp();
  const timestamp2 = Time.getCurrentUnixTimeStamp();

  expect.toBeType(timestamp1, "number", "Unix timestamp should be a number");
  expect.toBeType(timestamp2, "number", "Unix timestamp should be a number");
  expect.toBeTruthy(
    Number.isInteger(timestamp1),
    "Unix timestamp should be an integer",
  );
  expect.toBeTruthy(
    timestamp2 >= timestamp1,
    "Unix timestamp should move forward or stay the same",
  );
  expect.toBeTruthy(
    timestamp1 > 1000000000,
    "Should be a reasonable Unix timestamp (after year 2001)",
  );

  const currentTime = Time.currentTime();
  const expectedUnixTime = Math.floor(currentTime / 1000);
  expect.toBeTruthy(
    Math.abs(timestamp1 - expectedUnixTime) <= 1,
    "Unix timestamp should be current time divided by 1000",
  );
});

runner.test("Time.dateAs_yyyy_mm_dd_hh_mm_ss formats correctly", () => {
  const testDate = new Date(2023, 11, 25, 14, 30, 45); // December 25, 2023, 14:30:45
  const formatted = Time.dateAs_yyyy_mm_dd_hh_mm_ss(testDate);
  expect.toBe(
    formatted,
    "2023-12-25 14:30:45",
    "Should format December 25, 2023 correctly",
  );

  const testDate2 = new Date(2023, 0, 5, 9, 7, 3); // January 5, 2023, 09:07:03
  const formatted2 = Time.dateAs_yyyy_mm_dd_hh_mm_ss(testDate2);
  expect.toBe(
    formatted2,
    "2023-01-05 09:07:03",
    "Should zero-pad single digit values",
  );

  const currentFormatted = Time.dateAs_yyyy_mm_dd_hh_mm_ss();
  expect.toBeType(
    currentFormatted,
    "string",
    "Should return string when called without arguments",
  );
  expect.toBeTruthy(
    currentFormatted.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/),
    "Should match yyyy-mm-dd hh:mm:ss format",
  );
});

runner.test("Time.dateAs_yyyy_mm_dd_hh_mm_ss with edge cases", () => {
  const newYearEve = new Date(2023, 11, 31, 23, 59, 59);
  const formatted = Time.dateAs_yyyy_mm_dd_hh_mm_ss(newYearEve);
  expect.toBe(
    formatted,
    "2023-12-31 23:59:59",
    "Should format New Year's Eve correctly",
  );

  const newYearDay = new Date(2024, 0, 1, 0, 0, 0);
  const formatted2 = Time.dateAs_yyyy_mm_dd_hh_mm_ss(newYearDay);
  expect.toBe(
    formatted2,
    "2024-01-01 00:00:00",
    "Should format New Year's Day correctly",
  );
});

// Run all tests
runner.run();
