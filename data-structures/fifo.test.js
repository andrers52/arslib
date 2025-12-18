import { TestRunner, expect } from "../test/test-runner.js";
import { Fifo } from "./fifo.js";

const runner = new TestRunner();

runner.test("Fifo initialization creates valid object", () => {
  const fifo = new Fifo(3);
  expect.toBeType(fifo, "object", "Fifo constructor should return an object");
  expect.toHaveProperty(fifo, "data", "Fifo should have a data property");
  expect.toHaveLength(
    fifo.data,
    3,
    "Fifo data array should have the specified size",
  );

  for (let i = 0; i < fifo.data.length; i++) {
    expect.toBeNull(fifo.data[i], `Fifo data[${i}] should be initially null`);
  }
});

runner.test("Fifo insert and remove operations work correctly", () => {
  const fifo = new Fifo(3);

  expect.toBeNull(
    fifo.insert(10),
    "First insertion should return null (no overflow)",
  );
  expect.toBeNull(
    fifo.insert(20),
    "Second insertion should return null (no overflow)",
  );
  expect.toBeNull(
    fifo.insert(30),
    "Third insertion should return null (no overflow)",
  );

  expect.toBe(
    fifo.insert(40),
    10,
    "Fourth insertion should return the overwritten value (10)",
  );

  expect.toBe(
    fifo.remove(),
    20,
    "First removal should return 20 (second inserted value)",
  );
  expect.toBe(fifo.remove(), 30, "Second removal should return 30");
  expect.toBe(fifo.remove(), 40, "Third removal should return 40");
  expect.toBeNull(
    fifo.remove(),
    "Removing from empty queue should return null",
  );
});

runner.test("Fifo handles invalid sizes properly", () => {
  expect.toThrow(
    () => new Fifo(0),
    "Invalid size",
    "Zero size should throw error",
  );
  expect.toThrow(
    () => new Fifo(-1),
    "Invalid size",
    "Negative size should throw error",
  );
  expect.toThrow(
    () => new Fifo("invalid"),
    "expecting a number",
    "Non-numeric size should throw error",
  );
});

runner.test("Fifo handles edge cases", () => {
  const fifo = new Fifo(1);

  expect.toBeNull(
    fifo.insert(100),
    "First insertion in single-element FIFO should return null",
  );
  expect.toBe(
    fifo.insert(200),
    100,
    "Second insertion should immediately overflow and return 100",
  );
  expect.toBe(
    fifo.remove(),
    200,
    "Removal should return the current element (200)",
  );
  expect.toBeNull(
    fifo.remove(),
    "Removing from empty single-element FIFO should return null",
  );
});

runner.test("Fifo maintains correct order with mixed operations", () => {
  const fifo = new Fifo(2);

  expect.toBeNull(fifo.insert(1), "First insertion should return null");
  expect.toBe(
    fifo.remove(),
    1,
    "Should remove and return the first inserted value",
  );
  expect.toBeNull(fifo.insert(2), "Insert after removal should return null");
  expect.toBeNull(fifo.insert(3), "Second insertion should return null");
  expect.toBe(fifo.remove(), 2, "Should remove and return 2");
  expect.toBe(fifo.remove(), 3, "Should remove and return 3");
});

// Run all tests
runner.run();
