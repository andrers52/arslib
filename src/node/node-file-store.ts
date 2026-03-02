import { Platform } from "../platform.js";

const storageDir = "./.cache/ars-storage";

export class NodeFileStore {
  /**
   * NodeFileStore constructor - Creates a filesystem-based file storage system for Node.js
   */

  /**
   * Ensures the storage directory exists
   * @private
   */
  static async ensureStorageDir() {
    if (!Platform.isNode()) return;
    const fs = await import("fs");
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
  }

  /**
   * Gets the file path for a given identifier
   * @param {string} identifier - Unique identifier for the file
   * @returns {string} Full file path
   * @private
   */
  static getFilePath(identifier: any) {
    // We'll use a simple path join to avoid top-level path import
    const safeId = identifier.replace(/[^a-zA-Z0-9.-]/g, "_");
    return `${storageDir}/${safeId}.json`;
  }

  /**
   * Checks if filesystem storage is available in the current Node.js environment
   * @returns {boolean} True if filesystem storage is supported, false otherwise
   */
  static async isAvailable() {
    if (!Platform.isNode()) return false;
    try {
      await NodeFileStore.ensureStorageDir();
      return true;
    } catch (error) {
      console.warn("⚠️ Filesystem storage not available:", error.message);
      return false;
    }
  }

  /**
   * Stores a file blob in the filesystem
   * @param {string} identifier - Unique identifier for the file
   * @param {Blob} blob - The file blob to store
   * @param {Function} successCallback - Callback function called on successful storage
   * @param {Function} errorCallback - Callback function called on error
   */
  static async putFile(identifier: any, blob: any, successCallback: any, errorCallback: any) {
    if (!Platform.isNode()) {
      if (errorCallback) errorCallback(new Error("NodeFileStore is only available in Node.js"));
      return;
    }
    try {
      await NodeFileStore.ensureStorageDir();
      const fs = await import("fs");
      const filePath = NodeFileStore.getFilePath(identifier);

      // Convert blob to string (assuming JSON content)
      if (blob.text) {
        blob.text().then((text) => {
          fs.writeFileSync(filePath, text);
          if (successCallback) successCallback();
        }).catch(errorCallback);
      } else {
        const content = blob.parts ? blob.parts.join("") : JSON.stringify(blob);
        fs.writeFileSync(filePath, content);
        if (successCallback) successCallback();
      }
    } catch (error) {
      if (errorCallback) errorCallback(error);
    }
  }

  /**
   * Retrieves a file blob from the filesystem
   * @param {string} identifier - Unique identifier for the file to retrieve
   * @param {Function} successCallback - Callback function called with the retrieved blob on success
   * @param {Function} errorCallback - Callback function called on error
   */
  static async getFile(identifier: any, successCallback: any, errorCallback: any) {
    if (!Platform.isNode()) {
      if (errorCallback) errorCallback(new Error("NodeFileStore is only available in Node.js"));
      return;
    }
    try {
      const fs = await import("fs");
      const filePath = NodeFileStore.getFilePath(identifier);

      if (!fs.existsSync(filePath)) {
        if (successCallback) successCallback(null);
        return;
      }

      const content = fs.readFileSync(filePath, "utf8");
      const blob = {
        parts: [content],
        type: "application/json",
        text: async () => content,
      };

      if (successCallback) successCallback(blob);
    } catch (error) {
      if (errorCallback) errorCallback(error);
    }
  }
}
