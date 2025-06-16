// Usage: Observable.call(<object_to_affect>)

import { Assert } from "../assert.js";

function Observable() {
  this.observers = [];

  /**
   * @typedef {Object} Observer
   * @property {Function} observableDataChangeNotification - A function that will be called when the data changes.
   */

  /**
   * Adds an observer to the list of observers.
   *
   * @param {Observer} observerToAdd - The observer to add.
   * @returns {void}
   */
  this.addObserver = function (observerToAdd) {
    Assert.assertIsFunction(
      observerToAdd.observableDataChangeNotification,
      "Error: Observer not compliant with expected interface: 'observableDataChangeNotification'",
    );
    if (this.observers.find((observer) => observer === observerToAdd)) return;
    this.observers.push(observerToAdd);
  };

  /**
   * Removes an observer from the list of observers.
   * @param {Observer} observerToRemove
   */
  this.removeObserver = function (observerToRemove) {
    this.observers = this.observers.filter(
      (observer) => observer !== observerToRemove,
    );
  };

  /**
   * call observableDataChangeNotification method on all observers with received data
   * @param {string} dataChangedName
   * @param {*} currentValue
   */
  this.sendDataToObservers = function (dataChangedName, currentValue) {
    for (let observer of this.observers) {
      observer.observableDataChangeNotification(dataChangedName, currentValue);
    }
  };
}

export { Observable };
