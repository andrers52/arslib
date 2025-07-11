import { Platform } from "../platform.js";
import { strict as assert } from "assert";
import { NodeFileStore } from "./node-file-store.js";
import fs from "fs";
import path from "path";

// Test configuration - use the same directory as the implementation
const TEST_STORAGE_DIR = "./.cache/llm-models";
const TEST_IDENTIFIER = "test-file-123";
const TEST_CONTENT = JSON.stringify({ test: "data", number: 42 });

// Helper function to clean up test files
const cleanupTestFiles = () => {
  try {
    if (fs.existsSync(TEST_STORAGE_DIR)) {
      const files = fs.readdirSync(TEST_STORAGE_DIR);
      files.forEach(file => {
        if (file.startsWith('test-')) {
          fs.unlinkSync(path.join(TEST_STORAGE_DIR, file));
        }
      });
    }
  } catch (error) {
    console.warn("Cleanup warning:", error.message);
  }
};

// Helper function to create a mock blob
const createMockBlob = (content) => {
  return {
    parts: [content],
    type: 'application/json',
    text: async () => content
  };
};

// Helper function to create a real blob (for testing text() method)
const createRealBlob = (content) => {
  return new Blob([content], { type: 'application/json' });
};

after(function() {
  cleanupTestFiles();
});

describe("NodeFileStore should only work in Node.js environment", function() {
  it("should work", function() {
    if (!Platform.isNode()) {
      assert.ok(true, "Test passes as this is expected behavior in non-Node environment");
    } else {
      assert.strictEqual(typeof NodeFileStore.isAvailable, "function", "isAvailable should be a function in Node.js");
      assert.strictEqual(typeof NodeFileStore.putFile, "function", "putFile should be a function in Node.js");
      assert.strictEqual(typeof NodeFileStore.getFile, "function", "getFile should be a function in Node.js");
    }
  });
});

describe("NodeFileStore.isAvailable should return boolean", function() {
  it("should work", function() {
    if (!Platform.isNode()) {
      this.skip(); // Skip test if not in Node.js
    }
    const result = NodeFileStore.isAvailable();
    assert.ok(typeof result === "boolean", "isAvailable should return a boolean");
    assert.ok(result, "isAvailable should return true in Node.js environment");
  });
});

describe("NodeFileStore.putFile should store files correctly", function() {
  it("should work", function() {
    if (!Platform.isNode()) {
      this.skip(); // Skip test if not in Node.js
    }
    return new Promise((resolve) => {
      const mockBlob = createMockBlob(TEST_CONTENT);
      NodeFileStore.putFile(
        TEST_IDENTIFIER,
        mockBlob,
        () => {
          // Verify file was actually created
          const filePath = path.join(TEST_STORAGE_DIR, `${TEST_IDENTIFIER.replace(/[^a-zA-Z0-9.-]/g, '_')}.json`);
          assert.ok(fs.existsSync(filePath), "File should be created");
          const content = fs.readFileSync(filePath, 'utf8');
          assert.strictEqual(content, TEST_CONTENT, "File content should match stored content");
          resolve();
        },
        (error) => {
          assert.fail(`putFile should not fail: ${error.message}`);
          resolve();
        }
      );
    });
  });
});

describe("NodeFileStore.getFile should retrieve files correctly", function() {
  it("should work", function() {
    if (!Platform.isNode()) {
      this.skip(); // Skip test if not in Node.js
    }
    return new Promise((resolve) => {
      // First, store a file
      const mockBlob = createMockBlob(TEST_CONTENT);
      NodeFileStore.putFile(
        TEST_IDENTIFIER,
        mockBlob,
        () => {
          // Then retrieve it
          NodeFileStore.getFile(
            TEST_IDENTIFIER,
            (retrievedBlob) => {
              assert.ok(retrievedBlob, "Retrieved blob should exist");
              assert.ok(typeof retrievedBlob.parts === "object", "Blob should have parts property");
              assert.ok(typeof retrievedBlob.type === "string", "Blob should have type property");
              assert.ok(typeof retrievedBlob.text === "function", "Blob should have text method");
              const content = retrievedBlob.parts[0];
              assert.strictEqual(content, TEST_CONTENT, "Retrieved content should match stored content");
              resolve();
            },
            (error) => {
              assert.fail(`getFile should not fail: ${error.message}`);
              resolve();
            }
          );
        },
        (error) => {
          assert.fail(`putFile should not fail: ${error.message}`);
          resolve();
        }
      );
    });
  });
});

