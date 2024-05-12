const canvasSketch = require('canvas-sketch')
const {Vector} = require('./geometry')
const {PI: pi, cos, sin} = Math

const settings = {
    dimensions: [1080, 1080],
    animate: true
}

const PRIMARY_COLOR = '#01DC03' // rgb(1, 220, 3)
const DARK_GREEN = '#017A02'
const BLUE = '#12B8FF'
const DARK_BLUE = '#0C88B2'

let origin = [540, 1080 / 3]
let l = 1.5
let r = 50
let theta = pi / 6
let t = 0

const k = 3.0
const m = 0.05
const g = 9.81

let x = l
let dx = .0
let dTheta = .0

let trail = []

/**
 * Fourth-order Runge-Kutta method.
 * Source: https://www.geeksforgeeks.org/runge-kutta-4th-order-method-solve-differential-equation/
 */

/*
    k1 = dydx_func(state, step, t, dt)
    k2 = dydx_func([v + d * dt / 2 for v, d in zip(state, k1)], step, t, dt)
    k3 = dydx_func([v + d * dt / 2 for v, d in zip(state, k2)], step, t, dt)
    k4 = dydx_func([v + d * dt for v, d in zip(state, k3)], step, t, dt)
    return [v + (k1_ + 2 * k2_ + 2 * k3_ + k4_) * dt / 6 for v, k1_, k2_, k3_, k4_ in zip(state, k1, k2, k3, k4)]
*/
function integrateRK4(state, t, dt, deriveFunc) {
    const k1 = deriveFunc(state, t, dt)
    const k2 = deriveFunc(state.map((v, i) => v + k1[i] * dt / 2), t, dt)
    const k3 = deriveFunc(state.map((v, i) => v + k2[i] * dt / 2), t, dt)
    const k4 = deriveFunc(state.map((v, i) => v + k3[i] * dt), t, dt)
    return state.map((v, i) =>
        v + (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) * dt / 6)
}

/**
 *
 * @param state {Array<Number>}
 * @param t {Number}
 * @param dt {Number}
 * @returns {Array<Number>}
 */
function derive(state, t, dt) {
    const [_x, _dx, _th, _dth] = state
    const dDx = _x * _dth ** 2 - k / m * (_x - l) + g * cos(_th)
    const dDth = (-g * sin(_th) - 2 * _dx * _dth) / _x
    return [_dx, dDx, _dth, dDth]
}

/**
 *
 * @param c {CanvasRenderingContext2D}
 * @param s {Vector}
 * @param e {Vector}
 */
function drawSpring(c, s, e) {
    const dir = e.minus(s).normalize()
    const norm = Vector(-dir.y, dir.x)

    c.strokeStyle = PRIMARY_COLOR
    c.lineWidth = 5.0

    const vertices = []
    const n = 15
    const a = 15 * l / x
    const [dx, dy] = [(e.x - s.x) / n, (e.y - s.y) / n]
    for (let i = 0; i < n; i++) {
        const sign = (i > 1 && i < n - 4) ? ((i % 2 == 0) ? 1 : -1) : 0
        const noise = [
            sin(i + a) * a / 4,
            cos(i + a) * a / 4,
        ]
        vertices.push(Vector(
            s.x + dx * i + sign * a * norm.x + sign * noise[0],
            s.y + dy * i + sign * a * norm.y + sign * noise[1]))
    }

    const points = []
    points.push(vertices[0])
    for (let i = 1; i < vertices.length; i++) {
        const [prev, next] = [vertices[i - 1], vertices[i]]
        points.push(Vector(
            (prev.x + next.x) / 2,
            (prev.y + next.y) / 2
        ))
        points.push(next)
    }

    c.beginPath()
    c.moveTo(points[0].x, points[0].y)

    for (let i = 1; i < points.length; i+=2) {
        c.quadraticCurveTo(
            points[i - 1].x, points[i - 1].y,
            points[i].x, points[i].y)
    }
    c.stroke()

    // c.fillStyle = BLUE
    // for (let i = 0; i < points.length; i++) {
    //     c.beginPath()
    //     c.ellipse(points[i].x, points[i].y, 5, 5, 0, 0, 2 * pi)
    //     c.fill()
    // }

}

/**
 * Renders a pendulum
 * @param c {CanvasRenderingContext2D}
 * @param frame {Number} current animation frame
 */
function drawPendulum(c, frame) {
    const scale = l / 1.5 * 1080 / 4
    const [_x, _y] = [
        origin[0] + scale * x * cos(theta + 1.5 * pi),
        origin[1] - scale * x * sin(theta + 1.5 * pi)
    ]

    drawSpring(c, Vector(...origin), Vector(_x, _y))

    if (frame % 1 == 0) {
        trail.unshift([_x, _y])
        if (trail.length > 200) {
            trail.pop()
        }
    }

    for (let i = 0; i < trail.length; i++) {
        const [tx, ty] = trail[i]
        const scale = (trail.length - i) / trail.length
        const _r = .9 * r * scale
        c.fillStyle = `rgba(1, 220, 3, ${.15 * Math.atan(scale) + 0.1})`
        c.beginPath()
        c.ellipse(tx, ty, _r, _r, 0, 0, 2 * pi)
        c.fill()
    }

    const gradient = c.createRadialGradient(_x - r / 8, _y - r / 8, r / 4, _x, _y, r)
    gradient.addColorStop(0, PRIMARY_COLOR)
    gradient.addColorStop(1, DARK_GREEN)
    c.fillStyle = gradient
    c.beginPath()
    c.ellipse(_x, _y, r, r, 0, 0, 2 * pi)
    c.fill()

}

const sketch = ({canvas}) => {
    t = Date.now()
    return ({context: c, width, height, frame}) => {
        const now = Date.now()
        const dt = (now - t) / 1000
        t = now

        const state = [x, dx, theta, dTheta]
        const next = integrateRK4(state, t, dt, derive)
        x = next[0]
        dx = next[1]
        theta = next[2]
        dTheta = next[3]

        c.fillRect(0, 0, width, height)
        // c.lineCap = "round"
        drawPendulum(c, frame)
    }
}

canvasSketch(sketch, settings)

/*
TODO:
    - spring amplitude ~ extension
    - 3 shifted ropes, different widths and shades
    - pause animation by click
    - emit "sparkles" when the velocity is close to zero
    - interactive d&d
 */