const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math')
const random = require('canvas-sketch-util/random')
const colormap = require('colormap')

const settings = {
  dimensions: [1080, 1080],
  animate: true
};

let audio
let audioContext, sourceNode, analyzerNode, audioData
let manager

const fftSize = 512
const smoothingTimeConstant = 0.95

const sketch = () => {

  const bins = []
  for (let i = 0; i < fftSize / 8; i++) {
    bins.push(random.rangeFloor(1, fftSize / 2))
  }

  const colors = colormap({
    colormap: 'bone',
    nshades: bins.length
  })


  return ({context, width, height}) => {
    context.fillStyle = '#f7ecbc';
    context.fillRect(0, 0, width, height);

    if (!audioContext) {
      return
    }

    analyzerNode.getFloatFrequencyData(audioData)
    context.save()
    context.translate(width / 2, height / 2)

    for (let i = 0; i < bins.length; i++) {
      const bin = bins[i]
      const [d, mi, ma] = [audioData[bin], analyzerNode.minDecibels, analyzerNode.maxDecibels]
      const mapped = math.mapRange(d, mi, ma, 0, 1, true)
      const radius = mapped * 300

      const color = Math.floor(math.mapRange(d, mi, ma, 0, bins.length, true))
      const lineWidth = math.mapRange(d, mi, ma, 0, 15, true)

      context.lineWidth = lineWidth
      context.beginPath()
      context.arc(0, 0, radius, 0, Math.PI * 2)
      context.strokeStyle = colors[color]
      context.stroke()
    }
    context.restore()
  };
};

const createAudio = () => {
  audio = document.createElement('audio')
  audio.src = 'audio/kokokaka-ring-the-bell-tony.mp3'

  audioContext = new AudioContext()
  sourceNode = audioContext.createMediaElementSource(audio)
  sourceNode.connect(audioContext.destination)

  analyzerNode = audioContext.createAnalyser()
  analyzerNode.fftSize = fftSize
  analyzerNode.smoothingTimeConstant = smoothingTimeConstant
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