describe("NodeFileStore.getFile should return null for non-existent files", function() {
  it("should work", function() {
    if (!Platform.isNode()) {
      this.skip(); // Skip test if not in Node.js
    }
    return new Promise((resolve) => {
      NodeFileStore.getFile(
        "non-existent-file-12345",
        (retrievedBlob) => {
          assert.strictEqual(retrievedBlob, null, "Should return null for non-existent files");
          resolve();
        },
        (error) => {
          assert.fail(`getFile should not fail for non-existent files: ${error.message}`);
          resolve();
        }
      );
    });
  });
});

describe("NodeFileStore should handle special characters in identifiers", function() {
  it("should work", function() {
    if (!Platform.isNode()) {
      this.skip(); // Skip test if not in Node.js
    }
    return new Promise((resolve) => {
      const specialIdentifier = "test-file-with-special-chars!@#$%^&*()";
      const mockBlob = createMockBlob(TEST_CONTENT);
      NodeFileStore.putFile(
        specialIdentifier,
        mockBlob,
        () => {
          // Verify file was created with sanitized name
          const sanitizedId = specialIdentifier.replace(/[^a-zA-Z0-9.-]/g, '_');
          const filePath = path.join(TEST_STORAGE_DIR, `${sanitizedId}.json`);
          assert.ok(fs.existsSync(filePath), "File should be created with sanitized name");
          // Try to retrieve it
          NodeFileStore.getFile(
            specialIdentifier,
            (retrievedBlob) => {
              assert.ok(retrievedBlob, "Should retrieve file with special characters");
              const content = retrievedBlob.parts[0];
              assert.strictEqual(content, TEST_CONTENT, "Content should match");
              resolve();
            },
            (error) => {
              assert.fail(`getFile should not fail: ${error.message}`);
              resolve();
            }
          );
        },
        (error) => {
          assert.fail(`putFile should not fail: ${error.message}`);
          resolve();
        }
      );
    });
  });
});

describe("NodeFileStore should handle JSON objects as fallback", function() {
  it("should work", function() {
    if (!Platform.isNode()) {
      this.skip(); // Skip test if not in Node.js
    }
    return new Promise((resolve) => {
      const jsonObject = { test: "object", nested: { value: 123 } };
      const mockBlob = { someProperty: "value" }; // Blob without parts or text method
      NodeFileStore.putFile(
        "test-json-object",
        mockBlob,
        () => {
          // Verify file was created with JSON string
          const filePath = path.join(TEST_STORAGE_DIR, "test-json-object.json");
          assert.ok(fs.existsSync(filePath), "File should be created from JSON object");
          const content = fs.readFileSync(filePath, 'utf8');
          assert.strictEqual(content, JSON.stringify(mockBlob), "File content should be JSON string");
          resolve();
        },
        (error) => {
          assert.fail(`putFile should not fail with JSON object: ${error.message}`);
          resolve();
        }
      );
    });
  });
});

describe("NodeFileStore should handle blob-like objects with text method", function() {
  it("should work", function() {
    if (!Platform.isNode()) {
      this.skip(); // Skip test if not in Node.js
    }
    return new Promise((resolve) => {
      const blobWithText = {
        text: async () => TEST_CONTENT,
        type: 'application/json'
      };
      NodeFileStore.putFile(
        "test-blob-with-text",
        blobWithText,
        () => {
          // Verify file was created
          const filePath = path.join(TEST_STORAGE_DIR, "test-blob-with-text.json");
          assert.ok(fs.existsSync(filePath), "File should be created from blob with text method");
          const content = fs.readFileSync(filePath, 'utf8');
          assert.strictEqual(content, TEST_CONTENT, "File content should match blob text content");
          resolve();
        },
        (error) => {
          assert.fail(`putFile should not fail with blob with text method: ${error.message}`);
          resolve();
        }
      );
    });
  });
});

