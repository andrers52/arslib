'use strict'
let Sound = {}

function isPlaying(audio) { return !audio.paused }
function rewind(audio) { audio.currentTime = 0}
function stop(audio) {
  audio.pause()
  audio.currentTime = 0
}

Sound.playSound = function(audio, endedCallback) {
  if(isPlaying(audio)) { rewind(audio)}

  function callOnEnd() {
    endedCallback()
    audio.removeEventListener('ended', callOnEnd)
  }
  endedCallback && audio.addEventListener('ended', callOnEnd)

  audio.play()
}

Sound.playSoundLoop = function(audio) {
  audio.addEventListener('ended', () => {
    rewind(audio)
    audio.play()
  }, false)
  audio.play()
}

Sound.clearAllEvents = function(audio) {
  stop(audio)
}

export {Sound as default}
export {Sound}