import { Platform } from "../platform.js";
import { TestRunner, expect } from "../test/test-runner.js";
import { NodeFileStore } from "./node-file-store.js";
import fs from "fs";
import path from "path";

const runner = new TestRunner();

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

runner.test("NodeFileStore should only work in Node.js environment", () => {
  if (!Platform.isNode()) {
    expect.toBeTruthy(
      true,
      "Test passes as this is expected behavior in non-Node environment",
    );
  } else {
    expect.toBeType(
      NodeFileStore.isAvailable,
      "function",
      "isAvailable should be a function in Node.js",
    );
    expect.toBeType(
      NodeFileStore.putFile,
      "function",
      "putFile should be a function in Node.js",
    );
    expect.toBeType(
      NodeFileStore.getFile,
      "function",
      "getFile should be a function in Node.js",
    );
  }
});

runner.test("NodeFileStore.isAvailable should return boolean", () => {
  if (!Platform.isNode()) {
    return; // Skip test if not in Node.js
  }

  const result = NodeFileStore.isAvailable();
  expect.toBeType(result, "boolean", "isAvailable should return a boolean");
  expect.toBeTruthy(result, "isAvailable should return true in Node.js environment");
});

runner.test("NodeFileStore.putFile should store files correctly", () => {
  if (!Platform.isNode()) {
    return; // Skip test if not in Node.js
  }

  return new Promise((resolve) => {
    const mockBlob = createMockBlob(TEST_CONTENT);

    NodeFileStore.putFile(
      TEST_IDENTIFIER,
      mockBlob,
      () => {
        // Verify file was actually created
        const filePath = path.join(TEST_STORAGE_DIR, `${TEST_IDENTIFIER.replace(/[^a-zA-Z0-9.-]/g, '_')}.json`);
        expect.toBeTruthy(fs.existsSync(filePath), "File should be created");
        
        const content = fs.readFileSync(filePath, 'utf8');
        expect.toBe(content, TEST_CONTENT, "File content should match stored content");
        
        resolve();
      },
      (error) => {
        expect.toBeTruthy(false, `putFile should not fail: ${error.message}`);
        resolve();
      }
    );
  });
});

runner.test("NodeFileStore.getFile should retrieve files correctly", () => {
  if (!Platform.isNode()) {
    return; // Skip test if not in Node.js
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
            expect.toBeTruthy(retrievedBlob, "Retrieved blob should exist");
            expect.toBeType(retrievedBlob.parts, "object", "Blob should have parts property");
            expect.toBeType(retrievedBlob.type, "string", "Blob should have type property");
            expect.toBeType(retrievedBlob.text, "function", "Blob should have text method");
            
            const content = retrievedBlob.parts[0];
            expect.toBe(content, TEST_CONTENT, "Retrieved content should match stored content");
            
            resolve();
          },
          (error) => {
            expect.toBeTruthy(false, `getFile should not fail: ${error.message}`);
            resolve();
          }
        );
      },
      (error) => {
        expect.toBeTruthy(false, `putFile should not fail: ${error.message}`);
        resolve();
      }
    );
  });
});

runner.test("NodeFileStore.getFile should return null for non-existent files", () => {
  if (!Platform.isNode()) {
    return; // Skip test if not in Node.js
  }

  return new Promise((resolve) => {
    NodeFileStore.getFile(
      "non-existent-file-12345",
      (retrievedBlob) => {
        expect.toBe(retrievedBlob, null, "Should return null for non-existent files");
        resolve();
      },
      (error) => {
        expect.toBeTruthy(false, `getFile should not fail for non-existent files: ${error.message}`);
        resolve();
      }
    );
  });
});

runner.test("NodeFileStore should handle special characters in identifiers", () => {
  if (!Platform.isNode()) {
    return; // Skip test if not in Node.js
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
        expect.toBeTruthy(fs.existsSync(filePath), "File should be created with sanitized name");
        
        // Try to retrieve it
        NodeFileStore.getFile(
          specialIdentifier,
          (retrievedBlob) => {
            expect.toBeTruthy(retrievedBlob, "Should retrieve file with special characters");
            const content = retrievedBlob.parts[0];
            expect.toBe(content, TEST_CONTENT, "Content should match");
            resolve();
          },
          (error) => {
            expect.toBeTruthy(false, `getFile should not fail: ${error.message}`);
            resolve();
          }
        );
      },
      (error) => {
        expect.toBeTruthy(false, `putFile should not fail: ${error.message}`);
        resolve();
      }
    );
  });
});

