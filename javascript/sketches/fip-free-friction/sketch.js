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
const ORANGE = '#FFA500' // rgb(255, 165, 0)
const YELLOW = '#FFE62D'
const PINK = '#DF19FB'

let paused = true

const g = 9.81

const m1 = 0.9
const m2 = 3.0
const r = 0.6
const l = 1.25
const J = m2 * r ** 2
const b = 1.5

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
 * @param l {Number}
 * @param angle {Number}
 */
function renderPendulumBody(c, l, angle) {
    const r1 = 50
    const r2 = 60
    const r = 1.3 * l

    const x = l / 2 + (r1 - r2) * (r1 + r2 + 2 * r) / (2 * l)
    const y = sqrt((r1 + r) ** 2 - x ** 2)

    const a = Math.atan(y / x)
    const b = Math.atan(y / (l - x))

    c.strokeStyle = BLUE
    c.lineWidth = 4

    c.save()
    c.rotate(angle)

    c.beginPath()
    c.ellipse(0, 0, r1, r1, 0, a, -a)
    c.arc(x, -y, r, pi - a, b, true)
    c.ellipse(l, 0, r2, r2, 0, b - pi, pi - b)
    c.arc(x, y, r, -b, a - pi, true)
    c.fillStyle = BLACK
    c.fill()
    c.stroke()

    c.beginPath()
    c.ellipse(0, 0, r1 * 0.7, r1 * 0.7, 0, 0, 2 * pi)
    c.lineWidth = 2.0
    c.stroke()

    c.restore()
}

/**
 *
 * @param c {CanvasRenderingContext2D}
 * @param x {Number}
 * @param y {Number}
 */
function renderWheel(c, x, y) {
    c.save()
    c.translate(x, y)
    c.rotate(phi - th0 / 2)

    const path = new Path2D()
    const outerRadius = 180
    path.ellipse(0, 0, outerRadius, outerRadius, 0, 0, 2 * pi, true)
    const piePath = getPiePath()
    path.addPath(piePath)
    path.addPath(piePath, (new DOMMatrix()).rotate(90))
    path.addPath(piePath, (new DOMMatrix()).rotate(180))
    path.addPath(piePath, (new DOMMatrix()).rotate(270))

    c.fillStyle = BLACK
    c.fill(path, 'nonzero')
    c.strokeStyle = GREEN
    c.lineWidth = 4.0
    c.stroke(path)

    c.restore()

    renderCentroid(c, x, y, 20, -th0 / 2)

}

/**
 *
 * @param c {CanvasRenderingContext2D}
 * @param scale {Number}
 */
function renderBase(c, scale) {
    const d = 140
    const corner = 30
    c.strokeStyle = PINK
    c.lineWidth = 4.0

    const path = new Path2D()
    path.moveTo(-d / 2, d / 2)
    path.lineTo(-d / 2, -d / 2 + corner)
    path.lineTo(-d / 2 + corner, -d / 2)
    path.lineTo(d / 2 - corner, -d / 2)
    path.lineTo(d / 2, -d / 2 + corner)
    path.lineTo(d / 2, d / 2)
    path.closePath()
    c.stroke(path)

    c.beginPath()
    c.moveTo(-scale, d / 2)
    c.lineTo(scale, d / 2)
    c.stroke()
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
    const L = l * scale

    const [x, y] = [
        L * sin(th),
        -L * cos(th)
    ]

    c.save()
    c.translate(...origin)

    renderBase(c, scale)
    renderPendulumBody(c, L, th - pi / 2)
    renderCentroid(c, 0, 0, 20, th)
    renderWheel(c, x, y)

    c.restore()
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

/**
 * Draws pie A
 * @return {Path2D}
 */
function getPiePath() {
    const path = new Path2D();

    path.moveTo(-10, 45.8257569)
    path.lineTo(-10, 136.7479433)

    path.arc(-30, 136.747943311, 20, 0, 1.7867568)
    path.arc(0, 0, 160, 1.7867568, 2.9256321)
    path.arc(-136.7479433, 30, 20, 2.9256321, 4.7123889)

    path.lineTo(-45.8257569, 10)

    path.arc(-45.8257569, 20, 10, 4.7123889, 5.8716684)
    path.arc(0, 0, 40, 2.7300758, 1.9823131, true)
    path.arc(-20, 45.8257569, 10, 5.1239058, 0)
    path.closePath()
    return path
}

/**
 * Sandbox scene
 * @param c {CanvasRenderingContext2D}
 * @param width {Number}
 * @param height {Number}
 */
function renderSandbox(c, width, height) {
    if (!dxfModel) {
        return
    }

    const origin = [width / 2, height / 2]
    c.strokeStyle = ORANGE
    c.lineWidth = 2

    c.save()
    c.translate(...origin)

    c.fillStyle = 'rgba(255, 165, 0, 0.5)'

    const path = new Path2D()
    const outerRadius = 180
    path.ellipse(0, 0, outerRadius, outerRadius, 0, 0, 2 * pi, true)
    const piePath = getPiePath()
    path.addPath(piePath)
    path.addPath(piePath, (new DOMMatrix()).rotate(90))
    path.addPath(piePath, (new DOMMatrix()).rotate(180))
    path.addPath(piePath, (new DOMMatrix()).rotate(270))
    c.stroke(path)
    c.fill(path, 'nonzero')

    c.restore()
}

const sketch = ({canvas}) => {
    t = Date.now()
    return ({context: c, width, height}) => {
        const now = Date.now()
        const dt = (now - t) / 1000
        t = now

        c.fillStyle = '#000'
        c.fillRect(0, 0, width, height)

        // renderSandbox(c, width, height)

        render(c, width, height)

        if (!paused) {
            integrate(t, dt)
        }
    }
}

canvasSketch(sketch, settings)


window.addEventListener('click', _ => paused = !paused)

// const DxfParser = require('dxf-parser')
// const {renderDxf} = require('./dxfutil')

// const dxfParser = new DxfParser()
//
// async function parseDxfModel(uri) {
//     const response = await fetch(uri)
//     const data = await response.text()
//     return dxfParser.parseSync(data)
// }

// let dxfModel = undefined

// window.addEventListener('load', async () => {
//     const dxfFilename = "/models/pie.dxf"
//     dxfModel = await parseDxfModel(dxfFilename)
//     console.log(dxfModel)
// })