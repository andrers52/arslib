// @ts-nocheck

/** Module-level private state — shared across all static method calls. */
let _db: IDBDatabase | null = null;
let _dbReady = false;
const _pendingOps: Array<{ execute: () => void; errorCallback?: (err: unknown) => void }> = [];
let _dbOpenStarted = false;

/** Database and object-store names. */
const DB_NAME = "arslib_files";
const STORE_NAME = "files";
const DB_VERSION = 1;

export class BrowserFileStore {
  // ---------------------------------------------------------------------------
  //  Private helpers (module-level closures)
  // ---------------------------------------------------------------------------

  /**
   * Applies the cross-browser IndexedDB shim once.
   * @returns The resolved `indexedDB` reference or `undefined`.
   */
  static _getIndexedDbRef() {
    const win = typeof globalThis !== "undefined" ? globalThis.window : undefined;
    if (!win) return undefined;

    let idb = win.indexedDB;
    if (!idb) {
      idb =
        win.webkitIndexedDB ||
        win.mozIndexedDB ||
        win.OIndexedDB ||
        win.msIndexedDB;
    }
    win.IDBTransaction =
      win.IDBTransaction ||
      win.webkitIDBTransaction ||
      win.OIDBTransaction ||
      win.msIDBTransaction;
    win.IDBKeyRange =
      win.IDBKeyRange ||
      win.webkitIDBKeyRange ||
      win.msIDBKeyRange;

    return idb;
  }

  /**
   * Drains the pending-operations queue.
   * @param error - If provided, each operation's errorCallback is invoked.
   */
  static _drainPending(error?: unknown) {
    const ops = _pendingOps.splice(0);
    for (const op of ops) {
      if (error) {
        op.errorCallback?.(error);
      } else {
        op.execute();
      }
    }
  }

  /**
   * Lazily opens the IndexedDB database on first demand.
   * Idempotent — guarded by `_dbOpenStarted`.
   */
  static _ensureDb() {
    if (_dbReady) return; // already open
    if (_dbOpenStarted) return; // opening in progress (caller will queue)

    const idb = BrowserFileStore._getIndexedDbRef();
    if (!idb) return; // non-browser — nothing to do

    _dbOpenStarted = true;

    const request = idb.open(DB_NAME, DB_VERSION);

    request.onerror = (event: unknown) => {
      console.error("Database error:", event);
      BrowserFileStore._drainPending(event);
    };

    request.onsuccess = () => {
      _db = request.result;
      _dbReady = true;
      BrowserFileStore._drainPending();
    };

    request.onupgradeneeded = (event: Event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  }

  // ---------------------------------------------------------------------------
  //  Public API
  // ---------------------------------------------------------------------------

  /**
   * Checks whether IndexedDB is available in the current environment.
   * Does **not** open a database connection.
   * @returns `true` if a browser with IndexedDB support is detected.
   */
  static isAvailable(): boolean {
    const idb = BrowserFileStore._getIndexedDbRef();
    return !!idb;
  }

  /**
   * Stores a file blob in the IndexedDB under the given identifier.
   * Opens the database lazily on first call.
   * @param identifier - Unique key for the stored blob.
   * @param blob - The Blob (or BufferSource) to persist.
   * @param successCallback - Invoked when the write transaction completes.
   * @param errorCallback - Invoked on any error (open or write).
   */
  static putFile(
    identifier: string,
    blob: Blob | BufferSource,
    successCallback?: () => void,
    errorCallback?: (err: unknown) => void,
  ): void {
    const idb = BrowserFileStore._getIndexedDbRef();
    if (!idb) {
      // Non-browser environment — fail fast via callback.
      errorCallback?.(new Error("BrowserFileStore is not available in this environment"));
      return;
    }

    BrowserFileStore._ensureDb();

    const operation = {
      execute: () => {
        const tx = _db!.transaction([STORE_NAME], "readwrite");
        tx.oncomplete = successCallback;
        tx.onerror = errorCallback;
        tx.objectStore(STORE_NAME).put(blob, identifier);
      },
      errorCallback,
    };

    if (_dbReady) {
      operation.execute();
    } else {
      _pendingOps.push(operation);
    }
  }

  /**
   * Retrieves a previously stored blob by its identifier.
   * Opens the database lazily on first call.
   * @param identifier - Key of the blob to retrieve.
   * @param successCallback - Invoked with the retrieved value (may be `undefined` if not found).
   * @param errorCallback - Invoked on any error (open or read).
   */
  static getFile(
    identifier: string,
    successCallback?: (value: unknown) => void,
    errorCallback?: (err: unknown) => void,
  ): void {
    const idb = BrowserFileStore._getIndexedDbRef();
    if (!idb) {
      // Non-browser environment — fail fast via callback.
      errorCallback?.(new Error("BrowserFileStore is not available in this environment"));
      return;
    }

    BrowserFileStore._ensureDb();

    const operation = {
      execute: () => {
        const tx = _db!.transaction([STORE_NAME], "readonly");
        const req = tx.objectStore(STORE_NAME).get(identifier);
        req.onsuccess = (event: Event) => {
          successCallback?.((req as IDBRequest).result);
        };
        req.onerror = errorCallback;
      },
      errorCallback,
    };

    if (_dbReady) {
      operation.execute();
    } else {
      _pendingOps.push(operation);
    }
  }
}
