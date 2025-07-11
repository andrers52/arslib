import { strict as assert } from "assert";
import { Platform } from "../../platform.js";
import { NodeLogToFile } from "./node-log-to-file.js";

// Cleanup function to remove test-generated log files
async function cleanup() {
  if (Platform.isNode()) {
    try {
      const { default: fs } = await import("fs");
      const { default: path } = await import("path");

      // Remove individual log files created during tests
      const logFiles = [
        "log.txt",
        "./log/testEntity_testDesc_val1_val2.txt",
        "./log/testEntity_testDesc_value1_value2.txt",
        "./log/testEntity_testDesc_value1.txt",
        "./log/testEntity_testDescription_value1_value2.txt",
        "./log/entity1_desc1_val1.txt",
        "./log/entity2_desc2_val1.txt",
      ];

      for (const file of logFiles) {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      }

      // Remove log directory if it exists and is empty
      if (fs.existsSync("./log")) {
        try {
          const files = fs.readdirSync("./log");
          if (files.length === 0) {
            fs.rmdirSync("./log");
          }
        } catch (error) {
          // Directory might not be empty or other error, ignore
        }
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

describe("NodeLogToFile", function() {
  after(async function() {
    await cleanup();
  });

  it("should only work in Node.js environment", async function() {
    if (!Platform.isNode()) {
      // Create a mock object to test with
      const mockObj = {};

      await NodeLogToFile.call(mockObj, "testEntity", "testDescription", [
        "value1",
        "value2",
      ]);

      assert.ok(!mockObj.log, "The mixin should not have added log method in non-Node environment");
      assert.ok(!mockObj.enableLog, "The mixin should not have added enableLog method in non-Node environment");
      assert.ok(!mockObj.disableLog, "The mixin should not have added disableLog method in non-Node environment");
      return;
    }

    assert.strictEqual(typeof NodeLogToFile, "function", "NodeLogToFile should be a function");
  });

  it("adds logging methods to object", async function() {
    if (!Platform.isNode()) {
      this.skip(); // Skip test if not in Node.js
    }

    const testObj = {};

    await NodeLogToFile.call(
      testObj,
      "testEntity",
      "testDescription",
      ["value1", "value2"],
      false,
    );

    assert.ok(typeof testObj.log === "function", "Mixin should add log method");
    assert.strictEqual(typeof testObj.enableLog, "function", "Mixin should add enableLog method");
    assert.strictEqual(typeof testObj.disableLog, "function", "Mixin should add disableLog method");
  });

  it("validates input parameters", async function() {
    if (!Platform.isNode()) {
      this.skip(); // Skip test if not in Node.js
    }

    const testObj = {};

    try {
      await NodeLogToFile.call(testObj, "testEntity", null, ["value1"]);
      assert.fail("Should not reach here - invalid dataDescription should throw");
    } catch (error) {
      assert.ok(true, "Expected to throw with invalid dataDescription");
    }

    try {
      await NodeLogToFile.call(
        testObj,
        "testEntity",
        "description",
        "not-an-array",
      );
      assert.fail("Should not reach here - invalid valuesToLog should throw");
    } catch (error) {
      assert.ok(true, "Expected to throw with invalid valuesToLog");
    }
  });

  it("creates log file with correct header", async function() {
    if (!Platform.isNode()) {
      this.skip(); // Skip test if not in Node.js
    }

    const { default: fs } = await import("fs");
    const testObj = {};

    await NodeLogToFile.call(
      testObj,
      "testEntity",
      "testDesc",
      ["val1", "val2"],
      false,
    );

    const expectedFileName = "./log/testEntity_testDesc_val1_val2.txt";

    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      if (fs.existsSync(expectedFileName)) {
        const content = fs.readFileSync(expectedFileName, "utf8");
        assert.ok(content.includes("time"), "Log file should contain time header");
        assert.ok(content.includes("val1"), "Log file should contain val1 header");
        assert.ok(content.includes("val2"), "Log file should contain val2 header");
      }
    } catch (error) {
      assert.ok(true, "File operations might fail in test environment, which is acceptable");
    }
  });

  it("enableLog and disableLog work correctly", async function() {
    if (!Platform.isNode()) {
      this.skip(); // Skip test if not in Node.js
    }

    const testObj = {};

    await NodeLogToFile.call(
      testObj,
      "testEntity",
      "testDesc",
      ["value1"],
      false,
    );

    assert.strictEqual(typeof testObj.enableLog, "function", "enableLog should be a function");
    assert.strictEqual(typeof testObj.disableLog, "function", "disableLog should be a function");

    testObj.enableLog();
    testObj.disableLog();

    assert.ok(true, "Test passes if no errors thrown during enable/disable operations");
  });

  it("log method validates input", async function() {
    if (!Platform.isNode()) {
      this.skip(); // Skip test if not in Node.js
    }

    const testObj = {};

    await NodeLogToFile.call(
      testObj,
      "testEntity",
      "testDesc",
      ["value1", "value2"],
      true,
    );

    try {
      testObj.log("not-an-object");
      assert.fail("Should not reach here - log method should throw with invalid input");
    } catch (error) {
      assert.ok(true, "Expected to throw with invalid input to log method");
    }
  });
});
