const canvasSketch = require('canvas-sketch')
const {PI: pi, cos, sin, sqrt} = Math
const {Vector} = require('./geometry')
const {integrateRK4} = require('./ode')

const settings = {
    dimensions: [1080, 1080],
    animate: true
}

const GREEN = '#01DC03' // rgb(1, 220, 3)
const DARK_GREEN = '#017A02'
const BLUE = '#12B8FF' // rgb(18, 184, 255)
const DARK_BLUE = '#0C88B2'
const ROSE = '#FD4499'
const YELLOW = '#FFE62D'
const PINK = '#DF19FB'

let paused = true

const g = 9.81

/* distance between pendulum origins */
const d = 1.5

/* spring stiffness */
const k = 1.5

const l1 = 1.1
const l2 = 1.5

const m1 = 0.5
const m2 = 0.3

let th1 = .0
let th2 = .0

let dth1 = .4
let dth2 = .0

let t = 0

const Trail = (length, baseColor = [18, 184, 255]) => {
    const items = []
    const [r, g, b] = baseColor

    return {
        add(x, y) {
            items.unshift([x, y])
            if (items.length >= length) {
                items.pop()
            }
        },

        /**
         *
         * @param c {CanvasRenderingContext2D}
         */
        render(c) {
            for (let i = 0; i < items.length; i++) {
                const r = 7 * (items.length - i) / items.length
                c.fillStyle = `rgba(${r}, ${g}, ${b}, ${1 - (i / items.length)})`
                c.beginPath()
                c.ellipse(items[i][0], items[i][1], r, r, 0, 0, 2 * pi)
                c.fill()
            }
        }
    }
}

const trail1 = Trail(64)
const trail2 = Trail(64)

/**
 *
 * @param c {CanvasRenderingContext2D}
 * @param origin {Array}
 * @param x {Number}
 * @param y {Number}
 * @param size {Number}
 */
function renderPendulum(c, origin, x, y, size = 10) {
    c.strokeStyle = BLUE
    c.lineWidth = 4
    c.beginPath()
    c.moveTo(...origin)
    c.lineTo(x, y)
    c.stroke()

    c.fillStyle = ROSE
    c.beginPath()
    c.ellipse(origin[0], origin[1], 10, 10, 0, 0, 2 * pi)
    c.fill()

    const gradient = c.createRadialGradient(x - size / 8, y - size / 8, size / 4, x, y, size)
    gradient.addColorStop(0, BLUE)
    gradient.addColorStop(1, DARK_BLUE)
    c.fillStyle = gradient
    c.beginPath()
    c.ellipse(x, y, size, size, 0, 0, 2 * pi)
    c.fill()


}

/**
 *
 * @param c {CanvasRenderingContext2D}
 * @param s {Vector}
 * @param e {Vector}
 * @param segments {Number}
 * @param amplitude {Number}
 * @param lineWidth {Number}
 * @param color {string}
 */
function drawSpring(c, s, e, segments, amplitude, lineWidth, color) {
    const dir = e.minus(s).normalize()
    const norm = Vector(-dir.y, dir.x)

    const vertices = []
    const l = 1.0 // neutral distance between balls
    const x = 1.0 // current distance between balls
    const a = amplitude * l / x
    const [dx, dy] = [(e.x - s.x) / segments, (e.y - s.y) / segments]
    for (let i = 0; i < segments; i++) {
        const sign = (i > 1 && i < segments - 1) ? ((i % 2 == 0) ? 1 : -1) : 0
        const noise = [
            sin(i + a) * a / 4,
            cos(i + a) * a / 4,
        ]
        vertices.push(Vector(
            s.x + dx * i + sign * a * norm.x + sign * noise[0],
            s.y + dy * i + sign * a * norm.y + sign * noise[1]))
    }

    vertices.push(e)
    vertices.push(e)

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

    c.strokeStyle = color
    c.lineWidth = lineWidth

    c.beginPath()
    c.moveTo(points[0].x, points[0].y)

    for (let i = 1; i < points.length; i += 2) {
        c.quadraticCurveTo(
            points[i - 1].x, points[i - 1].y,
            points[i].x, points[i].y)
    }
    c.stroke()
}

/**
 *
 * @param c {CanvasRenderingContext2D}
 * @param width {Number}
 * @param height {Number}
 */
function render(c, width, height) {
    const origin = [width / 2, height / 3]
    const scale = width / 4

    const o1 = [origin[0] - d * scale / 2, origin[1]]
    const [x1, y1] = [o1[0] + l1 * scale * sin(th1), o1[1] + l1 * scale * cos(th1)]

    const o2 = [origin[0] + d * scale / 2, origin[1]]
    const [x2, y2] = [o2[0] + l2 * scale * sin(th2), o2[1] + l2 * scale * cos(th2)]

    trail1.add(x1, y1)
    trail2.add(x2, y2)

    trail1.render(c)
    trail2.render(c)

    drawSpring(c, Vector(x1, y1), Vector(x2, y2), 13, 23, 4.0, GREEN)
    drawSpring(c, Vector(x1, y1), Vector(x2, y2), 11, 13, 3.0, "rgba(1, 220, 3, 0.9)")
    drawSpring(c, Vector(x1, y1), Vector(x2, y2), 7, 19, 2.0, "rgba(1, 220, 3, 0.7)")

    renderPendulum(c, o1, x1, y1, m1 * 50)
    renderPendulum(c, o2, x2, y2, m2 * 50)
}

/**
 *
 * @param state {Array<Number>}
 * @param t {Number}
 * @param dt {Number}
 * @returns {Array<Number>}
 */
function derive(state, t, dt) {
    const [_th1, _dth1, _th2, _dth2] = state

    const dx = -l1 * sin(th1) + l2 * sin(th2) + d
    const dy = l1 * cos(th1) - l2 * cos(th2)

    const dL = sqrt(dx ** 2 + dy ** 2) - d
    const ddLdth1 = (dx * (-l1 * cos(th1)) + dy * l1 * sin(th1)) / sqrt(dx ** 2 + dy ** 2)
    const ddLdth2 = (dx * (l2 * cos(th2)) + dy * (-l2 * sin(th2))) / sqrt(dx ** 2 + dy ** 2)

    const ddth1 = -g / l1 * sin(_th1) - k * dL * ddLdth1 / (m1 * l1 ** 2)
    const ddth2 = -g / l2 * sin(_th2) - k * dL * ddLdth2 / (m2 * l2 ** 2)

    return [_dth1, ddth1, _dth2, ddth2]
}

/**
 *
 * @param t {Number}
 * @param dt {Number}
 */
function integrate(t, dt) {
    const state = [th1, dth1, th2, dth2]
    const next = integrateRK4(state, t, dt, derive)
    if (next) {
        [th1, dth1, th2, dth2] = next
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