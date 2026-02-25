import { Platform } from "../platform.js";

export class Sound {



  /**
   * Checks if an audio element is currently playing
   * @param {HTMLAudioElement} audio - Audio element to check
   * @returns {boolean} True if audio is playing, false if paused
   */
  static isPlaying(audio: any) {
    return !audio.paused;
  }

  /**
   * Rewinds an audio element to the beginning
   * @param {HTMLAudioElement} audio - Audio element to rewind
   */
  static rewind(audio: any) {
    audio.currentTime = 0;
  }

  /**
   * Stops an audio element and rewinds it to the beginning
   * @param {HTMLAudioElement} audio - Audio element to stop
   */
  static stop(audio: any) {
    audio.pause();
    audio.currentTime = 0;
  }

  /**
   * Plays a sound, optionally calling a callback when finished
   * @param {HTMLAudioElement} audio - Audio element to play
   * @param {Function} [endedCallback] - Optional callback to call when audio finishes playing
   */
  static playSound(audio: any, endedCallback: any) {
    if (Sound.isPlaying(audio)) {
      Sound.rewind(audio);
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
  static playSoundLoop(audio: any) {
    audio.addEventListener(
      "ended",
      () => {
        Sound.rewind(audio);
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
  static clearAllEvents(audio: any) {
    Sound.stop(audio);
  };
}


