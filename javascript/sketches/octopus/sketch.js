const canvasSketch = require('canvas-sketch')

const settings = {
  dimensions: [1080, 1080],
  animate: true
}

const dot = {
  x: 0,
  y: 0,
  vx: 0.1,
  vy: -0.5,
  velocity() {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy)
  }
}

const sketch = ({canvas}) => {
  dot.x = canvas.width / 2
  dot.y = canvas.height / 2
  canvas.addEventListener('mousemove', onMouseMove(canvas))

  return ({context: c, width, height}) => {
    c.fillRect(0, 0, width, height)

    c.beginPath()
    const r = 15 + dot.velocity()
    c.fillStyle = `rgb(255, ${r * 5}, ${r * 3}, 0.5)`
    c.ellipse(dot.x, dot.y, r, r, 0, 0, 2 * Math.PI)

    c.fill()
    c.stroke()

    dot.x += dot.vx
    dot.y += dot.vy

  }
}

const onMouseMove = (canvas) => {
  return (e) => {
    const x = (e.offsetX / canvas.offsetWidth) * canvas.width
    const y = (e.offsetY / canvas.offsetHeight) * canvas.height
    const k = 0.2
    dot.vx = (x - dot.x) * k
    dot.vy = (y - dot.y) * k
  }
}



canvasSketch(sketch, settings)

