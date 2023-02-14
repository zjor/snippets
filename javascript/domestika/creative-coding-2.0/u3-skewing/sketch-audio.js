const canvasSketch = require('canvas-sketch')
const math = require('canvas-sketch-util/math')
const random = require('canvas-sketch-util/random')
const risoColors = require('riso-colors')
const Rect = require('./utils/rect')
const AudioUtils = require('./utils/audio')

const log = console.log

let audio, audioContext, analyzerNode, audioData
let manager

// audio source
const bucketName = 'audio-c0253ca5'
const songs = [
  'clear-sky-hartzmann-main-version-02-20-18592.mp3',
  'mornings-swoop-main-version-02-03-12897.mp3',
  'summer-bumble-paul-yudin-main-version-18169-02-16.mp3',
  'that-groove-soundroll-main-version-4342-03-04.mp3',
  'trendsetter-mood-maze-main-version-02-53-1004.mp3'
]

const audioFilename = songs[0]

const initAudio = () => {
  const audioSrc = `https://${bucketName}.s3.filebase.com/${audioFilename}`

  const {
    audio: _audio,
    audioContext: _audioContext,
    analyzerNode: _analyzerNode,
    audioData: _audioData
  } = AudioUtils.createAudio(audioSrc)

  audio = _audio
  audioContext = _audioContext
  analyzerNode = _analyzerNode
  audioData = _audioData
}

const addListeners = () => {
  window.addEventListener('mouseup', () => {
    if (!audioContext) {
      initAudio()
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

const hexToRgba = (hex, alpha = 1) => {
  hex = hex.toUpperCase();

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const withContext = (context, func) => {
  context.save()
  func(context)
  context.restore()
}

const getPolygonPoints = ({x, y, r, sides = 3}) => {
  const points = []
  for (let i = 0; i < sides; i++) {
    const angle = 2 * i * Math.PI / sides - Math.PI / 2
    const [_x, _y] = [r * Math.cos(angle), r * Math.sin(angle)]
    points.push({x: x + _x, y: y + _y})
  }
  return points
}

const drawPolygon = ({context, x, y, r, sides = 3}) => {
  context.beginPath()
  let points = getPolygonPoints({x, y, r, sides})

  context.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < sides; i++) {
    const {x, y} = points[i]
    context.lineTo(x, y)
  }
  context.closePath()
  context.stroke()
}

const drawStencil = ({g, x, y, r, sides, width, height, fillStyle}) => {
  g.beginPath();

  //outer shape, clockwise
  g.moveTo(0, 0);
  g.lineTo(width, 0);
  g.lineTo(width, height);
  g.lineTo(0, height);
  g.closePath();

  // inner shape (hole), counter-clockwise
  const points = getPolygonPoints({x, y, r, sides}).reverse()
  const {x: x0, y: y0} = points[0]
  g.moveTo(x0, y0)
  points.slice(1).forEach(({x, y}) => g.lineTo(x, y))
  g.closePath()

  g.fillStyle = fillStyle
  g.fill()
}

const settings = {
  dimensions: [1080, 1080],
  animate: true
};

const getRectScale = (bin) => {
  if (bin === -1) {
    return 1.0
  }

  const [d, mi, ma] = [audioData[bin], analyzerNode.minDecibels, analyzerNode.maxDecibels]
  return math.mapRange(d, mi, ma, 0.3, 1.6, true)
}

const sketch = ({width, height}) => {

  random.setSeed(561)

  const bgColor = '#efefef' //random.pick(risoColors).hex

  const rectColors = [
    random.pick(risoColors).hex,
    random.pick(risoColors).hex,
    random.pick(risoColors).hex,
  ]

  const mask = {
    x: width * 0.5,
    y: height * 0.58,
    r: 500,
    sides: 3,
    lineWidth: 20
  }

  const rects = []
  for (let i = 0; i < 15; i++) {
    const bin = (random.value() > 0.4) ? random.rangeFloor(1, AudioUtils.DEFAULT_FFT_SIZE / 2) : -1
    const colors = (bin === -1) ? ['#ffffff'] : ['#ff0000']
    const params = Rect.generateParams(width, height, colors)
    rects.push(new Rect({...params, skewness: -15, freqBin: bin}))
  }

  return ({context: g, width, height}) => {

    if (!audioContext) {
      g.font = "48px Comic Sans MS"
      g.textAlign = "center"
      g.fillText("Tap anywhere to start", width / 2, height / 2)
      return
    }

    analyzerNode.getFloatFrequencyData(audioData)

    const {x, y, r, sides, lineWidth} = mask

    g.fillStyle = bgColor;
    g.fillRect(0, 0, width, height);
    g.save()
    drawPolygon({context: g, x, y, r, sides})
    g.lineWidth = 20

    rects.forEach((rect, index) => {
      rect.draw(g, getRectScale(rect.freqBin))
      rect.advance()
      if (rect.hasEscaped(width)) {
        rect.regenerate()
      }
    })

    g.restore()

    withContext(g, g => {
      g.globalCompositeOperation = 'color-burn'
      g.strokeStyle = rectColors[0]
      g.lineWidth = lineWidth

      drawPolygon({context: g, x, y, r: r - lineWidth, sides})
    })

    withContext(g, g => {
      g.strokeStyle = 'black'
      drawPolygon({context: g, x, y, r, sides})
      g.globalCompositeOperation = 'source-over'
    })

    drawStencil({g, x, y, r, sides, width, height, fillStyle: hexToRgba(bgColor, 0.8)})

  };
};

addListeners()

const start = async () => {
  manager = await canvasSketch(sketch, settings)
  manager.pause()
}

start()
