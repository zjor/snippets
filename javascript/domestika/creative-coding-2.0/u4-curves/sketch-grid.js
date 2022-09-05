const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random')
const math = require('canvas-sketch-util/math')
const colormap = require('colormap')

const [cols, rows] = [72, 8]

const drawCurve = (context, points, row) => {
  for (let i = 1; i < points.length; i++) {
    const start = points[i - 1]
    const end = points[i]
    const m = points[i - 1].proportion(points[i], 0.8, 5.5)

    const [shiftX, shiftY] = [i / cols * 250, row / rows * 250]

    context.beginPath()
    context.moveTo(start.x, start.y)
    context.quadraticCurveTo(m.x, m.y, end.x - shiftX, end.y - shiftY)
    context.lineWidth = points[i].lineWidth
    context.strokeStyle = points[i].color
    context.stroke()
  }
}

const settings = {
  dimensions: [1080, 1080],
  animate: true
};

const sketch = ({width, height}) => {
  const [gridWidth, gridHeight] = [width * 0.8, height * 0.8]
  const [cellWidth, cellHeight] = [gridWidth / cols, gridHeight / rows]
  const [xMargin, yMargin] = [(width - gridWidth) / 2, (height - gridHeight) / 2]

  const points = []
  const freq = 0.002
  const amp = 90

  const colors = colormap({
    colormap: 'jet',
    nshades: amp
  })

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const [x, y] = [j * cellWidth, i * cellHeight]
      const n = random.noise2D(x, y, freq, amp)
      const lineWidth = math.mapRange(n, -amp, amp, 0, 4)
      const color = colors[Math.floor(math.mapRange(n, -amp, amp, 0, amp))]
      points.push(new Point({x: x + n, y: y + n, lineWidth, color}))
    }
  }

  return ({context, width, height, frame}) => {
    context.fillStyle = 'black'
    context.fillRect(0, 0, width, height)
    context.save()
    context.translate(xMargin, yMargin)
    context.translate(cellWidth * 0.5, cellHeight * 0.5)

    points.forEach(point => {
      const n = random.noise2D(point.ix + frame * 3, point.iy, freq, amp)
      point.x = point.ix + n
      point.y = point.iy + n
    })

    for (let i = 0; i < rows; i++) {
      drawCurve(context, points.slice(i * cols, (i + 1) * cols), i)
    }
    context.restore()
  }
}

canvasSketch(sketch, settings);


class Point {
  constructor({x, y, lineWidth = 4, color}) {
    this.x = x
    this.y = y
    this.lineWidth = lineWidth
    this.color = color
    this.ix = x;
    this.iy = y;
  }

  draw(context) {
    context.save()
    context.translate(this.x, this.y)
    context.beginPath()
    context.arc(0, 0, 10, 0, Math.PI * 2)
    context.fillStyle = 'red'
    context.fill()
    context.restore()
  }

  middle(other) {
    const {x, y} = other
    return new Point({x: (this.x + x) / 2, y: (this.y + y) / 2})
  }

  proportion(other, px, py) {
    const {x, y} = other
    const [dx, dy] = [(this.x - x), (this.y - y)]
    return new Point({x: this.x + px * dx, y: this.y + py * dy})
  }
}
