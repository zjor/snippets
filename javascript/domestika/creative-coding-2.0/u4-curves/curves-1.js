const canvasSketch = require('canvas-sketch');

class Point {
  constructor({x, y, control = false}) {
    this.x = x
    this.y = y
    this.control = control
    this.isDragging = false
    this.r = 10
  }

  draw(context) {
    context.save()
    context.translate(this.x, this.y)
    context.beginPath()
    context.arc(0, 0, this.r, 0, Math.PI * 2)
    context.fillStyle = this.control ? 'red' : 'black'
    context.fill()
    context.restore()
  }

  hasHit(x, y) {
    const dx = x - this.x
    const dy = y - this.y
    return (dx * dx + dy * dy) <= this.r * this.r
  }
}

const points = [
  new Point({x: 50, y: 50}),
  new Point({x: 100, y: 550, control: true}),
  new Point({x: 600, y: 200}),
]

let _canvas

const onMouseDown = (e) => {
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)

  const x = (e.offsetX / _canvas.offsetWidth) * _canvas.width
  const y = (e.offsetY / _canvas.offsetHeight) * _canvas.height

  points.forEach(p => p.isDragging = p.hasHit(x, y))
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
  context.stroke()
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


    context.beginPath()
    context.moveTo(points[0].x, points[0].y)
    context.quadraticCurveTo(points[1].x, points[1].y, points[2].x, points[2].y)
    context.strokeStyle = 'black'
    context.stroke()

    dashedLine(context, points[0], points[1])
    dashedLine(context, points[1], points[2])

    points.forEach(p => p.draw(context))

  };
};

canvasSketch(sketch, settings);
