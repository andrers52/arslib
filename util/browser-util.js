'use strict'
let BrowserUtil = {}

BrowserUtil.supportedVideoFormat = function(video) {
  // *** USAGE ***
  // *** http://answers.oreilly.com/topic/2896-how-to-display-a-video-on-html5-canvas/
  //videoElement = document.createElement("video");
  //let result = BrowserUtil.supportedVideoFormat(videoElement);
  //alert(result);

  let returnExtension = ''
  if (video.canPlayType('video/webm') === 'probably'
      || video.canPlayType('video/webm') === 'maybe') {
    returnExtension = 'webm'
  } else if (video.canPlayType('video/mp4') === 'probably'
             || video.canPlayType('video/mp4') === 'maybe') {
    returnExtension = 'mp4'
  } else if (video.canPlayType('video/ogg') === 'probably'
             || video.canPlayType('video/ogg') === 'maybe') {
    returnExtension = 'ogg'
  }

  return returnExtension
}

window.requestAnimationFrame = (function(){
  return  window.requestAnimationFrame        ||
        window.webkitRequestAnimationFrame    ||
        window.mozRequestAnimationFrame       ||
        window.oRequestAnimationFrame         ||
        window.msRequestAnimationFrame        ||
        function(/* function */ callback, /* DOMElement */ element){
          return window.setTimeout(callback, 1000 / 60)
        }
})()

window.cancelAnimationFrame = ( function() {
  return window.cancelAnimationFrame                ||
        window.webkitCancelRequestAnimationFrame    ||
        window.mozCancelRequestAnimationFrame       ||
        window.oCancelRequestAnimationFrame         ||
        window.msCancelRequestAnimationFrame        ||
        clearTimeout
} )()



BrowserUtil.fullScreen = function() {

  let doc = window.document
  let docEl = doc.documentElement

  //don't ask  if already fullscreen
  if (doc.fullscreenElement       ||
      doc.mozFullScreenElement    ||
      doc.webkitFullscreenElement ||
      doc.msFullscreenElement) { return }

  let requestFullScreen =
      docEl.requestFullscreen       ||
      docEl.mozRequestFullScreen    ||
      docEl.webkitRequestFullScreen ||
      docEl.msRequestFullscreen

  requestFullScreen.call(docEl)
}

BrowserUtil.lockOrientation = function (orientation) {
  //best effor approach
  try {
    orientation = orientation || 'landscape'

    let lockFunc =
        screen.lockOrientation    ||
        screen.mozLockOrientation ||
        screen.msLockOrientation

    return lockFunc && lockFunc(orientation)

  }
  catch (err) { return null }
}

// **** START HERE... ****

export {BrowserUtil as default}
export {BrowserUtil}