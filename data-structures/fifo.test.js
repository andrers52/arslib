// Import the Assert utility
import Assert from "../util/assert.js";
import Fifo from "./fifo.js";

// Enable test mode for testing
Assert.testMode = true;

function testFifoInitialization() {
  const fifo = new Fifo(3);
  Assert.assertIsObject(fifo, "Initialization should create a Fifo object");
  Assert.assertIsEqual(
    fifo.data.length,
    3,
    "Fifo should be initialized with the correct size",
  );
  console.log("testFifoInitialization: PASS");
}

function testFifoInsertAndRemove() {
  const fifo = new Fifo(3);
  let removed;

  // Test insert with no removal expected (Fifo not full)
  Assert.assertIsNull(fifo.insert(10), "Insert should not remove any element");
  Assert.assertIsNull(fifo.insert(20), "Insert should not remove any element");

  // Test insert that causes no removal (Fifo becomes full)
  removed = fifo.insert(30);
  Assert.assertIsNull(
    removed,
    "Insert should not remove any element as fifo is not yet full",
  );

  // Inserting into a full fifo should remove the first element
  removed = fifo.insert(40);
  Assert.assertIsEqual(
    removed,
    10,
    "Insert should remove the first element when fifo is full",
  );

  // Testing removal
  removed = fifo.remove();
  Assert.assertIsEqual(removed, 20, "Remove should return the first element");
  removed = fifo.remove();
  Assert.assertIsEqual(
    removed,
    30,
    "Remove should return the next first element",
  );
  removed = fifo.remove();
  Assert.assertIsEqual(removed, 40, "Remove should return the last element");

  // Now fifo should be empty, removing should return null
  removed = fifo.remove();
  Assert.assertIsNull(removed, "Remove should return null as fifo is empty");

  console.log("testFifoInsertAndRemove: PASS");
}

// Run the tests
testFifoInitialization();
testFifoInsertAndRemove();
