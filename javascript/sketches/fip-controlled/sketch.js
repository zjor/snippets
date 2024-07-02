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
const RED = '#CF0000'
const ORANGE = '#FFA500' // rgb(255, 165, 0)
const YELLOW = '#FFE62D'
const PINK = '#DF19FB'

let paused = true

const g = 9.81
const MODE_SWING_UP = 0
const MODE_BALANCE = 1

const m1 = 0.9  // mass of the rod
const m2 = 3.0  // mass of the wheel
const r = 0.6   // radius of the wheel
const l = 1.25  // length of the rod
const J = m2 * r ** 2   // momentum of inertia of the wheel

const th0 = 5 * pi / 6
let th = th0
let dth = .0
let phi = .0
let dphi = .0

let disturbanceEnabled = false
let mode = MODE_SWING_UP

/**
 *
 * @param ctx {CanvasRenderingContext2D}
 * @param origin {Array}
 * @param scale {Number}
 * @param opacity {Number}
 */
function leftDisturbanceTriangle(ctx, origin, scale, opacity) {
    const [w, h] = [50, 150]
    storedContext(ctx, c => {
        c.translate(origin[0] + w / 2, origin[1])
        c.scale(scale, scale)
        c.beginPath()
        c.moveTo(-w / 2, -h / 2)
        c.lineTo(w / 2, 0)
        c.lineTo(-w / 2, h / 2)
        c.closePath()
        c.fillStyle = `rgba(${0xCF}, 0, 0, ${opacity})`
        c.fill()
    })
}

function rightDisturbanceTriangle(ctx, origin, scale, opacity) {
    const [w, h] = [50, 150]
    storedContext(ctx, c => {
        c.translate(origin[0] - w / 2, origin[1])
        c.scale(scale, scale)
        c.beginPath()
        c.moveTo(w / 2, -h / 2)
        c.lineTo(-w / 2, 0)
        c.lineTo(w / 2, h / 2)
        c.closePath()
        c.fillStyle = `rgba(${0xCF}, 0, 0, ${opacity})`
        c.fill()
    })
}

const DisturbanceHistory = () => {
    let items = []

    return {
        /**
         *
         * @param isLeft {boolean}
         * @param amplitude {Number}
         * @param duration {Number}
         */
        add(isLeft, amplitude, duration) {
            if (amplitude < 0) {
                throw new Error("Amplitude should be positive")
            }
            items.push({
                isLeft, amplitude, duration, opacity: 1
            })
        },
        /**
         *
         * @param c {CanvasRenderingContext2D}
         * @param width {Number}
         * @param height {Number}
         */
        render(c, width, height) {
            for (const d of items) {
                const opacity = Math.sqrt(d.opacity)
                const scale = (d.amplitude / 75) * opacity
                if (d.isLeft) {
                    let origin = [
                        -3 / 8 * width,
                        -3 / 8 * height + 75
                    ];
                    leftDisturbanceTriangle(c, origin, scale, opacity)
                } else {
                    let origin = [
                        3 / 8 * width,
                        -3 / 8 * height + 75
                    ];
                    rightDisturbanceTriangle(c, origin, scale, opacity)
                }
            }
        },
        fadeOut() {
            const nonZero = []
            for (let i = 0; i < items.length; i++) {
                items[i].opacity -= Math.max(items[i].duration / 20, 0.005)
                if (items[i].opacity > 0.1) {
                    nonZero.push(items[i])
                }
            }
            items = nonZero
        }
    }
}

const disturbanceHistory = DisturbanceHistory()

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

    renderCentroid(c, x, y, 20, -th0 / 2 + phi)

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

    disturbanceHistory.render(c, width, height)
    renderBase(c, scale)
    renderPendulumBody(c, L, th - pi / 2)
    renderCentroid(c, 0, 0, 20, th)
    renderWheel(c, x, y)

    c.font = '24px monospace'
    c.fillStyle = PINK
    c.fillText(`Mode: ${mode == MODE_SWING_UP ? "Swing Up" : "Balance"}`.toUpperCase(), -width / 2 + 16, -height / 2 + 32)

    c.restore()
}

const disturbance = {
    endsAt: 0,
    value: 0,
    nextFrame: 57,
    update(t, dt, frame) {
        if (disturbanceEnabled && frame % this.nextFrame == 0) {
            const duration = Math.random()
            this.endsAt = t + duration * 75 * dt
            this.value = (Math.random() - 0.5) * 300.0
            this.nextFrame = Math.floor(10 + 100 * Math.random())
            disturbanceHistory.add(this.value < 0, Math.abs(this.value), duration)
        }
    }
}

/**
 * Calculates control signal necessary to swing-up a pendulum.
 * Ref: [2014, Lin et al.] "Design and implementation of a novel inertia flywheel pendulum mechatronic kit"
 * @param th
 * @param dth
 * @return {number}
 */
function energyControlSwingUp(th, dth) {
    const gamma = 0.02
    return -gamma * (J * dth ** 2 / 2 - (m1 + m2) * l * g * (1 - cos(th))) * dth
}

function maximumEnergySwingUp() {
    //TODO: implement
}

/**
 * Calculates control signal for balancing a pendulum using state regulator
 * @param th {number}
 * @param dth {number}
 * @param dphi {number}
 * @return {number}
 */
function lqrBalance(th, dth, dphi) {
    return -(195 * th + 100 * dth - 10 * dphi)
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

    if (Math.abs(_th) <= pi / 6) {
        mode = MODE_BALANCE
        disturbanceEnabled = true
    } else {
        mode = MODE_SWING_UP
    }

    let control = 0
    if (mode == MODE_SWING_UP) {
        control = energyControlSwingUp(_th, _dth)
    } else if (mode == MODE_BALANCE) {
        control = lqrBalance(_th, _dth, _dphi)
    }

    const kick = disturbance.endsAt > t ? disturbance.value : 0

    const ddth = (control + kick - (0.5 * m1 + m2) * l * g * sin(-_th)) / (m1 * l ** 2 / 3 + m2 * l ** 2 + J)
    const ddphi = control / J
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
 *
 * @param c {CanvasRenderingContext2D}
 * @param render {Function}
 */
function storedContext(c, render) {
    c.save()
    render(c)
    c.restore()
}

/**
 * Sandbox scene
 * @param ctx {CanvasRenderingContext2D}
 * @param width {Number}
 * @param height {Number}
 */
function renderSandbox(ctx, width, height) {

    const origin = [width / 2, height / 2]
    ctx.strokeStyle = ORANGE
    ctx.lineWidth = 2

}

let t = Date.now()

const sketch = ({canvas}) => {
    return ({context: c, width, height, frame}) => {
        const now = Date.now()
        const dt = (now - t) / 1000
        t = now

        c.fillStyle = '#000'
        c.fillRect(0, 0, width, height)

        // renderSandbox(c, width, height)

        render(c, width, height)

        if (!paused) {
            disturbance.update(t, dt, frame)
            disturbanceHistory.fadeOut()
            integrate(t, dt)
        }
    }
}

canvasSketch(sketch, settings)

window.addEventListener('click', _ => paused = !paused)

/*
TODO:
- face speed ~ the duration of action
---
- plot graphs of system state (th, dth, dphi, control)
- print mode
 */