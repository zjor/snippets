import {HearRateMonitor, Status} from './hrm.js'

const canvas = document.querySelector('#canvas')
const ctx = canvas.getContext('2d')
const fontJura = new FontFace('Jura-Regular', 'url(/fonts/Jura-Regular.ttf)')

let fontFamily = 'monospace'

fontJura.load().then(font => {
  document.fonts.add(font);
  fontFamily = 'Jura-Regular'
})

const M_2PI = Math.PI * 2

let [width, height] = [0, 0]
let [cx, cy] = [0, 0]

const resizeObserver = new ResizeObserver(() => {
  width = Math.round(canvas.clientWidth * devicePixelRatio)
  height = Math.round(canvas.clientHeight * devicePixelRatio)
  canvas.width = width
  canvas.height = height
  cx = width / 2
  cy = 2 * height / 5
});

resizeObserver.observe(canvas);

const bgColor = '#04070A'
const bgGradientStartColor = '#0C2C3E'
const brightBlueColor = '#91E8FB'
const primaryBlueColor = '#2DAEF7'
const secondaryBlueColor = '#023D4A'
const pinkColor = '#F0B7AE'
const textColor = '#F8F7F7'

const heartRadius = 160

let now = 0

let status = Status.ready

const hrm = HearRateMonitor({
  statusListener: (_status) => status = _status,
  pulseListener: pulse => bpm = pulse
})

function render(time) {

  let t = time / 1000
  let dt = t - now
  now = t

  if (bpm == 0 ) {
    t = 0
    dt = 0
  } else {
    if (a1.isInitialized()) {
      a1.updateBpm(bpm)
    } else {
      a1.setBpm(bpm)
    }

    if (a2.isInitialized()) {
      a2.updateBpm(bpm)
    } else {
      a2.setBpm(bpm)
    }

    if (a3.isInitialized()) {
      a3.updateBpm(bpm)
    } else {
      a3.setBpm(bpm)
    }
  }

  a1.advance(dt)
  a2.advance(dt)
  a3.advance(dt)

  const bgGradient = ctx.createRadialGradient(cx, cy, heartRadius, cx, cy, 480)
  bgGradient.addColorStop(0, bgGradientStartColor)
  bgGradient.addColorStop(1, bgColor)

  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, width, height)

  drawCircle(cx, cy, heartRadius * 1.5 - 2 * a2.getAmplitude(), 3, brightBlueColor)
  drawCircle(cx, cy, heartRadius * 2.5 - 4 * a3.getAmplitude(), 2, secondaryBlueColor)

  drawText(cx, cy, bpm, 60, textColor)
  drawText(cx, cy + 60, 'BPM', 60, textColor)

  ring1.draw(ctx, t)
  ring2.draw(ctx, t)
  ring3.draw(ctx, t)

  if (status == Status.connected) {
    drawHeader(`${hrm.getDeviceName()}`)
  } else if (status == Status.ready){
    drawText(cx, cy + heartRadius * 2, "Tap anywhere to connect", 32, textColor)
  } else if (status == Status.connecting) {
    drawText(cx, cy + heartRadius * 2, "Connecting...", 32, textColor)
  } else {
    drawText(cx, cy + heartRadius * 2, "Connection failed", 32, textColor)
    bpm = 42
    a1.setBpm(bpm)
    a2.setBpm(bpm)
    a3.setBpm(bpm)
  }
  requestAnimationFrame(render)
}

requestAnimationFrame(render)

function drawCircle(x, y, r, lineWidth, color, shadowBlur = 0) {
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.beginPath()
  ctx.ellipse(x, y, r, r, 0, 0, M_2PI)
  ctx.shadowColor = color
  ctx.shadowBlur = shadowBlur
  ctx.stroke()
  ctx.shadowBlur = 0
}

function drawText(x, y, text, size, color, center = true) {
  ctx.fillStyle = color
  ctx.font = `${size}px ${fontFamily}`
  ctx.shadowColor = color
  ctx.shadowBlur = 25
  if (center) {
    let m = ctx.measureText(text)
    ctx.fillText(text, x - m.width / 2, y)
  } else {
    ctx.fillText(text, x, y)
  }
  ctx.shadowBlur = 0
}

