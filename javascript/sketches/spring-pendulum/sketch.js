const canvasSketch = require('canvas-sketch')
const {PI: pi, cos, sin} = Math

const settings = {
    dimensions: [1080, 1080],
    animate: true
}

const PRIMARY_COLOR = '#1faf3f'

let origin = [540, 1080 / 3]
let l = 1.5
let r = 25
let theta = 0
let t = 0

const k = 0.1
const m = 0.1
const g = 9.81

let x = l
let dx = .0
let dTheta = .0

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
    const dDx = _x * _dth ** 2 + k / m * (_x - l) - g * cos(_th)
    const dDth = (-g * sin(_th) - 2 * _dx * _dth) / _x
    return [_dx, dDx, _dth, dDth]
    // const dDx  = 0
    // const dDth = -g * sin(_th) / l
    // return [_dx, dDx, _dth, dDth]
}

/**
 * Renders a pendulum
 * @param c {CanvasRenderingContext2D}
 */
function drawPendulum(c) {
    const scale = l / 1.5 * 1080 / 4
    const [x, y] = [
        origin[0] + scale * l * cos(theta + 1.5 * pi),
        origin[1] - scale * l * sin(theta + 1.5 * pi)
    ]
    c.strokeStyle = PRIMARY_COLOR
    c.lineWidth = 5.0
    c.beginPath()
    c.moveTo(...origin)
    c.lineTo(x, y)
    c.stroke()

    c.fillStyle = PRIMARY_COLOR
    c.beginPath()
    c.ellipse(x, y, r, r, 0, 0, 2 * pi)
    c.fill()

}

const sketch = ({canvas}) => {
    t = Date.now()
    return ({context: c, width, height}) => {
        const now = Date.now()
        const dt = (now - t) / 1000
        t = now

        const state = [x, dx, theta, dTheta]
        const next = integrateRK4(state, t, dt, derive)
        console.log(next)
        x = next[0]
        dx = next[1]
        theta = next[2]
        dTheta = next[3]

        c.fillRect(0, 0, width, height)
        drawPendulum(c)
    }
}

canvasSketch(sketch, settings)