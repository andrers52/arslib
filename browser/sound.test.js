import { Platform } from "../platform.js";
import { TestRunner, expect } from "../test/test-runner.js";
import { Sound } from "./sound.js";

const runner = new TestRunner();

runner.test(
  "Sound should export an empty object in Node.js environment",
  () => {
    if (Platform.isNode()) {
      expect.toBe(
        Object.keys(Sound).length,
        0,
        "Sound should be an empty object in Node.js",
      );
    } else {
      // In a browser environment, Sound should not be empty
      // We expect at least playSound, playSoundLoop, and clearAllEvents
      expect.toBeGreaterThanOrEqual(
        Object.keys(Sound).length,
        3,
        "Sound should not be an empty object in a browser environment and should have at least 3 properties",
      );
    }
  },
);

// Further tests in a browser environment would require mocking HTMLAudioElement.
// Example:
//
// let mockAudio;
// runner.beforeEach(() => {
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
// runner.test("playSound should call audio.play() in browser", () => {
//   if (!Platform.isNode()) {
//     let playCalled = false;
//     mockAudio.play = () => { playCalled = true; };
//     Sound.playSound(mockAudio);
//     expect.toBe(playCalled, true, "audio.play was not called");
//   } else {
//     expect.toBe(true, true); // Placeholder for Node.js, or skip
//   }
// });
//
// runner.test("playSoundLoop should set up an event listener for 'ended' in browser", () => {
//   if (!Platform.isNode()) {
//     let eventListenerAdded = false;
//     mockAudio.addEventListener = (event, callback) => {
//       if (event === 'ended') {
//         eventListenerAdded = true;
//       }
//     };
//     Sound.playSoundLoop(mockAudio);
//     expect.toBe(eventListenerAdded, true, "addEventListener for 'ended' was not called");
//   } else {
//     expect.toBe(true, true); // Placeholder for Node.js, or skip
//   }
// });
//
// runner.test("clearAllEvents should call audio.pause() and reset currentTime in browser", () => {
//   if (!Platform.isNode()) {
//     let pauseCalled = false;
//     mockAudio.pause = () => { pauseCalled = true; };
//     Sound.clearAllEvents(mockAudio);
//     expect.toBe(pauseCalled, true, "audio.pause was not called by clearAllEvents");
//     expect.toBe(mockAudio.currentTime, 0, "audio.currentTime was not reset by clearAllEvents");
//   } else {
//     expect.toBe(true, true); // Placeholder for Node.js, or skip
//   }
// });

runner.run();
