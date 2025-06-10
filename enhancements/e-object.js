"use strict";
var EObject = {};

/**
 * Checks if an object is empty (has no own properties)
 * @param {Object} obj - The object to check
 * @returns {boolean} True if the object is empty, false otherwise
 */
EObject.isEmpty = (obj) =>
  Object.keys(obj).length === 0 && obj.constructor === Object;

/**
 * Swaps the keys and values of an object
 * @param {Object} obj - The object whose keys and values should be swapped
 * @returns {Object} A new object with keys and values swapped
 */
EObject.swapObjectKeysAndValues = (obj) => {
  var new_obj = {};
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      new_obj[obj[prop]] = prop;
    }
  }
  return new_obj;
};

/**
 * Recursively checks if two objects have the same properties and values
 * @param {Object} obj1 - First object to compare
 * @param {Object} obj2 - Second object to compare
 * @returns {boolean} True if objects have same properties and values (deep comparison), false otherwise
 */
EObject.hasSameProperties = function (obj1, obj2) {
  if (typeof obj1 !== "object" || typeof obj2 !== "object") return false;
  const obj1Keys = Object.keys(obj1);
  const obj2Values = Object.values(obj2);
  if (obj1Keys.length !== obj2Values.length) return false;
  for (let i = 0; i < obj1Keys.length; i++) {
    const key = obj1Keys[i];
    if (typeof obj1[key] === "object") {
      if (!EObject.hasSameProperties(obj1[key], obj2[key])) return false;
    } else {
      if (!obj2Values.includes(obj1[key])) return false;
    }
  }
  return true;
};

/**
 * Recursively extends/merges properties from obj2 into obj1 (deep merge)
 * @param {Object} obj1 - Target object to extend (will be modified)
 * @param {Object} obj2 - Source object to copy properties from
 * @returns {Object} The extended obj1 object
 */
EObject.extend = function (obj1, obj2) {
  for (var p in obj2) {
    try {
      // Property in destination object set; update its value.
      if (obj2[p].constructor == Object) {
        obj1[p] = EObject.extend(obj1[p], obj2[p]);
      } else {
        obj1[p] = obj2[p];
      }
    } catch (e) {
      // Property in destination object not set; create it and set its value.
      obj1[p] = obj2[p];
    }
  }
  return obj1;
};

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

export { EObject };
