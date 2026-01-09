"use strict";

/**
 * BrowserFileStore constructor - Creates an IndexedDB-based file storage system
 */
let BrowserFileStore = {};

const setupBrowserFileStore = () => {
  const windowRef =
    typeof globalThis === "undefined" ? undefined : globalThis.window;
  if (!windowRef || typeof windowRef.document === "undefined") {
    return;
  }
  // Browser compatibility setup
  if (!windowRef.indexedDB) {
    windowRef.indexedDB =
      windowRef.webkitIndexedDB ||
      windowRef.mozIndexedDB ||
      windowRef.OIndexedDB ||
      windowRef.msIndexedDB;
  }
  windowRef.IDBTransaction =
    windowRef.IDBTransaction ||
    windowRef.webkitIDBTransaction ||
    windowRef.OIDBTransaction ||
    windowRef.msIDBTransaction;
  windowRef.IDBKeyRange =
    windowRef.IDBKeyRange ||
    windowRef.webkitIDBKeyRange ||
    windowRef.msIDBKeyRange;

  // Private variables
  let db = null;
  let dbReady = false;
  let pendingOperations = [];
  const dbVersion = 1;
  const indexedDbRef = windowRef.indexedDB;

  /**
   * Creates an object store in the database (private)
   * @param {IDBDatabase} dataBase - The IndexedDB database instance
   */
  const createObjectStore = function (dataBase) {
    console.log("Creating objectStore");
    dataBase.createObjectStore("mimi");
  };

  /**
   * Processes pending operations once database is ready (private)
   * @param {Event} error - Optional error event
   */
  const processPendingOperations = function (error) {
    pendingOperations.forEach((operation) => {
      if (error) {
        operation.errorCallback?.(error);
      } else {
        operation.execute();
      }
    });
    pendingOperations = [];
  };

  /**
   * Initializes the IndexedDB database (private)
   */
  const initializeDatabase = function () {
    const request = indexedDbRef.open("mimiFiles", dbVersion);

    request.onerror = function (event) {
      console.error("Database error:", event);
      processPendingOperations(event);
    };

    request.onsuccess = function (event) {
      db = event.target.result;
      dbReady = true;
      console.log("Database opened successfully");
      processPendingOperations();
    };

    request.onupgradeneeded = function (event) {
      createObjectStore(event.target.result);
    };
  };

  // Initialize database on construction
  initializeDatabase();

  /**
   * Checks if IndexedDB is available in the current browser
   * @returns {boolean} True if IndexedDB is supported, false otherwise
   */
  BrowserFileStore.isAvailable = function () {
    return !!windowRef.indexedDB;
  };

  /**
   * Stores a file blob in the IndexedDB
   * @param {string} identifier - Unique identifier for the file
   * @param {Blob} blob - The file blob to store
   * @param {Function} successCallback - Callback function called on successful storage
   * @param {Function} errorCallback - Callback function called on error
   */
  BrowserFileStore.putFile = function (
    identifier,
    blob,
    successCallback,
    errorCallback,
  ) {
    const operation = {
      execute: () => {
        const transaction = db.transaction(["mimi"], "readwrite");
        transaction.oncomplete = successCallback;
        transaction.onerror = errorCallback;
        transaction.objectStore("mimi").put(blob, identifier);
      },
      errorCallback,
    };

    if (dbReady) {
      operation.execute();
    } else {
      pendingOperations.push(operation);
    }
  };

  /**
   * Retrieves a file blob from the IndexedDB
   * @param {string} identifier - Unique identifier for the file to retrieve
   * @param {Function} successCallback - Callback function called with the retrieved blob on success
   * @param {Function} errorCallback - Callback function called on error
   */
  BrowserFileStore.getFile = function (
    identifier,
    successCallback,
    errorCallback,
  ) {
    const operation = {
      execute: () => {
        const transaction = db.transaction(["mimi"], "readonly");
        const request = transaction.objectStore("mimi").get(identifier);
        request.onsuccess = (event) => {
          successCallback(event.target.result);
        };
        request.onerror = errorCallback;
      },
      errorCallback,
    };

    if (dbReady) {
      operation.execute();
    } else {
      pendingOperations.push(operation);
    }
  };
};

setupBrowserFileStore();

export { BrowserFileStore };
