// Usage: Observable.call(<object_to_affect>)

import Assert from '../util/assert.js'

function Observable() {
  this.observers = []
  this.addObserver = function (observerToAdd) {
    Assert.assertIsFunction(
      observerToAdd.observableDataChangeNotification, 
      'Error: Observer not compliant with expected interface: \'observableDataChangeNotification\'')
    if(this.observers.find(observer => observer === observerToAdd)) return
    this.observers.push(observerToAdd)
  }
  this.removeObserver = function (observerToRemove) {
    this.observers = this.observers.filter(observer => observer !== observerToRemove)
  }
  // call method on all observers that received data
  this.sendDataToObservers = function (dataChangedName, currentValue) {
    for (let observer of this.observers) {
      observer.observerobservableDataChangeNotification(
        dataChangedName, currentValue)
    }
  }
}

export {Observable as default}
export {Observable}