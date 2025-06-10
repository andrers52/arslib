"use strict";

var Time = {};

// defs
Time.TIME_1_SEC = 1000;
Time.TIME_1_MIN = 60 * Time.TIME_1_SEC;
Time.TIME_1_H = 60 * Time.TIME_1_MIN;
Time.TIME_1_DAY = 24 * Time.TIME_1_H;

/**
 * Converts number of occurrences in time to delay between occurrences
 * @param {number} numberOfOccurrences - Number of times something should occur
 * @param {number} time - Total time period in milliseconds
 * @returns {number} Delay between occurrences in milliseconds
 */
// convert number of occurrences in time to delay between occurrences
Time.frequencyToDelay = (numberOfOccurrences, time) => {
  return time / numberOfOccurrences;
};

/**
 * Gets the current time in milliseconds since epoch
 * @returns {number} Current timestamp in milliseconds
 */
Time.currentTime = () => new Date().getTime();

/**
 * Gets the current Unix timestamp in seconds
 * @returns {number} Current timestamp in seconds since Unix epoch
 */
// timestamp in seconds
Time.getCurrentUnixTimeStamp = () => {
  return Math.floor(Date.now() / 1000);
};

/**
 * Formats a date as YYYY-MM-DD HH:MM:SS string
 * @param {Date} date - The date to format (defaults to current date)
 * @returns {string} Formatted date string in YYYY-MM-DD HH:MM:SS format
 */
Time.dateAs_yyyy_mm_dd_hh_mm_ss = (date = new Date()) => {
  let year = "" + date.getFullYear();
  let month = "" + (date.getMonth() + 1);
  if (month.length == 1) {
    month = "0" + month;
  }
  let day = "" + date.getDate();
  if (day.length == 1) {
    day = "0" + day;
  }
  let hour = "" + date.getHours();
  if (hour.length == 1) {
    hour = "0" + hour;
  }
  let minute = "" + date.getMinutes();
  if (minute.length == 1) {
    minute = "0" + minute;
  }
  let second = "" + date.getSeconds();
  if (second.length == 1) {
    second = "0" + second;
  }
  return (
    year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second
  );
};

export { Time };
