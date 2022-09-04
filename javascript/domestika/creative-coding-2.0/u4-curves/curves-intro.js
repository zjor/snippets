const canvasSketch = require('canvas-sketch');

class Point {
  constructor({x, y}) {
    this.x = x
    this.y = y
    this.isDragging = false
    this.r = 10
  }

  draw(context) {
    context.save()
    context.translate(this.x, this.y)
    context.beginPath()
    context.arc(0, 0, this.r, 0, Math.PI * 2)
    context.fillStyle = 'black'
    context.fill()
    context.restore()
  }

  hasHit(x, y) {
    const dx = x - this.x
    const dy = y - this.y
    return (dx * dx + dy * dy) <= this.r * this.r
  }

  middle(other) {
    const {x, y} = other
    return new Point({x: (this.x + x) / 2, y: (this.y + y) / 2})
  }
}

const points = [
  new Point({x: 50, y: 50}),
  new Point({x: 100, y: 550}),
  new Point({x: 600, y: 200}),
  new Point({x: 350, y: 150}),
  new Point({x: 200, y: 700}),
]

let _canvas

const onMouseDown = (e) => {
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)

  const x = (e.offsetX / _canvas.offsetWidth) * _canvas.width
  const y = (e.offsetY / _canvas.offsetHeight) * _canvas.height

  let hasHit = false

  points.forEach(p => {
    p.isDragging = p.hasHit(x, y)
    hasHit = hasHit || p.isDragging
  })

  if (!hasHit) {
    points.push(new Point({x, y}))
  }
}

const onMouseMove = (e) => {
  const x = (e.offsetX / _canvas.offsetWidth) * _canvas.width
  const y = (e.offsetY / _canvas.offsetHeight) * _canvas.height

  points.forEach(p => {
    if (p.isDragging) {
      p.x = x
      p.y = y
    }
  })
}

const onMouseUp = (e) => {
  _canvas.removeEventListener('mousemove', onMouseMove)
  _canvas.removeEventListener('mouseup', onMouseUp)
  points.forEach(p => p.isDragging = false)
}

const dashedLine = (context, start, end) => {
  context.beginPath()
  context.moveTo(start.x, start.y)
  context.lineTo(end.x, end.y)
  context.setLineDash([5, 5])
  context.lineWidth = 1.0
  context.strokeStyle = 'grey'
  context.stroke()
  context.setLineDash([])
}

const settings = {
  dimensions: [1080, 1080],
  animate: true
};

const sketch = ({canvas}) => {
  _canvas = canvas
  canvas.addEventListener('mousedown', onMouseDown)

  return ({context, width, height}) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    for (let i = 1; i < points.length; i++) {
      const m = points[i - 1].middle(points[i])
      context.beginPath()
      context.arc(m.x, m.y, 5, 0, Math.PI * 2)
      context.fillStyle = 'black'
      context.fill()
    }

    for (let i = 1; i < points.length - 1; i++) {
      const start = points[i - 1].middle(points[i])
      const end = points[i].middle(points[i + 1])

      dashedLine(context, points[i - 1], points[i])
      dashedLine(context, points[i], points[i + 1])

      context.beginPath()
      context.moveTo(start.x, start.y)
      context.quadraticCurveTo(points[i].x, points[i].y, end.x, end.y)
      context.lineWidth = 3.0
      context.strokeStyle = 'blue'
      context.stroke()
    }

    points.forEach(p => p.draw(context))

  };
};

canvasSketch(sketch, settings);
