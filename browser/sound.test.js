import { Platform } from "../platform.js";
import { strict as assert } from "assert";
import { Sound } from "./sound.js";

describe("Sound", () => {
  it("should export an empty object in Node.js environment", () => {
    if (Platform.isNode()) {
      assert.strictEqual(
        Object.keys(Sound).length,
        0,
        "Sound should be an empty object in Node.js"
      );
    } else {
      // In a browser environment, Sound should not be empty
      // We expect at least playSound, playSoundLoop, and clearAllEvents
      assert.ok(
        Object.keys(Sound).length >= 3,
        "Sound should not be an empty object in a browser environment and should have at least 3 properties"
      );
    }
  });

  // Further tests in a browser environment would require mocking HTMLAudioElement.
  // Example:
  //
  // let mockAudio;
  // beforeEach(() => {
  //   if (!Platform.isNode()) {
  //     mockAudio = {
  //       play: () => {}, // Use a spy from a library like Sinon.js if more detailed assertion is needed
  //       pause: () => {},
  //       addEventListener: (event, callback) => {},
  //       removeEventListener: (event, callback) => {},
  //       currentTime: 0,
  //       paused: true,
  //       // Mock other properties/methods as needed
  //     };
  //   }
  // });
  //
  // it("should call audio.play() in browser", function() {
  //   if (!Platform.isNode()) {
  //     let playCalled = false;
  //     mockAudio.play = () => { playCalled = true; };
  //     Sound.playSound(mockAudio);
  //     assert.strictEqual(playCalled, true, "audio.play was not called");
  //   } else {
  //     assert.strictEqual(true, true); // Placeholder for Node.js, or skip
  //   }
  // });
  //
  // it("should set up an event listener for 'ended' in browser", function() {
  //   if (!Platform.isNode()) {
  //     let eventListenerAdded = false;
  //     mockAudio.addEventListener = (event, callback) => {
  //       if (event === 'ended') {
  //         eventListenerAdded = true;
  //       }
  //     };
  //     Sound.playSoundLoop(mockAudio);
  //     assert.strictEqual(eventListenerAdded, true, "addEventListener for 'ended' was not called");
  //   } else {
  //     assert.strictEqual(true, true); // Placeholder for Node.js, or skip
  //   }
  // });
  //
  // it("should call audio.pause() and reset currentTime in browser", function() {
  //   if (!Platform.isNode()) {
  //     let pauseCalled = false;
  //     mockAudio.pause = () => { pauseCalled = true; };
  //     Sound.clearAllEvents(mockAudio);
  //     assert.strictEqual(pauseCalled, true, "audio.pause was not called by clearAllEvents");
  //     assert.strictEqual(mockAudio.currentTime, 0, "audio.currentTime was not reset by clearAllEvents");
  //   } else {
  //     assert.strictEqual(true, true); // Placeholder for Node.js, or skip
  //   }
  // });
});
