const canvasSketch = require('canvas-sketch')
const {PI: pi, cos, sin} = Math
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

/* distance between pendulum origins */
const d = 1.5

/* spring stiffness */
const k = 3.0

const l1 = 0.75
const l2 = 0.75

const m1 = 0.05
const m2 = 0.03

let th1 = -pi/6
let th2 = -pi/12

let dth1 = .0
let dth2 = .0

/**
 *
 * @param c {CanvasRenderingContext2D}
 * @param origin {Array}
 * @param x {Number}
 * @param y {Number}
 */
function renderPendulum(c, origin, x, y) {
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

    c.fillStyle = BLUE
    c.beginPath()
    c.ellipse(x, y, 10, 10, 0, 0, 2 * pi)
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

    for (let i = 1; i < points.length; i+=2) {
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

    drawSpring(c, Vector(x1, y1), Vector(x2, y2), 13, 23, 4.0, GREEN)
    drawSpring(c, Vector(x1, y1), Vector(x2, y2), 11, 13, 3.0, "rgba(1, 220, 3, 0.9)")
    drawSpring(c, Vector(x1, y1), Vector(x2, y2), 7, 19, 2.0, "rgba(1, 220, 3, 0.7)")

    renderPendulum(c, o1, x1, y1)
    renderPendulum(c, o2, x2, y2)
}




const sketch = ({canvas}) => {

    return ({context: c, width, height}) => {

        c.fillStyle = '#000'
        c.fillRect(0, 0, width, height)

        render(c, width, height)

        if (!paused) {
            // TODO: integrate
        }
    }
}


canvasSketch(sketch, settings)

window.addEventListener('click', _ => paused = !paused)

// TODO: free pendulums disregarding the spring
// TODO: include spring
// TODO: add trails to pendulums
