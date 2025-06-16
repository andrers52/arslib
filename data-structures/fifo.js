import { Assert } from "../assert.js";

/**
 * @param {number} size
 */
function Fifo(size) {
  Assert.assertIsNumber(size);
  Assert.assert(size > 0, "Invalid size");

  this.data = new Array(size).fill(null);

  /**
   * fifo implementation. add element to end of list, shift them all,
   * and return the first element if removed (otherwise return null)
   * @param {*} element
   * @returns {null|*} The removed element (if any)
   */
  this.insert = function (element) {
    //insert element in available space
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i] == null) {
        this.data[i] = element;
        return null;
      }
    }
    //shift elements to insert new one
    this.data.push(element);
    return this.data.shift();
  };

  /**
   * fifo implementation. remove element from start of list and return it
   *
   * @returns {null|*} The removed element (if any)
   */
  this.remove = function () {
    this.data.push(null);
    return this.data.shift();
  };
}

export { Fifo };
