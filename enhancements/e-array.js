'use strict'

import Assert from '../util/assert.js'
import Random from '../util/random.js'

var EArray ={}

// ------------------------------------------------------ //
// Define the static methods in EArray
// ------------------------------------------------------ //

EArray.sum = array => array.reduce((total, num) => total + num, 0)
EArray.mean = array => array.reduce((total, num) => total + num, 0) / array.length
// mean difference, taken two by two (-1 if not applicable)
EArray.meanDifferenceTwoByTwo = array => {
  if(array.length === 0 || array.length === 1) 
    throw('cannot calculate meanDifferenceTwoByTwo')
  let diffSum = 0
  for(let i = 1; i<array.length; i++) {
    diffSum += array[i] - array[i-1]
  }
  return diffSum / (array.length - 1)
}


EArray.lastIndex = array => {
  return array.length - 1
}

EArray.last = array => {
  return (array.length >= 1) ? array[EArray.lastIndex(array)] : 'undefined'
}

EArray.first = array => (array.length >= 1) ? array[0] : 'undefined'

EArray.isLast = (array, item) => item === this.last()

EArray.isFirst = (array, item) => item === this.first()

// *** TODO: TEST Z32 AND REMOVE ***
// EArray.empty = array => {
//   array.splice(0, array.length)
//   return array
// }

// from array of arrays to single array
// Note: preserveOriginalArray === true is slower
EArray.flatten = (array, preserveOriginalArray = true) => {
  let arrayToUse = preserveOriginalArray?
    [...array] : array
  return arrayToUse.concat.apply([], arrayToUse)
}

// from 'flat' array to array of arrays of length 'size'
// Note: preserveOriginalArray === true is slower
EArray.unflatten = (flattenedArray, size, preserveOriginalArray = true) => {
  let arrayToUse = preserveOriginalArray?
    JSON.parse(JSON.stringify(flattenedArray)) : flattenedArray
  let resultArray = []
  while (arrayToUse.length > 0) resultArray.push(arrayToUse.splice(0, size))  
  return resultArray
}


EArray.removeLast = array => {
  array.splice(-1,1)
  return array
}

EArray.clone = (array, cloneFunction) => {
  if (!cloneFunction)
    return array.map(e => 
      (Array.isArray(e) || e.clone)? 
        e.clone() :
        typeof e === 'object'?
          Object.assign({},e) :
          e
    )
  return array.map(function(item) {
    return cloneFunction(item)
  })
}

//get random element from array (with different chances for each one)
EArray.choiceWithProbabilities = (array, probabilities) => {
  Assert.assertIsArray(probabilities)
  Assert.assert(probabilities.length === array.length, 'Probabilities size must be equal to array size')
  //each one select a number based on its probability and the
  //one with the bigger number wins.
  let generatedValues = probabilities.map(prob => Math.random() * prob)
  let selectedIndex = EArray.indexOfGreaterValue(generatedValues)
  return array[selectedIndex]
}

//get random element from array
EArray.choice = array => array[Random.randomInt(array.length)]


//get random index from array
EArray.indexChoice = array => Random.randomInt(array.length)

EArray.indexOfGreaterValue = array => {
  let greater = array[0]
  let resultIndex = 0
  for(let i=1; i<array.length; i++)
    if(array[i] > greater) {
      greater = array[i]
      resultIndex = i
    }

  return resultIndex
}


// EArray comprehension
// range() is a generator that returns all the values between begin and
// end. We can use it like this:
// let ten_squares = [i * i for each (i in range(0, 10))];
// let evens = [i for each (i in range(0, 21)) if (i % 2 === 0)];
/*
 * function *range(begin, end) { for (let i = begin; i < end; ++i) { yield i; } }
 */
export {EArray as default}
export {EArray}