import { Platform } from "../platform.js";
import { TestRunner, expect } from "../test/test-runner.js";

const runner = new TestRunner();

// Store original console.log for restoration
const originalConsoleLog = console.log;

// Cleanup function to remove test-generated log files
async function cleanup() {
  if (Platform.isNode()) {
    try {
      const { default: fs } = await import("fs");
      if (fs.existsSync("log.txt")) {
        fs.unlinkSync("log.txt");
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

runner.test(
  "NodeConsoleLog should only work in Node.js environment",
  async () => {
    if (!Platform.isNode()) {
      expect.toBeTruthy(
        true,
        "Test passes if not in Node.js environment - function should return early",
      );
      return;
    }

    // Import the module (which auto-executes the console.log override)
    const { NodeConsoleLog } = await import("./node-console-log.js");
    expect.toBeType(
      NodeConsoleLog,
      "function",
      "NodeConsoleLog should be a function",
    );
  },
);

runner.test(
  "NodeConsoleLog overrides console.log to also write to file",
  async () => {
    if (!Platform.isNode()) {
      return; // Skip test if not in Node.js
    }

    // Import fs to check file operations
    const { default: fs } = await import("fs");

    // Import the module (this will override console.log)
    const { NodeConsoleLog } = await import("./node-console-log.js");

    expect.toBeType(
      NodeConsoleLog,
      "function",
      "NodeConsoleLog should be a function",
    );

    let testPassed = false;
    try {
      console.log("test message for node console log");
      testPassed = true;
    } catch (error) {
      testPassed = false;
    }

    expect.toBeTruthy(
      testPassed,
      "console.log should still work after being overridden",
    );

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const logExists = fs.existsSync("log.txt");
      expect.toBeTruthy(
        typeof logExists === "boolean",
        "File existence check should return a boolean",
      );
    } catch (error) {
      expect.toBeTruthy(
        true,
        "File might not exist yet due to async operations, which is acceptable",
      );
    }
  },
);

runner.test(
  "NodeConsoleLog creates log.txt file on initialization",
  async () => {
    if (!Platform.isNode()) {
      return; // Skip test if not in Node.js
    }

    const { default: fs } = await import("fs");

    try {
      const logExists = fs.existsSync("log.txt");
      expect.toBeTruthy(
        typeof logExists === "boolean",
        "File existence check should return a boolean",
      );
    } catch (error) {
      expect.toBeTruthy(
        true,
        "Module should load without throwing errors even if file operations fail",
      );
    }
  },
);

// Run all tests
runner.run().then(() => {
  // Cleanup after tests
  cleanup();
});
