"use strict";

import { Platform } from "../platform.js";
import { Assert } from "../assert.js";

/**
 * NodeFileStore constructor - Creates a filesystem-based file storage system for Node.js
 */
let NodeFileStore = {};

if (Platform.isNode()) {
  // Node.js implementation using filesystem
  const fs = await import("fs");
  const path = await import("path");
  
  // Private variables
  const storageDir = "./.cache/llm-models";
  const dbVersion = 1;

  /**
   * Ensures the storage directory exists
   * @private
   */
  const ensureStorageDir = function() {
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
  };

  /**
   * Gets the file path for a given identifier
   * @param {string} identifier - Unique identifier for the file
   * @returns {string} Full file path
   * @private
   */
  const getFilePath = function(identifier) {
    // Sanitize identifier to be filesystem-safe
    const safeId = identifier.replace(/[^a-zA-Z0-9.-]/g, '_');
    return path.join(storageDir, `${safeId}.json`);
  };

  /**
   * Checks if filesystem storage is available in the current Node.js environment
   * @returns {boolean} True if filesystem storage is supported, false otherwise
   */
  NodeFileStore.isAvailable = function() {
    try {
      ensureStorageDir();
      return true;
    } catch (error) {
      console.warn("⚠️ Filesystem storage not available:", error.message);
      return false;
    }
  };

  /**
   * Stores a file blob in the filesystem
   * @param {string} identifier - Unique identifier for the file
   * @param {Blob} blob - The file blob to store
   * @param {Function} successCallback - Callback function called on successful storage
   * @param {Function} errorCallback - Callback function called on error
   */
  NodeFileStore.putFile = function(identifier, blob, successCallback, errorCallback) {
    try {
      ensureStorageDir();
      const filePath = getFilePath(identifier);
      
      // Convert blob to string (assuming JSON content)
      let content;
      if (blob.parts) {
        // Handle our mock Blob implementation
        content = blob.parts.join('');
      } else if (blob.text) {
        // Handle real Blob with text() method
        blob.text().then(text => {
          fs.writeFileSync(filePath, text);
          if (successCallback) successCallback();
        }).catch(error => {
          if (errorCallback) errorCallback(error);
        });
        return;
      } else {
        // Fallback for other blob types
        content = JSON.stringify(blob);
      }
      
      fs.writeFileSync(filePath, content);
      if (successCallback) successCallback();
    } catch (error) {
      if (errorCallback) errorCallback(error);
    }
  };

  /**
   * Retrieves a file blob from the filesystem
   * @param {string} identifier - Unique identifier for the file to retrieve
   * @param {Function} successCallback - Callback function called with the retrieved blob on success
   * @param {Function} errorCallback - Callback function called on error
   */
  NodeFileStore.getFile = function(identifier, successCallback, errorCallback) {
    try {
      const filePath = getFilePath(identifier);
      
      if (!fs.existsSync(filePath)) {
        if (successCallback) successCallback(null);
        return;
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Create a mock Blob that matches the browser API
      const blob = {
        parts: [content],
        type: 'application/json',
        text: async () => content
      };
      
      if (successCallback) successCallback(blob);
    } catch (error) {
      if (errorCallback) errorCallback(error);
    }
  };

  // Initialize storage directory
  ensureStorageDir();
}

export { NodeFileStore }; 