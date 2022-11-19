const DEFAULT_FFT_SIZE = 512

const createAudio = (audioSrc,
                     fftSize = DEFAULT_FFT_SIZE,
                     smoothingTimeConstant = 0.95) => {
  const audio = document.createElement('audio')
  audio.crossOrigin = 'anonymous'
  audio.src = audioSrc

  const audioContext = new AudioContext()
  const sourceNode = audioContext.createMediaElementSource(audio)
  sourceNode.connect(audioContext.destination)

  const analyzerNode = audioContext.createAnalyser()
  analyzerNode.fftSize = fftSize
  analyzerNode.smoothingTimeConstant = smoothingTimeConstant
  sourceNode.connect(analyzerNode)

  const audioData = new Float32Array(analyzerNode.frequencyBinCount)

  return {
    audio, audioContext, sourceNode, analyzerNode, audioData
  }
}

module.exports = {
  DEFAULT_FFT_SIZE,
  createAudio
}
