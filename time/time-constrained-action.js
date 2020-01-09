// actions based on temporal constraint

'use strict'

import Time from './time.js'

let TimeConstrainedAction = {}

TimeConstrainedAction.runUntilConditionReady =
  ( FnToRun,
    conditionFn,
    testInterval,
    maxWaitTime = null,
    message = null,
    startWaiting = false) => {
    let initialTime = Time.currentTime()
    return new Promise(resolve => {
      let tester = () => {
        if (conditionFn())  {resolve(true); return}
        FnToRun()
        if(maxWaitTime) {
          let currentTime = Time.currentTime()
          if((currentTime - initialTime) > maxWaitTime) {resolve(false); return}
        }
        if(message) console.log('waiting for: ' + message)
        setTimeout(tester, testInterval)
      }
      if(startWaiting) setTimeout(tester, testInterval) // first interval
      else tester() // start right away
    })
  }

TimeConstrainedAction.returnWhenConditionReady = 
  ( conditionFn,
    testInterval,
    maxWaitTime = null,
    message = null,
    startWaiting = false) => {

    TimeConstrainedAction.runUntilConditionReady(
      () => {},
      conditionFn,
      testInterval,
      maxWaitTime,
      message,
      startWaiting)
  }

TimeConstrainedAction.callWithDelay = async (func, time, argsArray = []) => {
  let asyncCallback = async (resolve) => {
    resolve(await (func.apply(this, argsArray)))
  }
  return new Promise(resolve => {
    setTimeout(() => asyncCallback(resolve), time)
  })
}

TimeConstrainedAction.wait = async (time) => {
  return new Promise(resolve =>
    setTimeout(() => resolve(true), time)
  )
}


export {TimeConstrainedAction as default}
export {TimeConstrainedAction}