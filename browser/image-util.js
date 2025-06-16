import { Platform } from "../platform.js";

var ImageUtil = {};

if (!Platform.isNode()) {
  /**
   * Creates a canvas element for image manipulation
   * @param {number} width - Canvas width in pixels
   * @param {number} height - Canvas height in pixels
   * @returns {HTMLCanvasElement} The created canvas element
   */
  //create canvas for image  manipulation
  ImageUtil.createCanvas = function (width, height) {
    let canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  };

  /**
   * Creates a pie chart canvas with specified colors and percentages
   * @param {number} width - Canvas width in pixels
   * @param {number} height - Canvas height in pixels
   * @param {Array<{color: string, percentage: number}>} colorsAndPercentages - Array of objects with color names and percentage values
   * @returns {HTMLCanvasElement} Canvas element containing the pie chart
   */
  // colorsAndPercentages -> [{color: <colorName1>, percentage: <value1>},...{color: <colorNameN>, percentage: <valueN>}]
  ImageUtil.createPieGraph = function (width, height, colorsAndPercentages) {
    let canvas = ImageUtil.createCanvas(width, height);
    let context = canvas.getContext("2d");
    let onePercentAngle = (2 * Math.PI) / 100;
    let initialAngle = 0;
    let centerx = width / 2;
    let centery = height / 2;
    for (
      let colorIndex = 0;
      colorIndex < colorsAndPercentages.length;
      colorIndex++
    ) {
      let colorAndPercentage = colorsAndPercentages[colorIndex];
      let angleToDraw = onePercentAngle * colorAndPercentage.percentage;
      let finalAngle = initialAngle + angleToDraw;
      context.beginPath();
      context.moveTo(centerx, centery);
      context.arc(
        centerx,
        centery,
        Math.min(width, height) / 2,
        initialAngle,
        finalAngle,
      );
      context.lineTo(centerx, centery);
      context.fillStyle = colorAndPercentage.color;
      context.fill();
      initialAngle = finalAngle;
    }
    return canvas;
  };

  /**
   * Creates a pie chart with evenly distributed colors (equal percentages)
   * @param {number} width - Canvas width in pixels
   * @param {number} height - Canvas height in pixels
   * @param {string[]} colors - Array of color names to use
   * @returns {HTMLCanvasElement} Canvas element containing the pie chart with equal segments
   */
  ImageUtil.createPieGraphWithEvenlyDistributedColors = function (
    width,
    height,
    colors,
  ) {
    let percentageForEachColor = 100 / colors.length;
    let colorsAndPercentages = colors.map((color) => ({
      color,
      percentage: percentageForEachColor,
    }));
    return ImageUtil.createPieGraph(width, height, colorsAndPercentages);
  };
}

export { ImageUtil };
