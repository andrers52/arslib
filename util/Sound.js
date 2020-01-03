'use strict'
let Sound = {}

function isPlaying(audio) { return !audio.paused }
function rewind(audio) { audio.currentTime = 0}
function stop(audio) {
  audio.pause()
  audio.currentTime = 0
}

Sound.playSound = function(audioName, endedCallback) {
  let audio = resourceStore.retrieveResourceObject(this.audioName || audioName)
  if(isPlaying(audio)) { rewind(audio)}

  function callOnEnd() {
    endedCallback()
    audio.removeEventListener('ended', callOnEnd)
  }
  endedCallback && audio.addEventListener('ended', callOnEnd)

  audio.play()
}

Sound.playSoundLoop = function(audioName) {
  if(BEClient.config.buildType === 'dev') return //so annoying...
  let audio = resourceStore.retrieveResourceObject(audioName)
  audio.addEventListener('ended', () => {
    rewind(audio)
    audio.play()
  }, false)
  audio.play()
}

Sound.clearAllEvents = function(audioName) {
  let audio = resourceStore.retrieveResourceObject(audioName)
  stop(audio)
  let audioClone = audio.cloneNode(true)
  //substitute in resource store
  resourceStore.addLocalResource(audioName, audioClone)
}

export default Sound