"use strict";
//http://www.tutorialspoint.com/html5/html5_indexeddb.htm

/**
 * FileStore constructor - Creates an IndexedDB-based file storage system
 * @constructor
 */
function FileStore() {
  if (!window.indexedDB) {
    window.indexedDB =
      window.webkitIndexedDB ||
      window.mozIndexedDB ||
      window.OIndexedDB ||
      window.msIndexedDB;
  }
  window.IDBTransaction =
    window.IDBTransaction ||
    window.webkitIDBTransaction ||
    window.OIDBTransaction ||
    window.msIDBTransaction;
  window.IDBKeyRange =
    window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
  let dbVersion = 1;

  /**
   * Checks if IndexedDB is available in the current browser
   * @returns {boolean} True if IndexedDB is supported, false otherwise
   */
  this.isAvailable = function () {
    return !!window.indexedDB;
  };

  // Create/open database
  var request = indexedDB.open("mimiFiles", dbVersion);

  request.onerror = function (event) {
    console.log("error: " + event);
  };

  request.onsuccess = function () {
    db = request.result;
    console.log("success: " + db);
  };

  let db;
  /**
   * Creates an object store in the database
   * @param {IDBDatabase} dataBase - The IndexedDB database instance
   */
  let createObjectStore = function (dataBase) {
    // Create an objectStore
    console.log("Creating objectStore");
    dataBase.createObjectStore("mimi");
  };

  request.onupgradeneeded = function (event) {
    createObjectStore(event.target.result);
  };

  /**
   * Stores a file blob in the IndexedDB
   * @param {string} identifier - Unique identifier for the file
   * @param {Blob} blob - The file blob to store
   * @param {Function} successCalback - Callback function called on successful storage
   * @param {Function} errorCallback - Callback function called on error
   */
  this.putFile = function (identifier, blob, successCalback, errorCallback) {
    // Open a transaction to the database
    var transaction = db.transaction(["mimi"], window.IDBTransaction.WRITE);
    transaction.onsuccess = successCalback;
    transaction.onerror = errorCallback;
    // Put blob into dabase
    transaction.objectStore("mimi").put(blob, identifier);
  };

  /**
   * Retrieves a file blob from the IndexedDB
   * @param {string} identifier - Unique identifier for the file to retrieve
   * @param {Function} successCallback - Callback function called with the retrieved blob on success
   * @param {Function} errorCallback - Callback function called on error
   */
  this.getFile = function (identifier, successCallback, errorCallback) {
    // Open a transaction to the database
    var transaction = db.transaction(["mimi"], window.IDBTransaction.READ);
    transaction.onsuccess = (event) => {
      successCallback(event.target.result);
    };
    transaction.onerror = errorCallback;
    //retrieve blob
    transaction.objectStore("mimi").get(identifier);
  };
}

export { FileStore };
