import { Platform } from "../platform.js";
import { Util } from "../util.js";

export class CanvasUtil {




  /**
   * Transform Y to go from bottom to top
   *
   * @param {HTMLCanvasElement} canvas
   * @param {number} value
   * @returns {number}
   */
  static invertY = (canvas: any, value: any) => canvas.height - value;

  /**
   * adjust value and draw on canvas
   * @param {Object} param0
   * @param {HTMLCanvasElement} param0.canvas
   * @param {number} param0.value
   * @param {number} param0.minValue
   * @param {number} param0.maxValue
   * @param {string} param0.color
   */
  static drawValueOnCanvasLastColumn = ({
    canvas,
    value,
    minValue,
    maxValue,
    color,
  }: any) => {
    let context = canvas.getContext("2d");

    // draw point representing value on last canvas row
    context.fillStyle = color;
    context.fillRect(
      canvas.width - 1,
      CanvasUtil.invertY(
        canvas,
        Util.linearConversionWithMaxAndMin({
          fromBaseMin: minValue,
          fromBaseMax: maxValue,
          toBaseMin: 0,
          toBaseMax: canvas.height,
          valueToConvert: value,
        }),
      ),
      1,
      1,
    );
  };

  /**
   * Move whole canvas image to left, loosing first column and clearing last
   * @param {HTMLCanvasElement} canvas
   */
  static shiftLeft = (canvas: any) => {
    let context = canvas.getContext("2d");

    //copy image onto itself, one pixel to the left
    let imgData = context.getImageData(1, 0, canvas.width, canvas.height);
    context.putImageData(imgData, 0, 0);

    // clear last row
    context.clearRect(canvas.width - 1, 0, canvas.width, canvas.height);
  };
}


