const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math')
const random = require('canvas-sketch-util/random')
const eases = require('eases')
const colormap = require('colormap')

const settings = {
  dimensions: [1080, 1080],
  animate: true
};

let audio
let audioContext, sourceNode, analyzerNode, audioData
let manager
// const audioFilename = 'kokokaka-ring-the-bell-tony.mp3'
// const audioFilename = 'samlight_take_me_back.mp3'
const audioFilename = 'balloonplanet_adrenaline.mp3'

const fftSize = 512
const smoothingTimeConstant = 0.95

const sketch = () => {
  const numSectors = 9
  const numCircles = 6
  const lineWidths = []
  const radius = 50

  const colors = colormap({
    colormap: 'bone',
    nshades: numCircles
  })

  const bins = []
  for (let i = 0; i < numSectors * numCircles; i++) {
    const bin = (random.value() > 0.5) ? 0 : random.rangeFloor(4, 64)
    bins.push(bin)
  }

  for (let i = 0; i < numCircles; i++) {
    const lineWidth = 20 + eases.quadIn(i / (numCircles - 1)) * 150
    lineWidths.push(lineWidth)
  }

  return ({context, width, height}) => {
    context.fillStyle = '#EEEAE0';
    context.fillRect(0, 0, width, height);

    if (!audioContext) {
      return
    }

    analyzerNode.getFloatFrequencyData(audioData)

    context.save()
    context.translate(width / 2, height / 2)

    let r = radius
    for (let i = 0; i < numCircles; i++) {
      for (let j = 0; j < numSectors; j++) {
        const bin = bins[i * numSectors + j]
        if (bin == 0) {
          continue
        }
        const [d, mi, ma] = [audioData[bin], analyzerNode.minDecibels, analyzerNode.maxDecibels]
        const lineWidth = math.mapRange(d, mi, ma, 0, lineWidths[i], true)
        context.beginPath()
        const phi = 2.0 * Math.PI / numSectors
        context.arc(0, 0, r + lineWidth / 2, j * phi, (j + 1) * phi - 0.005)
        context.strokeStyle = colors[i]
        context.lineWidth = lineWidth
        context.stroke()
      }
      r += lineWidths[i]
    }
    context.restore()

  };
};

const createAudio = () => {
  audio = document.createElement('audio')
  audio.src = `audio/${audioFilename}`

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

const start = async () => {
  manager = await canvasSketch(sketch, settings)
  manager.pause()
}

start()
