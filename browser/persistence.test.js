import { Platform } from "../platform.js";
import { strict as assert } from "assert";
import { Persistence } from "./persistence.js";

describe("Persistence", function() {
  it("should export an empty object in Node.js", function() {
    if (Platform.isNode()) {
      assert.strictEqual(
        Object.keys(Persistence).length,
        0,
        "Persistence should be an empty object in Node.js"
      );
    } else {
      assert.ok(
        Object.keys(Persistence).length >= 1,
        "Persistence should have at least 1 property in a browser environment"
      );
    }
  });

  it("should have getInstance method in the browser", function() {
    if (!Platform.isNode()) {
      assert.strictEqual(typeof Persistence.getInstance, "function");
    } else {
      assert.ok(true);
    }
  });

  describe("Browser Functionality", function() {
    let mockLocalStorageStore;
    let originalLocalStorage;
    let originalWindow;

    beforeEach(function() {
      if (!Platform.isNode()) {
        mockLocalStorageStore = {};
        if (typeof global.window === "undefined") {
          originalWindow = global.window;
          global.window = {};
        }
        originalLocalStorage = global.window.localStorage;
        global.window.localStorage = {
          getItem: (key) => mockLocalStorageStore[key] || null,
          setItem: (key, value) => {
            mockLocalStorageStore[key] = String(value);
          },
          removeItem: (key) => {
            delete mockLocalStorageStore[key];
          },
          clear: () => {
            mockLocalStorageStore = {};
          },
        };
      }
    });

    afterEach(function() {
      if (!Platform.isNode()) {
        if (originalLocalStorage === undefined) {
          delete global.window.localStorage;
        } else {
          global.window.localStorage = originalLocalStorage;
        }
        if (
          originalWindow === undefined &&
          global.window &&
          Object.keys(global.window).length === 0
        ) {
          delete global.window;
        }
      }
    });

    it("getInstance should return a persistence object with defined entities in browser", function() {
      if (!Platform.isNode()) {
        const p = Persistence.getInstance(
          "testNS_entities",
          "entity1",
          "entity2"
        );
        assert.ok(p, "Persistence object should be returned");
        assert.strictEqual(p.namespace, "testNS_entities");
        assert.ok(Object.prototype.hasOwnProperty.call(p, "entity1"), "entity1 should be a property");
        assert.ok(Object.prototype.hasOwnProperty.call(p, "entity2"), "entity2 should be a property");
        assert.strictEqual(p.entity1, null, "entity1 should be null initially if not in localStorage");
      } else {
        assert.ok(true);
      }
    });

    it("should store and retrieve values correctly in browser", async function() {
      if (!Platform.isNode()) {
        const p = Persistence.getInstance("testNS_storeRetrieve", "myEntity");
        const testValue = { data: "test data", count: 123 };
        p.myEntity = testValue;
        assert.deepStrictEqual(p.myEntity, testValue, "Retrieved value should match stored value immediately after set");
        await new Promise((resolve) => setTimeout(resolve, 10));
        const storedRaw = global.window.localStorage.getItem("testNS_storeRetrieve:myEntity");
        assert.strictEqual(storedRaw, JSON.stringify(testValue), "Value should be JSON stringified in localStorage");
      } else {
        assert.ok(true);
      }
    });

    it("should retrieve previously stored values when a new instance is created for the same namespace in browser", function() {
      if (!Platform.isNode()) {
        const namespace = "testNS_retrieveExisting";
        const entityName = "persistentEntity";
        const initialValue = { message: "hello from past" };
        mockLocalStorageStore[`${namespace}:${entityName}`] = JSON.stringify(initialValue);
        const p = Persistence.getInstance(namespace, entityName);
        assert.deepStrictEqual(p[entityName], initialValue, "Should retrieve value from localStorage on init");
      } else {
        assert.ok(true);
      }
    });

    it("getInstance should return the same instance for the same namespace in browser", function() {
      if (!Platform.isNode()) {
        const p1 = Persistence.getInstance("singletonNS_test", "e1");
        const p2 = Persistence.getInstance("singletonNS_test", "e1");
        assert.strictEqual(p1, p2, "Should return the same instance for the same namespace");
        const p3 = Persistence.getInstance("singletonNS_test", "e1", "e2");
        assert.strictEqual(p1, p3, "Still the same instance");
        assert.ok(Object.prototype.hasOwnProperty.call(p3, "e1"), "Original entity e1 should exist");
        assert.ok(!Object.prototype.hasOwnProperty.call(p3, "e2") || p3.e2 === null, "New entity e2 should not be dynamically added to existing instance or should be null");
      } else {
        assert.ok(true);
      }
    });

    it("values should be isolated by namespace in browser", async function() {
      if (!Platform.isNode()) {
        const p_app1 = Persistence.getInstance("app1_isolation", "config");
        const p_app2 = Persistence.getInstance("app2_isolation", "config");
        p_app1.config = { theme: "dark" };
        p_app2.config = { theme: "light" };
        await new Promise((resolve) => setTimeout(resolve, 10));
        assert.deepStrictEqual(p_app1.config, { theme: "dark" });
        assert.deepStrictEqual(p_app2.config, { theme: "light" });
        assert.strictEqual(global.window.localStorage.getItem("app1_isolation:config"), JSON.stringify({ theme: "dark" }));
        assert.strictEqual(global.window.localStorage.getItem("app2_isolation:config"), JSON.stringify({ theme: "light" }));
      } else {
        assert.ok(true);
      }
    });
  });
});