describe("NodeFileStore should handle storage directory creation", function() {
  it("should work", function() {
    if (!Platform.isNode()) {
      this.skip(); // Skip test if not in Node.js
    }
    // Clean up first
    cleanupTestFiles();
    
    // Verify directory exists (it should be created by the module)
    assert.ok(fs.existsSync(TEST_STORAGE_DIR), "Storage directory should exist");
    
    // Call isAvailable which should ensure the directory exists
    const result = NodeFileStore.isAvailable();
    assert.ok(result, "isAvailable should return true");
    assert.ok(fs.existsSync(TEST_STORAGE_DIR), "Storage directory should exist");
  });
});

describe("NodeFileStore should handle concurrent operations", function() {
  it("should work", function() {
    if (!Platform.isNode()) {
      this.skip(); // Skip test if not in Node.js
    }
    return new Promise((resolve) => {
      const promises = [];
      const testData = [
        { id: "concurrent-1", content: "data-1" },
        { id: "concurrent-2", content: "data-2" },
        { id: "concurrent-3", content: "data-3" }
      ];
      
      // Store multiple files concurrently
      testData.forEach(({ id, content }) => {
        const promise = new Promise((resolveOp) => {
          const mockBlob = createMockBlob(JSON.stringify(content));
          NodeFileStore.putFile(id, mockBlob, resolveOp, resolveOp);
        });
        promises.push(promise);
      });
      
      Promise.all(promises).then(() => {
        // Verify all files were created
        testData.forEach(({ id, content }) => {
          const filePath = path.join(TEST_STORAGE_DIR, `${id}.json`);
          assert.ok(fs.existsSync(filePath), `File ${id} should be created`);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          assert.strictEqual(fileContent, JSON.stringify(content), `File ${id} content should match`);
        });
        resolve();
      });
    });
  });
});

describe("NodeFileStore should handle error conditions gracefully", function() {
  it("should work", function() {
    if (!Platform.isNode()) {
      this.skip(); // Skip test if not in Node.js
    }
    return new Promise((resolve) => {
      // Test with invalid blob (null)
      NodeFileStore.putFile(
        "test-error-handling",
        null,
        () => {
          assert.ok(false, "putFile should fail with null blob");
          resolve();
        },
        (error) => {
          assert.ok(true, "putFile should fail gracefully with null blob");
          resolve();
        }
      );
    });
  });
});

describe("NodeFileStore should maintain data integrity", function() {
  it("should work", function() {
    if (!Platform.isNode()) {
      this.skip(); // Skip test if not in Node.js
    }
    return new Promise((resolve) => {
      const complexData = {
        string: "test string",
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3, "test"],
        object: { nested: { value: "deep" } }
      };
      
      const mockBlob = createMockBlob(JSON.stringify(complexData));
      
      NodeFileStore.putFile(
        "test-data-integrity",
        mockBlob,
        () => {
          NodeFileStore.getFile(
            "test-data-integrity",
            (retrievedBlob) => {
              const retrievedData = JSON.parse(retrievedBlob.parts[0]);
              
              assert.strictEqual(retrievedData.string, complexData.string, "String should match");
              assert.strictEqual(retrievedData.number, complexData.number, "Number should match");
              assert.strictEqual(retrievedData.boolean, complexData.boolean, "Boolean should match");
              assert.strictEqual(retrievedData.null, complexData.null, "Null should match");
              assert.strictEqual(JSON.stringify(retrievedData.array), JSON.stringify(complexData.array), "Array should match");
              assert.strictEqual(JSON.stringify(retrievedData.object), JSON.stringify(complexData.object), "Object should match");
              
              resolve();
            },
            (error) => {
              assert.fail(`getFile should not fail: ${error.message}`);
              resolve();
            }
          );
        },
        (error) => {
          assert.fail(`putFile should not fail: ${error.message}`);
          resolve();
        }
      );
    });
  });
});