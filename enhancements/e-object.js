'use strict'
var EObject = {}

EObject.isEmpty = obj =>
  Object.keys(obj).length === 0 && obj.constructor === Object


EObject.swapObjectKeysAndValues = obj => {
  var new_obj = {}
  for (var prop in obj) {
    if(obj.hasOwnProperty(prop)) {
      new_obj[obj[prop]] = prop
    }
  }
  return new_obj
}

EObject.hasSameProperties = function(obj1, obj2) {
  if(typeof obj1 !== 'object' || typeof obj2 !== 'object')
    return false
  const obj1Keys = Object.keys(obj1)
  const obj2Values = Object.values(obj2)
  if(obj1Keys.length !== obj2Values.length) return false
  for(let i=0; i<obj1Keys.length; i++) {
    const key = obj1Keys[i]
    if(typeof obj1[key] === 'object') {
      if(!EObject.hasSameProperties(obj1[key], obj2[key])) return false
    } else {
      if(!obj2Values.includes(obj1[key])) return false
    }
  }
  return true
}

EObject.extend = function(obj1, obj2) {
  for (var p in obj2) {
    try {
      // Property in destination object set; update its value.
      if ( obj2[p].constructor==Object ) {
        obj1[p] = EObject.extend(obj1[p], obj2[p])
      } else {
        obj1[p] = obj2[p]
      }
    } catch(e) {
      // Property in destination object not set; create it and set its value.
      obj1[p] = obj2[p]
    }
  }
  return obj1
}

/*
const reduce = Function.bind.call(Function.call, Array.prototype.reduce);
const isEnumerable = Function.bind.call(Function.call, EObject.prototype.propertyIsEnumerable);
const concat = Function.bind.call(Function.call, Array.prototype.concat);
const keys = Reflect.ownKeys;

if (!EObject.values) {
	EObject.values = function values(O) {
		return reduce(keys(O), (v, k) => concat(v, typeof k === 'string' && isEnumerable(O, k) ? [O[k]] : []), []);
	};
}

*/

export {EObject as default}
export {EObject}