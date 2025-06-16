import { Platform } from "../platform.js";
import { TestRunner, expect } from "../test/test-runner.js";
import { Persistence } from "./persistence.js";

const runner = new TestRunner();

runner.test("Persistence should export an empty object in Node.js", () => {
  if (Platform.isNode()) {
    expect.toBe(
      Object.keys(Persistence).length,
      0,
      "Persistence should be an empty object in Node.js",
    );
  } else {
    expect.toBeGreaterThanOrEqual(
      Object.keys(Persistence).length,
      1, // getInstance
      "Persistence should have at least 1 property in a browser environment",
    );
  }
});

runner.test("Persistence should have getInstance method in the browser", () => {
  if (!Platform.isNode()) {
    expect.toBe(typeof Persistence.getInstance, "function");
  } else {
    expect.toBe(true, true); // Test considered passing in Node.js
  }
});

// --- Browser Functionality Tests ---
let mockLocalStorageStore;
let originalLocalStorage;
let originalWindow;

runner.beforeEach(() => {
  if (!Platform.isNode()) {
    mockLocalStorageStore = {};
    // Ensure window object exists in the test environment for browser tests
    if (typeof global.window === "undefined") {
      originalWindow = global.window;
      global.window = {};
    }
    originalLocalStorage = global.window.localStorage; // Save original or undefined

    global.window.localStorage = {
      getItem: (key) => mockLocalStorageStore[key] || null,
      setItem: (key, value) => {
        mockLocalStorageStore[key] = String(value); // localStorage stores strings
      },
      removeItem: (key) => {
        delete mockLocalStorageStore[key];
      },
      clear: () => {
        mockLocalStorageStore = {};
      },
      // Mock length and key(index) if necessary for more complex tests
    };

    // Reset Persistence's internal 'instances' for test isolation by ensuring unique namespaces
    // or by accepting that tests might share the 'instances' state if namespaces are reused.
    // The Persistence module itself would need a reset method for true isolation if namespaces are reused across tests.
  }
});

runner.afterEach(() => {
  if (!Platform.isNode()) {
    if (originalLocalStorage === undefined) {
      delete global.window.localStorage;
    } else {
      global.window.localStorage = originalLocalStorage; // Restore original
    }
    if (
      originalWindow === undefined &&
      global.window &&
      Object.keys(global.window).length === 0
    ) {
      delete global.window;
    }
    // Clean up any instances if a reset mechanism were available
  }
});

runner.test(
  "getInstance should return a persistence object with defined entities in browser",
  () => {
    if (!Platform.isNode()) {
      const p = Persistence.getInstance(
        "testNS_entities",
        "entity1",
        "entity2",
      );
      expect.toBeDefined(p, "Persistence object should be returned");
      expect.toBe(p.namespace, "testNS_entities");
      expect.toBe(
        Object.prototype.hasOwnProperty.call(p, "entity1"),
        true,
        "entity1 should be a property",
      );
      expect.toBe(
        Object.prototype.hasOwnProperty.call(p, "entity2"),
        true,
        "entity2 should be a property",
      );
      expect.toBe(
        p.entity1,
        null,
        "entity1 should be null initially if not in localStorage",
      );
    } else {
      expect.toBe(true, true);
    }
  },
);

runner.test(
  "should store and retrieve values correctly in browser",
  async () => {
    if (!Platform.isNode()) {
      const p = Persistence.getInstance("testNS_storeRetrieve", "myEntity");
      const testValue = { data: "test data", count: 123 };
      p.myEntity = testValue;

      // Retrieve immediately
      expect.toEqual(
        p.myEntity,
        testValue,
        "Retrieved value should match stored value immediately after set",
      );

      // Verify it was stored in mockLocalStorage (after the async save)
      await new Promise((resolve) => setTimeout(resolve, 10)); // Wait for async save

      const storedRaw = global.window.localStorage.getItem(
        "testNS_storeRetrieve:myEntity",
      );
      expect.toBe(
        storedRaw,
        JSON.stringify(testValue),
        "Value should be JSON stringified in localStorage",
      );
    } else {
      expect.toBe(true, true);
    }
  },
);

runner.test(
  "should retrieve previously stored values when a new instance is created for the same namespace in browser",
  () => {
    if (!Platform.isNode()) {
      const namespace = "testNS_retrieveExisting";
      const entityName = "persistentEntity";
      const initialValue = { message: "hello from past" };

      // Simulate pre-existing data in localStorage
      mockLocalStorageStore[`${namespace}:${entityName}`] =
        JSON.stringify(initialValue);

      const p = Persistence.getInstance(namespace, entityName);
      expect.toEqual(
        p[entityName],
        initialValue,
        "Should retrieve value from localStorage on init",
      );
    } else {
      expect.toBe(true, true);
    }
  },
);

runner.test(
  "getInstance should return the same instance for the same namespace in browser",
  () => {
    if (!Platform.isNode()) {
      const p1 = Persistence.getInstance("singletonNS_test", "e1");
      const p2 = Persistence.getInstance("singletonNS_test", "e1");
      expect.toBe(
        p1,
        p2,
        "Should return the same instance for the same namespace",
      );

      const p3 = Persistence.getInstance("singletonNS_test", "e1", "e2");
      expect.toBe(p1, p3, "Still the same instance");
      expect.toBe(
        Object.prototype.hasOwnProperty.call(p3, "e1"),
        true,
        "Original entity e1 should exist",
      );
      // Current implementation: entities are only set on first creation for a namespace.
      expect.toBe(
        !Object.prototype.hasOwnProperty.call(p3, "e2") || p3.e2 === null,
        true,
        "New entity e2 should not be dynamically added to existing instance or should be null",
      );
    } else {
      expect.toBe(true, true);
    }
  },
);

runner.test("values should be isolated by namespace in browser", async () => {
  if (!Platform.isNode()) {
    const p_app1 = Persistence.getInstance("app1_isolation", "config");
    const p_app2 = Persistence.getInstance("app2_isolation", "config");

    p_app1.config = { theme: "dark" };
    p_app2.config = { theme: "light" };

    await new Promise((resolve) => setTimeout(resolve, 10)); // Wait for async saves

    expect.toEqual(p_app1.config, { theme: "dark" });
    expect.toEqual(p_app2.config, { theme: "light" });

    expect.toBe(
      global.window.localStorage.getItem("app1_isolation:config"),
      JSON.stringify({ theme: "dark" }),
    );
    expect.toBe(
      global.window.localStorage.getItem("app2_isolation:config"),
      JSON.stringify({ theme: "light" }),
    );
  } else {
    expect.toBe(true, true);
  }
});

runner.run();
