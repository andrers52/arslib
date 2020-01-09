'use strict'

var Util = {}

// to "sanitize" some incredible JavaScript float point results, like
// 99.9 - 100 = -0.09999999999999432
Util.floatSanitize = (number) =>
  Number( number.toPrecision(5) )

Util.roundToSignificantDigits = (number, significantDigits) =>
  Number( number.toPrecision(significantDigits) )

Util.truncateToSignificantDigits = (number, significantDigits) => {
  if( Math.trunc(number) > 0) return Util.roundToSignificantDigits(number, significantDigits)

  let numberStr = number.toString()
  let stringIndex = 0
  while(true) {
    let charAtIndex = numberStr.charAt(stringIndex)
    if( charAtIndex !== '0' && charAtIndex !== '.') break
    stringIndex++
  }

  let finalIndex = stringIndex + significantDigits
  if(finalIndex + 1 > numberStr.length) finalIndex = numberStr.length - 1

  return Number(numberStr.slice(0,finalIndex))
}


Util.changeObjectPropertiesToNumber = function (Obj) {
  for (let prop in Obj) {
    if (!Obj.hasOwnProperty(prop)) continue
    if (Util.isObj(Obj[prop])) {
      Util.changeObjectPropertiesToNumber(Obj[prop])
      continue
    }
    let propNumber = Number(Obj[prop])
    let propIsNotNumber = isNaN(propNumber)
    Obj[prop] = propIsNotNumber ? Obj[prop] : propNumber
  }
  return Obj
}

Util.isObj = function (v) {
  return typeof (v) === 'object'
}

Util.limitValueToMinMax = function (value, min, max) {
  if(value>max) return max
  if(value<min) return min
  return value
}

// change number to value inside [max,min] using %
Util.linearCoerceValueToMinMax = function (value, min, max) {
  if (value >= min && value <= max) return value
    
  let amplitude = max - min
  let valueAdjustedToAmplitude = Math.abs(value) % amplitude
  let coercedValue = valueAdjustedToAmplitude + min
 
  return coercedValue
}

// change number to value inside [max,min] using cos
Util.nonLinearCoerceValueToMinMax = function (value, min, max) {
  if (value >= min && value <= max) return value
  let coercedToValueBetween0And1 = Math.abs(Math.cos(value))
  let amplitude = max - min
  let valueAdjustedToAmplitude = coercedToValueBetween0And1 * amplitude
  let coercedValueAdjustedToMinMax = valueAdjustedToAmplitude + min
 
  return coercedValueAdjustedToMinMax
}



Util.rad2Deg = (radians) => {
  return radians * 180 / Math.PI
}

Util.deg2Rad = (degrees) => {
  return degrees * Math.PI / 180
}

Util.convert = ({value, fromBase, toBase}) => {
  return value * toBase / (fromBase || 1)
}

Util.linearConversionWithMaxAndMin = 
  ({fromBaseMin, fromBaseMax, toBaseMin, toBaseMax, valueToConvert}) => {
    let minMaxFromToFactor = 
      (toBaseMax - toBaseMin) / (fromBaseMax - fromBaseMin)
    let result = 
      toBaseMin + ((valueToConvert - fromBaseMin) * minMaxFromToFactor)
    return result
  }


Util.removeTagsFromString = (html) => {
  let tmp = document.createElement('DIV')
  tmp.innerHTML = html
  let resultText = tmp.textContent || tmp.innerText || ''
  tmp.remove()
  return resultText
}

Util.download = (filename, text) => {
  var pom = document.createElement('a')
  pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
  pom.setAttribute('download', filename)

  if (document.createEvent) {
    var event = document.createEvent('MouseEvents')
    event.initEvent('click', true, true)
    pom.dispatchEvent(event)
  }
  else {
    pom.click()
  }
}
export {Util as default}
export {Util}
