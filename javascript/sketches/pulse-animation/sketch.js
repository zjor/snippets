const canvasSketch = require('canvas-sketch')

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

    const a = - getAmp(time, 0.2, 1)
    const a1 = - getAmp(time, 0.3, 1)
    const a2 = - getAmp(time, 0.4, 1)

    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, W, H)

    const points = []
    const pointsA = []
    const pointsB = []

    for (let i = 0; i < n; i++) {
      const y = 100 * Math.sin(i / n * 7/3 * Math.PI + time) +
        75 * Math.sin(i / n * 11/3 * Math.PI + time * 2) +
        35 * Math.sin(i / n * 27/5 * Math.PI + time * 3);
      points.push([xs[i], a * y])
      pointsA.push({
        x: xs[i],
        y: a1 * (25 * Math.sin(i / n * 2 * Math.PI + time) +
          15 * Math.sin(i / n * 6 * Math.PI + 2 * time))
      })
      pointsB.push({
        x: xs[i],
        y: a2 * (50 * Math.sin(i / n * 4 * Math.PI + 3 * time) +
          25 * Math.sin(i / n * 12 * Math.PI + 4 * time))
      })

    }

    ctx.beginPath()
    ctx.moveTo(points[0][0], H / 2 + points[0][1])
    for (let i = 1; i < n; i++) {
      ctx.lineTo(points[i][0], H / 2 + points[i][1])
    }
    ctx.lineWidth = 6
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(pointsA[0].x, H / 2 + pointsA[0].y)
    for (let i = 1; i < n; i++) {
      ctx.lineTo(pointsA[i].x, H / 2 + pointsA[i].y)
    }
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(pointsB[0].x, H / 2 + pointsB[0].y)
    for (let i = 1; i < n; i++) {
      ctx.lineTo(pointsB[i].x, H / 2 + pointsB[i].y)
    }
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.lineWidth = 12
    ctx.stroke()


  }
}

canvasSketch(sketch, settings)
