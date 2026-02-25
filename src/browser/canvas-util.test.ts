import { TestRunner, expect } from "../test/test-runner.js";
import { Platform } from "../platform.js";
import { CanvasUtil } from "./canvas-util.js";

const runner = new TestRunner();

// CanvasUtil is only available in browser environments
if (Platform.isBrowser()) {
  runner.test("CanvasUtil.invertY inverts Y coordinate correctly", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;

    expect.toBe(CanvasUtil.invertY(canvas, 0), 100, "Y=0 should invert to canvas height");
    expect.toBe(CanvasUtil.invertY(canvas, 50), 50, "Y=50 should invert to 50");
    expect.toBe(CanvasUtil.invertY(canvas, 100), 0, "Y=100 should invert to 0");
  });

  runner.test("CanvasUtil.drawValueOnCanvasLastColumn draws correctly", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;

    expect.toDoesNotThrow(
      () => CanvasUtil.drawValueOnCanvasLastColumn({
        canvas,
        value: 50,
        minValue: 0,
        maxValue: 100,
        color: "red",
      }),
      "Should not throw when drawing value on canvas",
    );
  });

  runner.test("CanvasUtil.shiftLeft shifts canvas image left", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;

    // Draw something on the canvas first
    const context = canvas.getContext("2d");
    context.fillStyle = "red";
    context.fillRect(0, 0, 100, 100);

    expect.toDoesNotThrow(
      () => CanvasUtil.shiftLeft(canvas),
      "Should not throw when shifting canvas left",
    );
  });
} else {
  // In Node.js environment, CanvasUtil should be an empty object
  runner.test("CanvasUtil is empty object in Node.js environment", () => {
    expect.toBeType(CanvasUtil, "object", "CanvasUtil should be an object");
    expect.toBe(
      Object.keys(CanvasUtil).length,
      0,
      "CanvasUtil should have no properties in Node.js",
    );
  });
}

// Run all tests
runner.run();
