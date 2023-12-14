const canvasSketch = require('canvas-sketch')

const settings = {
  dimensions: [1080, 1080],
  animate: true
}

const PRIMARY_COLOR = '#adedfd'

let paused = true
let t = 0

const stars = []

const Point = (x, y) => {
  let _x = x
  let _y = y

  const _distance = (x, y) => {
    return Math.sqrt((x - _x) ** 2 + (y - _y) ** 2)
  }
  return {
    get x() {
      return _x
    },
    set x(v) {
      _x = v
    },
    get y() {
      return _y
    },
    set y(v) {
      _y = v
    },
    distance: _distance,
    length: () => _distance(0, 0)
  }
}

const Octopus = (position, velocity, acceleration, target, raysCount = 5) => {
  const _p = position
  const _v = velocity
  const _a = acceleration
  const _t = target

  const k = 75
  const b = 25
  const x0 = 150

  const _drawRays = (c) => {
    const starsWithDistances = []
    stars.forEach(({x, y}) => {
      starsWithDistances.push({
        x, y, d: _p.distance(x, y)
      })
    })
    c.setLineDash([])
    starsWithDistances
      .sort((a, b) => a.d - b.d)
      .slice(0, raysCount)
      .forEach(({x, y}) => {
        c.beginPath()
        c.moveTo(_p.x, _p.y)
        c.lineTo(x, y)
        c.strokeStyle = PRIMARY_COLOR
        c.stroke()
      })
  }

  return {
    get position() {
      return _p
    },
    integrate(dt) {
      const d = _p.distance(_t.x, _t.y)
      const f = k * (d - x0)
      const sin = (_t.y - _p.y) / d
      const cos = (_t.x - _p.x) / d
      _a.x = f * cos - b * _v.x
      _a.y = f * sin - b * _v.y

      _v.x += _a.x * dt
      _v.y += _a.y * dt

      _p.x += _v.x * dt
      _p.y += _v.y * dt
    },
    draw(c) {
      _drawRays(c)

      c.beginPath()
      const r = 25
      c.fillStyle = `rgb(${r * 5}, 255, ${r * 3})`
      c.ellipse(_p.x, _p.y, r, r, 0, 0, 2 * Math.PI)
      c.fill()
    }
  }
}

const cursor = Point(0, 0)

const dot = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  ax: 0,
  ay: 0,
  distance(x, y) {
    return Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2)
  },
  velocity() {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy)
  },
  integrate(dt) {
    const k = 75
    const b = 25
    const x0 = 150
    const d = this.distance(cursor.x, cursor.y)
    const f = k * (d - x0)
    const sin = (cursor.y - this.y) / d
    const cos = (cursor.x - this.x) / d
    this.ax = f * cos - b * this.vx
    this.ay = f * sin - b * this.vy

    this.vx += this.ax * dt
    this.vy += this.ay * dt

    this.x += this.vx * dt
    this.y += this.vy * dt
  }
}

const octo = Octopus(
  Point(800, 100),
  Point(0, 0),
  Point(0, 0),
  {
    get x() {
      return dot.x
    },
    get y() {
      return dot.y
    }
  },
  20
)

const initStars = (n = 50) => {
  for (let i = 0; i < n; i++) {
    stars.push({
      x: Math.random() * 1080,
      y: Math.random() * 1080,
    })
  }
}

const drawStars = (c) => {
  c.fillStyle = PRIMARY_COLOR
  stars.forEach(star => {
    c.beginPath()
    c.ellipse(star.x, star.y, 3, 3, 0, 0, 2 * Math.PI)
    c.fill()
  })
}

const drawRays = (c, n = 5) => {
  const starsWithDistances = []
  stars.forEach(({x, y}) => {
    starsWithDistances.push({
      x, y, d: dot.distance(x, y)
    })
  })
  c.setLineDash([])
  starsWithDistances
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .forEach(({x, y}) => {
      c.beginPath()
      c.moveTo(dot.x, dot.y)
      c.lineTo(x, y)
      c.strokeStyle = PRIMARY_COLOR
      c.stroke()
    })
}

const drawDot = (c) => {
  c.beginPath()
  const r = 25
  c.fillStyle = `rgb(255, ${r * 5}, ${r * 3})`
  c.ellipse(dot.x, dot.y, r, r, 0, 0, 2 * Math.PI)

  c.fill()
}

const sketch = ({canvas}) => {
  dot.x = canvas.width / 2
  dot.y = canvas.height / 2
  canvas.addEventListener('mousemove', onMouseMove(canvas))
  t = Date.now()

  initStars(100)

  return ({context: c, width, height}) => {
    const now = Date.now()
    const dt = (now - t) / 1000
    t = now

    c.fillRect(0, 0, width, height)

    c.beginPath()
    c.moveTo(cursor.x, cursor.y)
    c.lineTo(dot.x, dot.y)
    c.strokeStyle = PRIMARY_COLOR
    c.lineWidth = 2
    c.setLineDash([15, 15])
    c.stroke()

    drawStars(c)
    drawRays(c, 7)

    drawDot(c)

    octo.draw(c)

    if (!paused) {
      dot.integrate(dt)
      octo.integrate(dt)
    }

  }
}

const onMouseMove = (canvas) => {
  return (e) => {
    const x = (e.offsetX / canvas.offsetWidth) * canvas.width
    const y = (e.offsetY / canvas.offsetHeight) * canvas.height
    cursor.x = x
    cursor.y = y
  }
}

canvasSketch(sketch, settings)

window.addEventListener('keydown', e => {
  if (e.key == 'p') {
    paused = !paused
  }
})

window.addEventListener('click', _ => paused = !paused)

// TODO: remove old Dot => replace with another instance
// TODO: add bezier legs
// TODO: add "body direction"
// TODO: change body size ~ velocity
