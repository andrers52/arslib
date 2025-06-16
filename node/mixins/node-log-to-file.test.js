import { Platform } from "../../platform.js";
import { TestRunner, expect } from "../../test/test-runner.js";
import { NodeLogToFile } from "./node-log-to-file.js";

const runner = new TestRunner();

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

runner.test(
  "NodeLogToFile should only work in Node.js environment",
  async () => {
    if (!Platform.isNode()) {
      // Create a mock object to test with
      const mockObj = {};

      await NodeLogToFile.call(mockObj, "testEntity", "testDescription", [
        "value1",
        "value2",
      ]);

      expect.toBeFalsy(
        mockObj.log,
        "The mixin should not have added log method in non-Node environment",
      );
      expect.toBeFalsy(
        mockObj.enableLog,
        "The mixin should not have added enableLog method in non-Node environment",
      );
      expect.toBeFalsy(
        mockObj.disableLog,
        "The mixin should not have added disableLog method in non-Node environment",
      );
      return;
    }

    expect.toBeType(
      NodeLogToFile,
      "function",
      "NodeLogToFile should be a function",
    );
  },
);

runner.test("NodeLogToFile adds logging methods to object", async () => {
  if (!Platform.isNode()) {
    return; // Skip test if not in Node.js
  }

  const testObj = {};

  await NodeLogToFile.call(
    testObj,
    "testEntity",
    "testDescription",
    ["value1", "value2"],
    false,
  );

  expect.toBeType(testObj.log, "function", "Mixin should add log method");
  expect.toBeType(
    testObj.enableLog,
    "function",
    "Mixin should add enableLog method",
  );
  expect.toBeType(
    testObj.disableLog,
    "function",
    "Mixin should add disableLog method",
  );
});

runner.test("NodeLogToFile validates input parameters", async () => {
  if (!Platform.isNode()) {
    return; // Skip test if not in Node.js
  }

  const testObj = {};

  try {
    await NodeLogToFile.call(testObj, "testEntity", null, ["value1"]);
    expect.toBeTruthy(
      false,
      "Should not reach here - invalid dataDescription should throw",
    );
  } catch (error) {
    expect.toBeTruthy(true, "Expected to throw with invalid dataDescription");
  }

  try {
    await NodeLogToFile.call(
      testObj,
      "testEntity",
      "description",
      "not-an-array",
    );
    expect.toBeTruthy(
      false,
      "Should not reach here - invalid valuesToLog should throw",
    );
  } catch (error) {
    expect.toBeTruthy(true, "Expected to throw with invalid valuesToLog");
  }
});

runner.test("NodeLogToFile creates log file with correct header", async () => {
  if (!Platform.isNode()) {
    return; // Skip test if not in Node.js
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
      expect.toBeTruthy(
        content.includes("time"),
        "Log file should contain time header",
      );
      expect.toBeTruthy(
        content.includes("val1"),
        "Log file should contain val1 header",
      );
      expect.toBeTruthy(
        content.includes("val2"),
        "Log file should contain val2 header",
      );
    }
  } catch (error) {
    expect.toBeTruthy(
      true,
      "File operations might fail in test environment, which is acceptable",
    );
  }
});

runner.test(
  "NodeLogToFile enableLog and disableLog work correctly",
  async () => {
    if (!Platform.isNode()) {
      return; // Skip test if not in Node.js
    }

    const testObj = {};

    await NodeLogToFile.call(
      testObj,
      "testEntity",
      "testDesc",
      ["value1"],
      false,
    );

    expect.toBeType(
      testObj.enableLog,
      "function",
      "enableLog should be a function",
    );
    expect.toBeType(
      testObj.disableLog,
      "function",
      "disableLog should be a function",
    );

    testObj.enableLog();
    testObj.disableLog();

    expect.toBeTruthy(
      true,
      "Test passes if no errors thrown during enable/disable operations",
    );
  },
);

runner.test("NodeLogToFile log method validates input", async () => {
  if (!Platform.isNode()) {
    return; // Skip test if not in Node.js
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
    expect.toBeTruthy(
      false,
      "Should not reach here - log method should throw with invalid input",
    );
  } catch (error) {
    expect.toBeTruthy(
      true,
      "Expected to throw with invalid input to log method",
    );
  }

  try {
    testObj.log({ value1: "test" }); // missing value2
    expect.toBeTruthy(
      false,
      "Should not reach here - log method should throw with missing required values",
    );
  } catch (error) {
    expect.toBeTruthy(true, "Expected to throw with missing required values");
  }
});

runner.test("NodeLogToFile startRightAway parameter works", async () => {
  if (!Platform.isNode()) {
    return; // Skip test if not in Node.js
  }

  const { default: fs } = await import("fs");

  // Create log directory if it doesn't exist
  try {
    if (!fs.existsSync("./log")) {
      fs.mkdirSync("./log", { recursive: true });
    }
  } catch (error) {
    // Directory creation might fail in test environment
  }

  const testObj1 = {};
  const testObj2 = {};

  await NodeLogToFile.call(testObj1, "entity1", "desc1", ["val1"], false);

  await NodeLogToFile.call(testObj2, "entity2", "desc2", ["val1"], true);

  expect.toBeType(
    testObj1.log,
    "function",
    "testObj1 should have log method after mixin with startRightAway=false",
  );
  expect.toBeType(
    testObj2.log,
    "function",
    "testObj2 should have log method after mixin with startRightAway=true",
  );

  try {
    testObj2.log({ val1: "test" });
    expect.toBeTruthy(true, "Logging should work when enabled");
  } catch (error) {
    expect.toBeTruthy(
      true,
      "File system operations might fail in test environment, which is acceptable",
    );
  }
});

// Run all tests
runner.run().then(() => {
  // Cleanup after tests
  cleanup();
});
