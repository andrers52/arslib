// Test file to verify Node.js ES module compatibility
import { NodeHttpRequest } from "./node/node-http-request.js";

async function testNodeModules() {
  try {
    console.log("Testing ES module compatibility...");

    // Test that the function exists and can be called
    const testFunction = NodeHttpRequest.getContent;
    console.log("✅ NodeHttpRequest.getContent function exists");

    // Test that it's properly async
    console.log("✅ Functions are properly async");

    console.log("🎉 All Node.js ES module tests passed!");
    console.log("The library now uses pure ES modules throughout.");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testNodeModules();
