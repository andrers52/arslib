'use strict'

import Assert from '../util/assert.js'
var EFunction ={}

//run both functions with the same arguments and return result of the last one
// NOTE: 'context' is the functions' 'this'. If not provided, current 'this' will
//       be used.
EFunction.sequence = (f,g, context) => {
  Assert.assertIsFunction(f)
  Assert.assertIsFunction(g)
  Assert.assert(context, 'No function running context found.')
  let self = context || this
  let fBounded = f.bind(self)
  let gBounded = g.bind(self)
  return (arg) => {
    fBounded(arg)
    return gBounded(arg)
  }
}

//compose functions and return the final transformation of input passed throught them
//EFunction.compose(f,g) -> f(g(args))
EFunction.compose = (f,g, context) => {
  Assert.assertIsFunction(f)
  Assert.assertIsFunction(g)
  Assert.assert(context, 'No function running context found.')
  let self = context || this
  let fBounded = f.bind(self)
  let gBounded = g.bind(self)
  let intermediaryResult = null
  return arg => {
    intermediaryResult = gBounded(arg)
    return fBounded(intermediaryResult)
  }
}


/*
//TODO: continue when needed...
//put in simulation after separating concerns with a worker
Function.addThrottleControl = function(functionToBeThrottled, ...args) {
// let startDrawTime, endDrawTime;
// startDrawTime = endDrawTime = Date.now();
// let drawTimeIntegral = 0;
// let drawTimeCounter = 1;
return function throttleControl() {

// startDrawTime = Date.now();
// if ((drawTimeIntegral / drawTimeCounter) < BEClient.Definitions.ANIMATION_INTERVAL) {

functionToBeThrottled.apply(args);

// }
// endDrawTime = Date.now();
// drawTimeIntegral += endDrawTime - startDrawTime;
// drawTimeCounter++;
// if (drawTimeCounter > 100000) {//restart timer to avoid geting negative
//   drawTimeIntegral = drawTimeCounter = 1;
// }
throttleControl();//tail call (need tco to not explode the stack)
}
};
*/



//memoization for a function that has one argument, wich supports "toString()
EFunction.memoize = f => {
  let cache = {}
  const MAX_COUNT = 1000000
  let count = 0
  return arg => {
    if(arg in cache) {
      return cache[arg]
    } else {
      if(count < MAX_COUNT) {
        count++
        return cache[arg] = f( arg )
      }
      return f( arg )
    }
  }
}


//limit function calling rate to a give delay - discard extras
EFunction.limitCallingRateWithDiscard = (f, delay) => {
  let canCall = true
  return (arg) => {
    if(!canCall) return
    canCall = false
    setTimeout(() => {
      canCall = true
    }, delay)
    return f(arg)
  }
}


// Add type asserts to function's arguments and return in runtime
// Note1: the return type can be a type recognizable by typeof or 'void'
// Note2: the arguments type can be a type recognizable by typeof or 'array'
// Note3: context is optional
// example:
// function sun(a,b) {return a + b}
// sun = EFunction.addTypeTest(sun, ['number', 'number'], 'number')
// sun('asdf', 'wer') -> "Error: expecting a number"
EFunction.addRuntimeTypeTest = (fn, argsTypesArray, resultType, context) => {
  return (...args) => {
    for(let argIndex=0; argIndex<=argsTypesArray.length; argIndex++) {
      if(args[argIndex] && 
        (
          (typeof args[argIndex] !== argsTypesArray[argIndex]) ||
          (argsTypesArray[argIndex] === 'array' && !Array.isArray(args[argIndex]))
        )
      ) {
        throw(`Error: function argument ${args[argIndex]} expected to be of type ${argsTypesArray[argIndex]}`)
      }
    }

    let result = context? fn.call(context,...args) : fn(...args)
    
    if(resultType === 'void') return
    if(resultType === 'array') {
      if(!Array.isArray(result)) {
        throw('Error: function return type expected to be of type \'array\'')
      }
    } else if(typeof result !== resultType) {
      throw(`Error: function return type expected to be of type ${resultType}`)
    }
    return result
  }
}

// *** OBSERVE ***
var observedFncId = 0
var observedToObservers = {}
function runObservers(observed) {
  observedToObservers[observed].forEach((observer) => {observer()})
}
//add observer to function invocation (creates new function with observer call)
EFunction.registerObserver = (observedFnc, observerFnc) => {
  let result
  if(observedToObservers[observedFnc.id]) {
    observedToObservers[observedFnc.id].push(observerFnc)
    result = observedFnc
  } else {
    observedFnc.id = observedFncId++
    observedToObservers[observedFnc.id] = [observerFnc]
    result = (arg) => {
      observedFnc(arg)
      runObservers(observedFnc.id)
    }
  }
  return result
}
//remove observer (create new function without the observer)
EFunction.unregisterObserver = (observedFnc, observerFnc) => {
  if(!observedToObservers[observedFnc.id]) return observedFnc
  observedToObservers[observedFnc.id] = 
    observedToObservers[observedFnc.id].filter((observer)=>{return observer !== observerFnc})
  return observedFnc
}

export {EFunction as default}
export {EFunction}