const canvasSketch = require('canvas-sketch')

const M_2PI = Math.PI * 2

const [W, H] = [1080, 1080]

const settings = {
  dimensions: [W, H],
  animate: true
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
          x: W / 2 + r * Math.cos(i / pointsCount * M_2PI),
          y: H / 2 + r * Math.sin(i / pointsCount * M_2PI)
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
    const a = -getAmp(time, 0.4, 60/bpm)
    return 200 + a * (18 * Math.sin(i / n * 6 * Math.PI - 7 * time) +
      12 * Math.sin(i / n * 12 * Math.PI + 4 * time))
  },
  pointsCount: 100,
  strokeStyle: 'rgba(0, 0, 0, 0.2)',
  lineWidth: 12
})

const ring2 = PulseRing({
  radiusFunc: (i, n, time) => {
    const a = -getAmp(time, 0.3, 60/bpm)
    return 200 + a * (12 * Math.sin(i / n * 14 * Math.PI + time) +
      18 * Math.sin(i / n * 18 * Math.PI - 3 * time))
  },
  pointsCount: 100,
  strokeStyle: 'rgba(0, 0, 0, 1)',
  lineWidth: 2
})

const ring3 = PulseRing({
  radiusFunc: (i, n, time) => {
    const a = -getAmp(time, 0.2, 60/bpm)
    return 200 + a * (31 * Math.sin(i / n * 8 * Math.PI + time) +
      21 * Math.sin(i / n * 12 * Math.PI + time * 2) +
      8 * Math.sin(i / n * 24 * Math.PI + time * 3))
  },
  pointsCount: 100,
  strokeStyle: 'rgba(0, 0, 0, 0.8)',
  lineWidth: 6
})


let time = Date.now()

const sketch = ({canvas}) => {
  time = Date.now() / 1000

  const xs = []
  const n = 100

  for (let i = 0; i < n; i++) {
    xs.push(i * W / n / 2 + W / 4)
  }

  return ({context: ctx}) => {
    const now = Date.now() / 1000
    time = now

    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, W, H)

    ring1.draw(ctx, time)
    ring2.draw(ctx, time)
    ring3.draw(ctx, time)

    ctx.fillStyle = '#9f0000'
    ctx.font = "normal 60px monospace"
    let m = ctx.measureText(`${bpm}`)
    ctx.fillText(`${bpm}`, W / 2 - m.width / 2, H / 2)

    m = ctx.measureText("BPM")
    ctx.fillText("BPM", W / 2 - m.width / 2, H / 2 + 60)

  }
}

canvasSketch(sketch, settings)
