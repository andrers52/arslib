import { strict as assert } from "assert";
import { Observable } from "./observable.js";

describe("Observable pattern works correctly", function() {
  it("should work", function() {
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

    assert.ok(observerCalled, "Observer should be called when data changes");
    assert.strictEqual(receivedDataName, "data", "Observer should receive correct data name");
    assert.deepStrictEqual(receivedValue, 2, "Observer should receive correct value");
  });
});