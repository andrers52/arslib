import { Assert } from "../assert.js";

/**
 * A circular buffer implementation of a First-In-First-Out (FIFO) queue.
 * This implementation uses a fixed-size array to store elements in a circular manner,
 * providing O(1) time complexity for both insert and remove operations.
 * 
 * @param {number} size - The maximum number of elements the FIFO can hold
 * @throws {Error} If size is not a positive number
 */
function Fifo(size) {
  Assert.assertIsNumber(size);
  Assert.assert(size > 0, "Invalid size");

  this.data = new Array(size).fill(null);
  this.nextInsertPos = 0; // Track the next position to insert
  this.count = 0; // Track how many elements are currently in the FIFO

  /**
   * Inserts an element into the FIFO. If the FIFO is full, the oldest element
   * is automatically removed and returned. This operation has O(1) time complexity.
   * 
   * @param {*} element - The element to insert
   * @returns {null|*} The removed element if the FIFO was full, null otherwise
   */
  this.insert = function (element) {
    let removedElement = null;
    
    // If the FIFO is full, we need to remove the oldest element
    if (this.count === this.data.length) {
      removedElement = this.data[this.nextInsertPos];
    }
    
    // Insert the new element at the tracked position
    this.data[this.nextInsertPos] = element;
    
    // Update the next insert position (circular)
    this.nextInsertPos = (this.nextInsertPos + 1) % this.data.length;
    
    // Update count if we're not at capacity
    if (this.count < this.data.length) {
      this.count++;
    }
    
    return removedElement;
  };

  /**
   * Removes and returns the oldest element from the FIFO (First-In-First-Out).
   * This operation has O(1) time complexity.
   *
   * @returns {null|*} The oldest element if the FIFO is not empty, null otherwise
   */
  this.remove = function () {
    if (this.count === 0) {
      return null;
    }
    
    // Calculate the position of the oldest element
    const oldestPos = (this.nextInsertPos - this.count + this.data.length) % this.data.length;
    const removedElement = this.data[oldestPos];
    
    // Mark the position as empty
    this.data[oldestPos] = null;
    this.count--;
    
    return removedElement;
  };

  /**
   * Returns a new array with the current elements in chronological order
   * (oldest first, newest last), without modifying the FIFO contents.
   *
   * @returns {Array<*>} Snapshot array of elements from oldest to newest
   */
  this.toArrayOrdered = function () {
    if (this.count === 0) {
      return [];
    }

    const ordered = [];
    for (let i = 0; i < this.count; i++) {
      const index = (this.nextInsertPos - this.count + i + this.data.length) % this.data.length;
      const value = this.data[index];
      if (value !== null) {
        ordered.push(value);
      }
    }
    return ordered;
  };
}

export { Fifo };
