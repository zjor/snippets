const canvasSketch = require('canvas-sketch')
const {PI: pi, cos, sin, sqrt} = Math
const {Vector} = require('./geometry')
const {integrateRK4} = require('./ode')

const settings = {
    dimensions: [1080, 1080],
    animate: true
}
const BLACK = '#000'
const GREEN = '#01DC03' // rgb(1, 220, 3)
const DARK_GREEN = '#017A02'
const BLUE = '#12B8FF' // rgb(18, 184, 255)
const DARK_BLUE = '#0C88B2'
const ROSE = '#FD4499'
const YELLOW = '#FFE62D'
const PINK = '#DF19FB'

let paused = true

const g = 9.81

const m1 = 0.9
const m2 = 2.0
const r = 0.4
const l = 1.25
const J = m2 * r ** 2
const b = 0.9

const th0 = pi / 6
let th = th0
let dth = .0
let phi = .0
let dphi = .0

/**
 * Renders a circle with a black and yellow quadrants
 * @param c {CanvasRenderingContext2D}
 * @param x {Number}
 * @param y {Number}
 * @param r {Number}
 * @param phi {Number}
 */
function renderCentroid(c, x, y, r, phi) {
    c.fillStyle = YELLOW

    c.beginPath()
    c.moveTo(x, y)
    c.arc(x, y, r, phi, pi / 2 + phi, false)
    c.closePath()
    c.fill()

    c.beginPath()
    c.moveTo(x, y)
    c.arc(x, y, r, pi + phi, pi + pi / 2 + phi, false)
    c.closePath()
    c.fill()

    c.fillStyle = BLACK
    c.beginPath()
    c.moveTo(x, y)
    c.arc(x, y, r, pi / 2 + phi, pi + phi, false)
    c.closePath()
    c.fill()

    c.beginPath()
    c.moveTo(x, y)
    c.arc(x, y, r, pi + pi / 2 + phi, 2 * pi + phi, false)
    c.closePath()
    c.fill()

    c.strokeStyle = YELLOW
    c.lineWidth = 1
    c.beginPath()
    c.ellipse(x, y, r, r, 0, 0, 2 * pi)
    c.stroke()
}

/**
 *
 * @param c {CanvasRenderingContext2D}
 * @param x {Number}
 * @param y {Number}
 * @param scale {Number}
 */
function renderWheel(c, x, y, scale) {
    const _r = scale * r
    c.strokeStyle = BLUE
    c.lineWidth = 6.0
    c.beginPath()
    c.ellipse(x, y, _r, _r, 0, 0, 2 * pi)
    c.stroke()

    const vs = []
    for (let i = 0; i < 4; i++) {
        vs.push([
            x + _r * cos(i * pi / 2 + phi - th0 / 2),
            y + _r * sin(i * pi / 2 + phi - th0 / 2)
        ])
    }

    c.lineWidth = 3.0
    for (let v of vs) {
        c.beginPath()
        c.moveTo(x, y)
        c.lineTo(...v)
        c.stroke()
    }

    renderCentroid(c, x, y, 20, phi - th0 / 2)

}

/**
 *
 * @param c {CanvasRenderingContext2D}
 * @param width {Number}
 * @param height {Number}
 */
function render(c, width, height) {
    const origin = [width / 2, height / 2]
    const scale = width / 4

    const [x, y] = [
        l * sin(th) * scale + origin[0],
        -l * cos(th) * scale + origin[1]
    ]

    c.strokeStyle = BLUE
    c.lineWidth = 6.0
    c.beginPath()
    c.moveTo(...origin)
    c.lineTo(x, y)
    c.stroke()

    c.strokeStyle = BLUE
    c.lineWidth = 4.0
    c.beginPath()
    c.moveTo(origin[0] - scale, origin[1])
    c.lineTo(origin[0] + scale, origin[1])
    c.stroke()

    renderCentroid(c, ...origin, 20, th)

    renderWheel(c, x, y, scale)
}

/**
 *
 * @param state {Array<Number>}
 * @param t {Number}
 * @param dt {Number}
 * @returns {Array<Number>}
 */
function derive(state, t, dt) {
    const [_th, _dth, _phi, _dphi] = state
    const friction = -b * (_dphi - _dth)
    ddth = (-friction - (0.5 * m1 + m2) * l * g * sin(-_th)) / (m1 * l ** 2 / 3 + m2 * l ** 2 + J)
    ddphi = friction / J
    return [_dth, ddth, _dphi, ddphi]
}

/**
 *
 * @param t {Number}
 * @param dt {Number}
 */
function integrate(t, dt) {
    const state = [th, dth, phi, dphi]
    const next = integrateRK4(state, t, dt, derive)
    if (next) {
        [th, dth, phi, dphi] = next
    }
}

const sketch = ({canvas}) => {
    t = Date.now()
    return ({context: c, width, height}) => {
        const now = Date.now()
        const dt = (now - t) / 1000
        t = now

        c.fillStyle = '#000'
        c.fillRect(0, 0, width, height)

        render(c, width, height)

        if (!paused) {
            integrate(t, dt)
        }
    }
}


canvasSketch(sketch, settings)

window.addEventListener('click', _ => paused = !paused)