runner.test("NodeFileStore should handle JSON objects as fallback", () => {
  if (!Platform.isNode()) {
    return; // Skip test if not in Node.js
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
        expect.toBeTruthy(fs.existsSync(filePath), "File should be created from JSON object");
        
        const content = fs.readFileSync(filePath, 'utf8');
        expect.toBe(content, JSON.stringify(mockBlob), "File content should be JSON string");
        
        resolve();
      },
      (error) => {
        expect.toBeTruthy(false, `putFile should not fail with JSON object: ${error.message}`);
        resolve();
      }
    );
  });
});

runner.test("NodeFileStore should handle blob-like objects with text method", () => {
  if (!Platform.isNode()) {
    return; // Skip test if not in Node.js
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
        expect.toBeTruthy(fs.existsSync(filePath), "File should be created from blob with text method");
        
        const content = fs.readFileSync(filePath, 'utf8');
        expect.toBe(content, TEST_CONTENT, "File content should match blob text content");
        
        resolve();
      },
      (error) => {
        expect.toBeTruthy(false, `putFile should not fail with blob with text method: ${error.message}`);
        resolve();
      }
    );
  });
});

runner.test("NodeFileStore should handle storage directory creation", () => {
  if (!Platform.isNode()) {
    return; // Skip test if not in Node.js
  }

  // Clean up first
  cleanupTestFiles();
  
  // Verify directory exists (it should be created by the module)
  expect.toBeTruthy(fs.existsSync(TEST_STORAGE_DIR), "Storage directory should exist");
  
  // Call isAvailable which should ensure the directory exists
  const result = NodeFileStore.isAvailable();
  expect.toBeTruthy(result, "isAvailable should return true");
  expect.toBeTruthy(fs.existsSync(TEST_STORAGE_DIR), "Storage directory should exist");
});

runner.test("NodeFileStore should handle concurrent operations", () => {
  if (!Platform.isNode()) {
    return; // Skip test if not in Node.js
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
        expect.toBeTruthy(fs.existsSync(filePath), `File ${id} should be created`);
        
        const fileContent = fs.readFileSync(filePath, 'utf8');
        expect.toBe(fileContent, JSON.stringify(content), `File ${id} content should match`);
      });
      
      resolve();
    });
  });
});

runner.test("NodeFileStore should handle error conditions gracefully", () => {
  if (!Platform.isNode()) {
    return; // Skip test if not in Node.js
  }

  return new Promise((resolve) => {
    // Test with invalid blob (null)
    NodeFileStore.putFile(
      "test-error-handling",
      null,
      () => {
        expect.toBeTruthy(false, "putFile should fail with null blob");
        resolve();
      },
      (error) => {
        expect.toBeTruthy(true, "putFile should fail gracefully with null blob");
        resolve();
      }
    );
  });
});

runner.test("NodeFileStore should maintain data integrity", () => {
  if (!Platform.isNode()) {
    return; // Skip test if not in Node.js
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
            
            expect.toBe(retrievedData.string, complexData.string, "String should match");
            expect.toBe(retrievedData.number, complexData.number, "Number should match");
            expect.toBe(retrievedData.boolean, complexData.boolean, "Boolean should match");
            expect.toBe(retrievedData.null, complexData.null, "Null should match");
            expect.toBe(JSON.stringify(retrievedData.array), JSON.stringify(complexData.array), "Array should match");
            expect.toBe(JSON.stringify(retrievedData.object), JSON.stringify(complexData.object), "Object should match");
            
            resolve();
          },
          (error) => {
            expect.toBeTruthy(false, `getFile should not fail: ${error.message}`);
            resolve();
          }
        );
      },
      (error) => {
        expect.toBeTruthy(false, `putFile should not fail: ${error.message}`);
        resolve();
      }
    );
  });
});

// Cleanup after all tests
runner.test("Cleanup test files", () => {
  if (!Platform.isNode()) {
    return; // Skip test if not in Node.js
  }

  cleanupTestFiles();
  // Don't check if directory is removed since it might be used by other tests
  expect.toBeTruthy(true, "Test files should be cleaned up");
});

// Run all tests
runner.run(); 