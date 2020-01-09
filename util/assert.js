'use strict'

var Assert = {}

// set this to disable asserts globally
Assert.disableAllVerifications = false

Assert.assert = (exp, message = 'Error') => {
  if(Assert.disableAllVerifications) return //go faster!
  if ((exp !== 0) && (!exp || (typeof exp === 'undefined'))) 
    throw message
  return true
}

Assert.assertHasProperties = (object, propertiesArray, message) => {
  propertiesArray.forEach(p => {Assert.hasProperty(object, p, message)})
}

Assert.hasProperty = (object, property, message = 'Property not found') => {
  Assert.assert(object[property], message)
}

Assert.assertIsEqual = (element1, element2, message = 'Elements should be equal') => {
  Assert.assert(element1 === element2, message)
}

Assert.assertIsNotEqual =  (received, expected, message = 'Error: should not be equal') => {
  Assert.assert(received !== expected, message)
}

Assert.assertIsValidString = (stringToTest, arrayOfValidStrings, message = 'Error: invalid string') => {
  Assert.assertIsString(stringToTest, 'Test Error: string to test not found')
  Assert.assertIsArray(arrayOfValidStrings, 'Test Error: array of valid strings not found')
  Assert.assert(arrayOfValidStrings.includes(stringToTest), message)
}

Assert.assertIsFunction = (functionToTest, message = 'Error: expecting a function') => {
  Assert.assert(typeof functionToTest === 'function', message)
}

Assert.assertIsObject = (objectToTest, message = 'Error: expecting an object') => {
  Assert.assert(typeof objectToTest === 'object', message)
}

Assert.assertIsOptionalFunction = (functionToTest, message = 'Error: expecting a(n optional) function') => {
  if (functionToTest) {
    Assert.assert(typeof functionToTest === 'function', message)
  }
}

Assert.assertIsNumber = (number, message = 'Error: expecting a number') => {
  Assert.assert(typeof number === 'number' && !isNaN(parseFloat(number)) && isFinite(number), message)
}

Assert.assertIsString = (string, message = 'Error: expecting a string') => {
  Assert.assert(typeof string === 'string', message)
}


Assert.assertIsArray = (array, message = 'Error: expecting an array') => {
  Assert.assert(Array.isArray(array), message)
}

Assert.assertIsEmptyArray = (array, message = 'Error: array not empty') => {
  Assert.assert(array.length === 0, message)
}

Assert.assertIsNotEmptyArray = (array, message = 'Error: array empty') => {
  Assert.assert(array.length !== 0, message)
}


Assert.assertIsArrayOfNumbers = (array, message = 'Error: expecting an array of numbers') => {
  if(!Assert.disableAllVerifications) return //test added here to avoid loop below
  Assert.assertIsArray(array, message)
  array.forEach(elem => Assert.assertIsNumber(elem, message))
}


Assert.assertIsArrayOfObjects = (array, message = 'Error: expecting an array of objects') => {
  if(!Assert.disableAllVerifications) return //test added here to avoid loop
  Assert.assertIsArray(array, message)
  array.forEach(elem => Assert.assertIsObject(elem, message))
}

Assert.assertIsLiteralString = (string, message = 'Error: expecting a literal string') => {
  Assert.assert(typeof string === 'string', message)
}

Assert.assertValueIsInsideLimits = (valueToTest, minValue, maxValue, message = 'Error: value out of limits') => {
  Assert.assert(
    valueToTest >=  minValue && 
    valueToTest <=  maxValue,
    message)
}

Assert.assertIsTrue = (expression, message = 'Error: should be true') => {
  Assert.assert(typeof expression === 'boolean' && expression, message)
}

Assert.assertIsFalse = (expression, message = 'Error: should be false') => {
  Assert.assert(typeof expression === 'boolean' && !expression, message)
}

Assert.assertIsTruthy = (expression, message = 'Error: should be truthy') => {
  Assert.assert(expression, message) // Equivalent to Assert.assert
}

Assert.assertIsFalsy = (expression, message = 'Error: should be falsy') => {
  Assert.assertIsTruthy(!expression, message)
}


Assert.assertIsEquivalent = (received, expected, message = 'Error: should be the equivalent') => {
  Assert.assert(received == expected, message)
}

Assert.assertIsNotEquivalent = (received, expected, message = 'Error: should not be the equivalent') => {
  Assert.assert(received != expected, message)
}

Assert.assertIsUndefined = (expression, message = 'Should be undefined') => {
  Assert.assert(typeof expression === 'undefined', message)
}

Assert.assertIsNotUndefined = (expression, message = 'Should not be undefined') => {
  Assert.assert(typeof expression !== 'undefined', message)
}

Assert.assertIsnull = (expression, message = 'Should be null') => {
  Assert.assert(expression === null, message)
}

Assert.assertIsNotNull = (expression, message = 'Should not be null') => {
  Assert.assert(expression !== null, message)
}

Assert.disable = () => {
  let properties = Object.getOwnPropertyNames(Assert)
  for (let property of properties)
    if((typeof Assert[property] === 'function') && property.includes('assert'))
      Assert[property] = () => {}
}

export {Assert as default}
export {Assert}
