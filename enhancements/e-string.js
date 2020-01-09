'use strict'
var EString = {}

EString.capitalize = string => {
  return this.charAt(0).toUpperCase() + string.slice(1)
}

EString.replaceAll = (string, search, replacement) => 
  string.split(search).join(replacement)

EString.createHash = (string) => {
  var hash = 0, stringSize = string.length, counter = 0
  if ( stringSize <= 0 ) return '0'
  while (counter < stringSize)
    hash = (hash << 5) - hash + string.charCodeAt(counter++) | 0
  return hash.toString()
}

export {EString as default}
export {EString}