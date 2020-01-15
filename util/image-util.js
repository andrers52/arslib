var ImageUtil = {}
//create canvas for image  manipulation
ImageUtil.createCanvas = function(width, height) {
  let canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

// colorsAndPercentages -> [{color: <colorName1>, percentage: <value1>},...{color: <colorNameN>, percentage: <valueN>}]
ImageUtil.createPieGraph = function(width, height, colorsAndPercentages) {
  let canvas = ImageUtil.createCanvas(width, height)
  let context = canvas.getContext('2d')
  let onePercentAngle = 2 * Math.PI / 100
  let initialAngle = 0
  let centerx = width/2
  let centery = height/2
  for(let colorIndex=0;colorIndex<colorsAndPercentages.length;colorIndex++) {
    let colorAndPercentage = colorsAndPercentages[colorIndex]
    let angleToDraw = 
      onePercentAngle * colorAndPercentage.percentage
    let finalAngle = initialAngle + angleToDraw
    context.beginPath()
    context.moveTo(centerx, centery)
    context.arc(
      centerx, centery, Math.min(width, height)/2,
      initialAngle, 
      finalAngle)
    context.lineTo(centerx, centery)
    context.fillStyle = colorAndPercentage.color
    context.fill()
    initialAngle = finalAngle
  }
  return canvas
}

ImageUtil.createPieGraphWithEvenlyDistributedColors = function(width, height, colors) {
  let percentageForEachColor = 100 / colors.length
  let colorsAndPercentages = colors.map(color => ({color, percentage: percentageForEachColor}))
  return ImageUtil.createPieGraph(width, height, colorsAndPercentages)
}

export {ImageUtil as default}
export {ImageUtil}
