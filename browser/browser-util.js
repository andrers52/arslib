"use strict";
let BrowserUtil = {};

const setupBrowserUtil = () => {
  const windowRef =
    typeof globalThis === "undefined" ? undefined : globalThis.window;
  if (!windowRef || typeof windowRef.document === "undefined") {
    return;
  }
  /**
   * Determines the best supported video format for a given video element
   * @param {HTMLVideoElement} video - The video element to test format support
   * @returns {string} The supported video format extension ('webm', 'mp4', 'ogg', or empty string if none supported)
   * @example
   * // videoElement = document.createElement("video");
   * // let result = BrowserUtil.supportedVideoFormat(videoElement);
   * // alert(result);
   */
  BrowserUtil.supportedVideoFormat = function (video) {
    // *** USAGE ***
    // *** http://answers.oreilly.com/topic/2896-how-to-display-a-video-on-html5-canvas/
    //videoElement = document.createElement("video");
    //let result = BrowserUtil.supportedVideoFormat(videoElement);
    //alert(result);

    let returnExtension = "";
    if (
      video.canPlayType("video/webm") === "probably" ||
      video.canPlayType("video/webm") === "maybe"
    ) {
      returnExtension = "webm";
    } else if (
      video.canPlayType("video/mp4") === "probably" ||
      video.canPlayType("video/mp4") === "maybe"
    ) {
      returnExtension = "mp4";
    } else if (
      video.canPlayType("video/ogg") === "probably" ||
      video.canPlayType("video/ogg") === "maybe"
    ) {
      returnExtension = "ogg";
    }

    return returnExtension;
  };

  windowRef.requestAnimationFrame = (function () {
    return (
      windowRef.requestAnimationFrame ||
      windowRef.webkitRequestAnimationFrame ||
      windowRef.mozRequestAnimationFrame ||
      windowRef.oRequestAnimationFrame ||
      windowRef.msRequestAnimationFrame ||
      function (/* function */ callback, /* DOMElement */ element) {
        return windowRef.setTimeout(callback, 1000 / 60);
      }
    );
  })();

  windowRef.cancelAnimationFrame = (function () {
    return (
      windowRef.cancelAnimationFrame ||
      windowRef.webkitCancelRequestAnimationFrame ||
      windowRef.mozCancelRequestAnimationFrame ||
      windowRef.oCancelRequestAnimationFrame ||
      windowRef.msCancelRequestAnimationFrame ||
      clearTimeout
    );
  })();

  /**
   * Requests fullscreen mode for the document
   * Does nothing if already in fullscreen mode
   */
  BrowserUtil.fullScreen = function () {
    let doc = windowRef.document;
    let docEl = doc.documentElement;

    //don't ask  if already fullscreen
    if (
      doc.fullscreenElement ||
      doc.mozFullScreenElement ||
      doc.webkitFullscreenElement ||
      doc.msFullscreenElement
    ) {
      return;
    }

    let requestFullScreen =
      docEl.requestFullscreen ||
      docEl.mozRequestFullScreen ||
      docEl.webkitRequestFullScreen ||
      docEl.msRequestFullscreen;

    requestFullScreen.call(docEl);
  };

  /**
   * Attempts to lock the screen orientation (best effort approach)
   * @param {string} orientation - Desired orientation ('landscape', 'portrait', etc.)
   * @returns {boolean|null} True if successful, false if failed, null if not supported or error occurred
   */
  BrowserUtil.lockOrientation = function (orientation) {
    //best effor approach
    try {
      orientation = orientation || "landscape";

      const screenRef = windowRef.screen;
      let lockFunc =
        screenRef?.lockOrientation ||
        screenRef?.mozLockOrientation ||
        screenRef?.msLockOrientation;

      return lockFunc && lockFunc(orientation);
    } catch (err) {
      return null;
    }
  };

  /**
   * Triggers a download of text content as a file
   * @param {string} filename - Name for the downloaded file
   * @param {string} text - Text content to download
   */
  BrowserUtil.download = (filename, text) => {
    var pom = windowRef.document.createElement("a");
    pom.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text),
    );
    pom.setAttribute("download", filename);

    if (windowRef.document.createEvent) {
      var event = windowRef.document.createEvent("MouseEvents");
      event.initEvent("click", true, true);
      pom.dispatchEvent(event);
    } else {
      pom.click();
    }
  };
};

setupBrowserUtil();

export { BrowserUtil };
