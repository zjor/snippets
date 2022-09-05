const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math')

const settings = {
  dimensions: [1080, 1080],
  animate: true
};

let audio
let audioContext, sourceNode, analyzerNode, audioData
let manager

const sketch = () => {

  const bins = [3, 17, 34]

  return ({context, width, height}) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    if (!audioContext) {
      return
    }

    analyzerNode.getFloatFrequencyData(audioData)

    for (let i = 0; i < bins.length; i++) {
      const bin = bins[i]
      const mapped = math.mapRange(audioData[bin], analyzerNode.minDecibels, analyzerNode.maxDecibels, 0, 1, true)
      const radius = mapped * 200

      context.save()
      context.translate(width / 2, height / 2)
      context.lineWidth = 10
      context.beginPath()
      context.arc(0, 0, radius, 0, Math.PI * 2)
      context.stroke()

      context.restore()
    }
  };
};

const createAudio = () => {
  audio = document.createElement('audio')
  audio.src = 'audio/kokokaka-ring-the-bell-tony.mp3'

  audioContext = new AudioContext()
  sourceNode = audioContext.createMediaElementSource(audio)
  sourceNode.connect(audioContext.destination)

  analyzerNode = audioContext.createAnalyser()
  analyzerNode.fftSize = 512
  analyzerNode.smoothingTimeConstant = 0.9
  sourceNode.connect(analyzerNode)

  audioData = new Float32Array(analyzerNode.frequencyBinCount)
}

const addListeners = () => {
  window.addEventListener('mouseup', () => {
    if (!audioContext) {
      createAudio()
    }

    if (audio.paused) {
      audio.play()
      manager.play()
    } else {
      audio.pause()
      manager.pause()
    }
  })
}

addListeners()

const getAverage = () => {
  let s = 0
  audioData.forEach(d => s += d)
  s /= audioData.length
  return s
}

const start = async () => {
  manager = await canvasSketch(sketch, settings)
  manager.pause()
}

start()


