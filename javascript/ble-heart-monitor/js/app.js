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
  cy = height / 2
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

function render(time) {

  const t = time / 1000

  const bgGradient = ctx.createRadialGradient(cx, cy, heartRadius, cx, cy, 480)
  bgGradient.addColorStop(0, bgGradientStartColor)
  bgGradient.addColorStop(1, bgColor)

  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, width, height)

  const innerAmplitude = getAmp(t, 0.3, 60 / bpm)
  const outerAmplitude = getAmp(t, 0.4, 60 / bpm)

  drawCircle(cx, cy, heartRadius, 4, pinkColor, 12)
  drawCircle(cx, cy, heartRadius * 1.5 + 10 * innerAmplitude, 3, brightBlueColor)
  drawCircle(cx, cy, heartRadius * 2.5 + 20 * outerAmplitude, 2, secondaryBlueColor)

  drawText(cx, cy, '67', 60, textColor)
  drawText(cx, cy + 60, 'BPM', 60, textColor)

  ring1.draw(ctx, t)
  ring2.draw(ctx, t)
  ring3.draw(ctx, t)

  drawHeader('Polar H10+ 0xae83ff00323de')

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

function getAmp(t, tau, period) {
  t = t - Math.floor(t / period) * period
  if (t < tau) {
    return t / tau
  } else {
    return (period - t) / (period - tau)
  }
}

const PulseRing = ({radiusFunc, pointsCount, strokeStyle, lineWidth}) => {
  return {
    draw(ctx, time) {
      const points = []
      for (let i = 0; i < pointsCount; i++) {
        const r = radiusFunc(i, pointsCount, time)
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

const bpm = 67

const ring1 = PulseRing({
  radiusFunc: (i, n, time) => {
    const a = -getAmp(time, 0.4, 60 / bpm)
    return heartRadius + a * (18 * Math.sin(i / n * 6 * Math.PI - 7 * time) +
      12 * Math.sin(i / n * 12 * Math.PI + 4 * time))
  },
  pointsCount: 100,
  strokeStyle: 'rgba(240, 183, 174, 0.2)',
  lineWidth: 12
})

const ring2 = PulseRing({
  radiusFunc: (i, n, time) => {
    const a = -getAmp(time, 0.3, 60/bpm)
    return heartRadius + a * (12 * Math.sin(i / n * 14 * Math.PI + time) +
      18 * Math.sin(i / n * 18 * Math.PI - 3 * time))
  },
  pointsCount: 100,
  strokeStyle: 'rgba(240, 183, 174, 1)',
  lineWidth: 2
})

const ring3 = PulseRing({
  radiusFunc: (i, n, time) => {
    const a = -getAmp(time, 0.2, 60/bpm)
    return heartRadius + a * (31 * Math.sin(i / n * 8 * Math.PI + time) +
      21 * Math.sin(i / n * 12 * Math.PI + time * 2) +
      8 * Math.sin(i / n * 24 * Math.PI + time * 3))
  },
  pointsCount: 100,
  strokeStyle: 'rgba(240, 183, 174, 0.8)',
  lineWidth: 6
})