function drawHeader(text) {
  const padding = 43
  ctx.beginPath()
  ctx.moveTo(width, padding)
  ctx.lineTo(76, padding)
  ctx.lineTo(60, padding + 26 * 16 / 17)
  ctx.lineTo(60, padding + 42)
  ctx.lineWidth = 3
  ctx.strokeStyle = primaryBlueColor
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(50, padding)
  ctx.lineTo(50 + 17, padding)
  ctx.lineTo(50, padding + 26)
  ctx.closePath()
  ctx.fillStyle = primaryBlueColor
  ctx.fill()

  const fontSize = 48
  ctx.fillStyle = textColor
  ctx.font = `${fontSize}px ${fontFamily}`
  ctx.fillText(text, 80, padding + fontSize + 12)
}

const Amplitude = ({tau, period}) => {
  let _initialized = false
  let _tau = tau * period
  let _period = period
  let _nextPeriod = period
  let _t = 0

  return {
    getAmplitude() {
      if (_t < _tau) {
        return _t / _tau
      } else {
        return (_period - _t) / (_period - _tau)
      }
    },
    advance(dt) {
      _t += dt
      if (_t > _period) {
        _t = 0
        _period = _nextPeriod
        _tau = tau * _period
      }
    },
    isInitialized() {
      return _initialized
    },
    setBpm(bpm) {
      _period = _nextPeriod = 60 / bpm
      _initialized = true
    },
    updateBpm(bpm) {
      _nextPeriod = 60 / bpm
    }
  }
}

const PulseRing = ({radiusFunc, ampFunc, pointsCount, strokeStyle, lineWidth}) => {
  return {
    draw(ctx, time) {
      const points = []
      for (let i = 0; i < pointsCount; i++) {
        const r = radiusFunc(i, pointsCount, time, ampFunc)
        points.push({
          x: cx + r * Math.cos(i / pointsCount * M_2PI),
          y: cy + r * Math.sin(i / pointsCount * M_2PI)
        })
      }

      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < pointsCount; i++) {
        ctx.lineTo(points[i].x, points[i].y)
      }
      ctx.lineTo(points[0].x, points[0].y)
      ctx.strokeStyle = strokeStyle
      ctx.lineWidth = lineWidth
      ctx.stroke()
    }
  }
}

let bpm = 0

const a1 = Amplitude({tau: 0.2, period: 60 / bpm })
const a2 = Amplitude({tau: 0.3, period: 60 / bpm })
const a3 = Amplitude({tau: 0.4, period: 60 / bpm })

const ring1 = PulseRing({
  ampFunc: () => a1.getAmplitude(),
  radiusFunc: (i, n, time, ampFunc) => {
    const a = ampFunc()
    return heartRadius + a * (18 * Math.sin(i / n * 6 * Math.PI - 7.3 * time) +
      12 * Math.sin(i / n * 12 * Math.PI + 4.7 * time))
  },
  pointsCount: 100,
  strokeStyle: 'rgba(240, 183, 174, 0.2)',
  lineWidth: 12
})

const ring2 = PulseRing({
  ampFunc: () => a2.getAmplitude(),
  radiusFunc: (i, n, time, ampFunc) => {
    const a = ampFunc()
    return heartRadius + a * (12 * Math.sin(i / n * 14 * Math.PI + 1.2 * time) +
      18 * Math.sin(i / n * 18 * Math.PI - 3.5 * time))
  },
  pointsCount: 100,
  strokeStyle: 'rgba(240, 183, 174, 1)',
  lineWidth: 2
})

const ring3 = PulseRing({
  ampFunc: () => a3.getAmplitude(),
  radiusFunc: (i, n, time, ampFunc) => {
    const a = ampFunc()
    return heartRadius + a * (31 * Math.sin(i / n * 8 * Math.PI + 2.3 * time) +
      21 * Math.sin(i / n * 12 * Math.PI + time * 2.7) +
      8 * Math.sin(i / n * 24 * Math.PI + time * 3.3))
  },
  pointsCount: 100,
  strokeStyle: 'rgba(240, 183, 174, 0.8)',
  lineWidth: 6
})

window.addEventListener('click', () => {
  if (status == Status.ready) {
    hrm.connect().then(console.log)
  }
})
