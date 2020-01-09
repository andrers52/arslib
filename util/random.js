'use strict'

import Assert from './assert.js'


var Random = {}


//[0, range-1]
Random.randomInt = function(range) {
  return Math.floor(Math.random() * range)
}

// Returns a random integer between value1 (included) and value2 (included)
Random.randomFromIntervalInclusive = function(value1, value2) {
  Assert.assert(
    Number.isInteger(value1) && Number.isInteger(value2), 
    'Random.randomFromIntervalInclusive error: expecting two integer values')
  let max, min, delta
  min = Math.min(value1, value2)
  max = Math.max(value1, value2)
  delta = max - min
  return Math.floor((Math.random() * (delta + 1)) + min)
}

// Returns a random integer/float between value1 (included) and value2 (excluded)
Random.randomFromInterval = function(value1, value2) {
  let max, min, delta
  min = Math.min(value1, value2)
  max = Math.max(value1, value2)
  delta = max - min
  let result = (Math.random() * delta) + min
  return (Number.isInteger(value1) && Number.isInteger(value2))?
    Math.round(result) :
    result 
}

Random.occurrenceProbability = function(occurrenceProbability) {
  if(occurrenceProbability <= 0) {
    return false
  }
  if(occurrenceProbability >= 1) {
    return true
  }
  
  let scale = 1/occurrenceProbability
  return Random.randomFromInterval(1, scale) === 1
}

export {Random as default}
export {Random}