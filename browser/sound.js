"use strict";
import { Platform } from "../platform.js";

let Sound = {};

if (!Platform.isNode()) {
  /**
   * Checks if an audio element is currently playing
   * @param {HTMLAudioElement} audio - Audio element to check
   * @returns {boolean} True if audio is playing, false if paused
   */
  function isPlaying(audio) {
    return !audio.paused;
  }

  /**
   * Rewinds an audio element to the beginning
   * @param {HTMLAudioElement} audio - Audio element to rewind
   */
  function rewind(audio) {
    audio.currentTime = 0;
  }

  /**
   * Stops an audio element and rewinds it to the beginning
   * @param {HTMLAudioElement} audio - Audio element to stop
   */
  function stop(audio) {
    audio.pause();
    audio.currentTime = 0;
  }

  /**
   * Plays a sound, optionally calling a callback when finished
   * @param {HTMLAudioElement} audio - Audio element to play
   * @param {Function} [endedCallback] - Optional callback to call when audio finishes playing
   */
  Sound.playSound = function (audio, endedCallback) {
    if (isPlaying(audio)) {
      rewind(audio);
    }

    function callOnEnd() {
      endedCallback();
      audio.removeEventListener("ended", callOnEnd);
    }
    endedCallback && audio.addEventListener("ended", callOnEnd);

    audio.play();
  };

  /**
   * Plays a sound in a continuous loop
   * @param {HTMLAudioElement} audio - Audio element to play in loop
   */
  Sound.playSoundLoop = function (audio) {
    audio.addEventListener(
      "ended",
      () => {
        rewind(audio);
        audio.play();
      },
      false,
    );
    audio.play();
  };

  /**
   * Clears all events and stops an audio element
   * @param {HTMLAudioElement} audio - Audio element to clear events for
   */
  Sound.clearAllEvents = function (audio) {
    stop(audio);
  };
}

export { Sound };
