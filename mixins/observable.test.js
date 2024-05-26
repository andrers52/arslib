import { Assert } from "../util/assert.js";
import { Observable } from "./observable.js";

// enable test mode
Assert.testMode = true;

function testObservable() {
  let myObject = { data: 1 };
  Observable.call(myObject);

  let observerCalled = false;
  let myObserver = {
    observableDataChangeNotification(dataChangedName, currentValue) {
      observerCalled = true;
      Assert.assertIsEqual(
        dataChangedName,
        "data",
        'Data changed name should be "data"',
      );
      Assert.assertIsTrue(currentValue == 2, "Current value should be 2");
    },
  };

  myObject.addObserver(myObserver);
  myObject.sendDataToObservers("data", 2);

  Assert.assertIsTrue(observerCalled, "Observer should be called");
}

// Run the test
testObservable();
