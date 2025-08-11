import { strict as assert } from "assert";
import { Fifo } from "./fifo.js";

describe("Fifo", function() {
  it("should initialize with valid object", function() {
    const fifo = new Fifo(3);
    assert.ok(typeof fifo === "object", "Fifo constructor should return an object");
    assert.ok(fifo.hasOwnProperty("data"), "Fifo should have a data property");
    assert.strictEqual(
      fifo.data.length,
      3,
      "Fifo data array should have the specified size"
    );

    for (let i = 0; i < fifo.data.length; i++) {
      assert.strictEqual(fifo.data[i], null, `Fifo data[${i}] should be initially null`);
    }
  });

  it("should handle insert and remove operations correctly", function() {
    const fifo = new Fifo(3);

    assert.strictEqual(
      fifo.insert(10),
      null,
      "First insertion should return null (no overflow)"
    );
    assert.strictEqual(
      fifo.insert(20),
      null,
      "Second insertion should return null (no overflow)"
    );
    assert.strictEqual(
      fifo.insert(30),
      null,
      "Third insertion should return null (no overflow)"
    );

    assert.strictEqual(
      fifo.insert(40),
      10,
      "Fourth insertion should return the overwritten value (10)"
    );

    assert.strictEqual(
      fifo.remove(),
      20,
      "First removal should return 20 (second inserted value)"
    );
    assert.strictEqual(fifo.remove(), 30, "Second removal should return 30");
    assert.strictEqual(fifo.remove(), 40, "Third removal should return 40");
    assert.strictEqual(
      fifo.remove(),
      null,
      "Removing from empty queue should return null"
    );
  });

  it("should handle invalid sizes properly", function() {
    assert.throws(
      () => new Fifo(0),
      /Invalid size/,
      "Zero size should throw error"
    );
    assert.throws(
      () => new Fifo(-1),
      /Invalid size/,
      "Negative size should throw error"
    );
    assert.throws(
      () => new Fifo("invalid"),
      /expecting a number/,
      "Non-numeric size should throw error"
    );
  });

  it("should handle edge cases", function() {
    const fifo = new Fifo(1);

    assert.strictEqual(
      fifo.insert(100),
      null,
      "First insertion in single-element FIFO should return null"
    );
    assert.strictEqual(
      fifo.insert(200),
      100,
      "Second insertion should immediately overflow and return 100"
    );
    assert.strictEqual(
      fifo.remove(),
      200,
      "Removal should return the current element (200)"
    );
    assert.strictEqual(
      fifo.remove(),
      null,
      "Removing from empty single-element FIFO should return null"
    );
  });

  it("should maintain correct order with mixed operations", function() {
    const fifo = new Fifo(2);

    assert.strictEqual(fifo.insert(1), null, "First insertion should return null");
    assert.strictEqual(
      fifo.remove(),
      1,
      "Should remove and return the first inserted value"
    );
    assert.strictEqual(fifo.insert(2), null, "Insert after removal should return null");
    assert.strictEqual(fifo.insert(3), null, "Second insertion should return null");
    assert.strictEqual(fifo.remove(), 2, "Should remove and return 2");
    assert.strictEqual(fifo.remove(), 3, "Should remove and return 3");
  });

  it("toArrayOrdered should return elements in chronological order without mutation", function() {
    const fifo = new Fifo(3);
    // Empty snapshot
    assert.deepStrictEqual(fifo.toArrayOrdered(), [], "Empty FIFO should return empty array");

    fifo.insert(10);
    fifo.insert(20);
    assert.deepStrictEqual(
      fifo.toArrayOrdered(),
      [10, 20],
      "Snapshot should list [10, 20]"
    );

    fifo.insert(30);
    assert.deepStrictEqual(
      fifo.toArrayOrdered(),
      [10, 20, 30],
      "Snapshot should list [10, 20, 30]"
    );

    // Overflow
    fifo.insert(40); // overwrites 10
    assert.deepStrictEqual(
      fifo.toArrayOrdered(),
      [20, 30, 40],
      "After overflow, snapshot should list [20, 30, 40]"
    );

    // Ensure snapshot does not mutate
    assert.strictEqual(fifo.remove(), 20, "Removal should still return the oldest (20)");
    assert.deepStrictEqual(
      fifo.toArrayOrdered(),
      [30, 40],
      "After removal, snapshot should list [30, 40]"
    );
  });
});
