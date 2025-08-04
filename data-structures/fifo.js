import { Assert } from "../assert.js";

/**
 * @param {number} size
 */
function Fifo(size) {
  Assert.assertIsNumber(size);
  Assert.assert(size > 0, "Invalid size");

  this.data = new Array(size).fill(null);
  this.nextInsertPos = 0; // Track the next position to insert
  this.count = 0; // Track how many elements are currently in the FIFO

  /**
   * fifo implementation. add element to end of list, shift them all,
   * and return the first element if removed (otherwise return null)
   * @param {*} element
   * @returns {null|*} The removed element (if any)
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
   * fifo implementation. remove element from start of list and return it
   *
   * @returns {null|*} The removed element (if any)
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
}

export { Fifo };
