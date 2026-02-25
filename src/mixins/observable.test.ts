import { TestRunner, expect } from "../test/test-runner.js";
import { Observable } from "./observable.js";

const runner = new TestRunner();

runner.test("Observable pattern works correctly", () => {
  let myObject = { data: 1 };
  Observable.call(myObject);

  let observerCalled = false;
  let receivedDataName = null;
  let receivedValue = null;

  let myObserver = {
    observableDataChangeNotification(dataChangedName, currentValue) {
      observerCalled = true;
      receivedDataName = dataChangedName;
      receivedValue = currentValue;
    },
  };

  myObject.addObserver(myObserver);
  myObject.sendDataToObservers("data", 2);

  expect.toBeTruthy(
    observerCalled,
    "Observer should be called when data changes",
  );
  expect.toBe(
    receivedDataName,
    "data",
    "Observer should receive correct data name",
  );
  expect.toEqual(receivedValue, 2, "Observer should receive correct value");
});

// Run all tests
runner.run();
