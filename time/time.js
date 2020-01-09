'use strict'

var Time = {}

// defs
Time.TIME_1_SEC = 1000
Time.TIME_1_MIN = 60 * Time.TIME_1_SEC
Time.TIME_1_H   = 60 * Time.TIME_1_MIN
Time.TIME_1_DAY  = 24 * Time.TIME_1_H

// convert number of occurrences in time to delay between occurrences
Time.frequencyToDelay = (numberOfOccurrences, time) => {
  return time / numberOfOccurrences
}

Time.currentTime = () => new Date().getTime()

// timestamp in seconds
Time.getCurrentUnixTimeStamp = () => {
  return Math.floor(Date.now() / 1000)
}

Time.dateAs_yyyy_mm_dd_hh_mm_ss = (date = new Date()) => {
  let year = '' + date.getFullYear()
  let month = '' + (date.getMonth() + 1); if (month.length == 1) { month = '0' + month }
  let day = '' + date.getDate(); if (day.length == 1) { day = '0' + day }
  let hour = '' + date.getHours(); if (hour.length == 1) { hour = '0' + hour }
  let minute = '' + date.getMinutes(); if (minute.length == 1) { minute = '0' + minute }
  let second = '' + date.getSeconds(); if (second.length == 1) { second = '0' + second }
  return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
}

export {Time as default}
export {Time}