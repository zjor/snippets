const canvasSketch = require('canvas-sketch')

const settings = {
  dimensions: [1080, 1080],
  animate: true
}
/*
  Neon color palette
  #12B8FF, #01DC03, #FFE62D, #FD4499, #DF19FB
 */

const BLUE = '#12B8FF'
const GREEN = '#01DC03'
const YELLOW = '#FFE62D'
const ROSE = '#FD4499'
const PINK = '#DF19FB'

const PRIMARY_COLOR = 'rgb(173, 237, 253)'
const PRIMARY_COLOR_05 = 'rgba(173, 237, 253, 0.5)'

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

const getOrigin = () => Point(0, 0)

const OctopusSwarm = () => {
  const items = []

  let idSeq = 0
  const nextId = () => ++idSeq

  return {
    create(position, target, raysCount = 5, minDistance = 150, color = BLUE) {
      const instance = Octopus(
        position,
        getOrigin(), getOrigin(),
        target, raysCount, nextId(),
        minDistance, color)
      items.push(instance)
      return instance
    },
    draw(c) {
      items.forEach(item => item.draw(c))
    },
    integrate(dt) {
      items.forEach(item => item.integrate(dt))
    },
    get items() {
      return items
    }
  }
}

const swarm = OctopusSwarm()

const Octopus = (
  position,
  velocity,
  acceleration,
  target,
  raysCount = 5,
  id = 0,
  minDistance = 150,
  color = BLUE) => {
  const _id = id
  const _p = position
  const _v = velocity
  const _a = acceleration
  const _t = target

  const k = 75
  const b = 25
  const x0 = minDistance

  let connectedStars = []

  const addRepulsionInsideSwarm = () => {
    const k = 300000000.0
    for (let item of swarm.items) {
      if (_id == item.id) {
        continue
      }
      const {x: px, y: py} = item.position
      const d = _p.distance(px, py)
      const f = - 0.5 * k / d ** 2
      const sin = (py - _p.y) / d
      const cos = (px - _p.x) / d
      _a.x += f * cos
      _a.y += f * sin
    }
  }

  const _drawRays = (c) => {
    const starsWithDistances = []
    stars.forEach(({id, x, y}) => {
      starsWithDistances.push({
        id, x, y, d: _p.distance(x, y)
      })
    })

    const newStars = starsWithDistances
      .sort((a, b) => a.d - b.d)
      .slice(0, raysCount)
    const newIds = new Set(newStars.map(s => s.id))
    connectedStars = connectedStars.filter(s => newIds.has(s.id))

    const oldIds = new Set(connectedStars.map(s => s.id))
    newStars.forEach(s => {
      if (!oldIds.has(s.id)) {
        connectedStars.push({
          ...s,
          cp: Point(
            (Math.random() - 0.5) * 300 + _p.x,
            (Math.random() - 0.5) * 300 + _p.y
          )
        })
      }
    })

    c.setLineDash([])
    const alpha = 0.4
    c.lineWidth = 2.5

    connectedStars.forEach(s => {
      c.strokeStyle = color
      c.beginPath()
      c.moveTo(_p.x, _p.y)
      c.bezierCurveTo(
        s.cp.x,
        s.cp.y,
        alpha * _p.x + (1 - alpha) * s.x,
        alpha * _p.y + (1 - alpha) * s.y,
        s.x, s.y)
      c.globalAlpha = 0.5
      c.stroke()

      c.fillStyle = color
      c.beginPath()
      c.ellipse(s.x, s.y, 2, 2, 0, 0, 2 * Math.PI)
      c.globalAlpha = 1.0
      c.fill()

    })

  }

  return {
    get id() {
      return _id
    },
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

      addRepulsionInsideSwarm()

      _v.x += _a.x * dt
      _v.y += _a.y * dt

      _p.x += _v.x * dt
      _p.y += _v.y * dt
    },
    draw(c) {
      _drawRays(c)

      c.beginPath()
      const r = 15 + _v.length() / 25
      c.fillStyle = color
      c.fillOpacity = 1.0
      c.ellipse(_p.x, _p.y, r, r, 0, 0, 2 * Math.PI)
      c.fill()
    }
  }
}

const cursor = Point(0, 0)

const octopusPrime = swarm.create(
  Point(540, 540),
  cursor,
  30,
  0,
  YELLOW
)

const octoAlice = swarm.create(
  Point(800, 100),
  octopusPrime.position,
  35, 150,
  BLUE
)

const octoBob = swarm.create(
  Point(800, 800),
  octopusPrime.position,
  25, 150,
  GREEN
)

const octoCarol = swarm.create(
  Point(100, 100),
  octoAlice.position,
  25, 150,
  PINK
)

const octoDerek = swarm.create(
  Point(150, 800),
  octoBob.position,
  25, 150,
  ROSE
)


const initStars = (n = 50) => {
  for (let i = 0; i < n; i++) {
    stars.push({
      id: i,
      x: Math.random() * 1080,
      y: Math.random() * 1080,
    })
  }
}

const drawStars = (c) => {
  c.fillStyle = PRIMARY_COLOR_05
  stars.forEach(star => {
    c.beginPath()
    c.ellipse(star.x, star.y, 2, 2, 0, 0, 2 * Math.PI)
    c.fill()
  })
}

const sketch = ({canvas}) => {
  canvas.addEventListener('mousemove', onMouseMove(canvas))
  t = Date.now()

  initStars(400)

  return ({context: c, width, height}) => {
    const now = Date.now()
    const dt = (now - t) / 1000
    t = now

    c.fillRect(0, 0, width, height)

    drawStars(c)

    swarm.draw(c)

    if (!paused) {
      swarm.integrate(dt)
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

// TODO: add bezier legs
