const canvasSketch = require('canvas-sketch')
const {PI: pi, cos, sin, sqrt} = Math

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
canvasSketch(sketch, settings)
window.addEventListener('click', _ => paused = !paused)
let t = Date.now()

const PointMass = (x, y, m, r) => {
    return {
        force(p) {
            const g = 10
            const d = sqrt((x - p.x) ** 2 + (y - p.y) ** 2)
            let f = g * m * p.m / d ** 2
            if (Math.abs(d) <= r + p.r) {
                f = g * m * p.m * d / (r + p.r) ** 3
            }
            if (Math.abs(d) <= r) {
                return [0, 0]
            }
            return [f * (p.x - x) / d, f * (p.y - y) / d]
        },
        get x() {
            return x
        },
        set x(value) {
            x = value
        },
        get y() {
            return y
        },
        set y(value) {
            y = value
        },
        get m() {
            return m
        },
        get r() {
            return r;
        }
    }
}

const masses = [
    PointMass(0, 200, 2000, 25),
    PointMass(200, 0, 1500, 40)
]
const p = []


/**
 *
 * @param c {CanvasRenderingContext2D}
 * @param width {Number}
 * @param height {Number}
 */
function render(c, width, height) {
    c.save()
    c.translate(width / 2, height / 2)

    const k = 0.5

    for (let j = 0; j < p.length; j++) {
        const dx = [0, 0]
        const _p = p[j]

        for (let i = 0; i < masses.length; i++) {
            const mass = masses[i]
            const _f = _p.force(mass)
            dx[0] += _f[0] / k
            dx[1] += _f[1] / k
        }

        c.beginPath()
        c.moveTo(_p.x, _p.y)
        c.lineTo(_p.x + dx[0], _p.y + dx[1])
        c.strokeStyle = GREEN
        c.stroke()

        c.beginPath()
        c.ellipse(_p.x + dx[0], _p.y + dx[1], 5, 5, 0, 0, 2 * pi)
        c.closePath()
        c.fillStyle = ORANGE
        c.fill()

        c.beginPath()
        c.ellipse(_p.x, _p.y, 2, 2, 0, 0, 2 * pi)
        c.closePath()
        c.fillStyle = GREEN
        c.fill()


    }


    c.fillStyle = BLUE

    for (let i = 0; i < masses.length; i++) {
        const mass = masses[i]

        c.beginPath()
        c.ellipse(mass.x, mass.y, mass.r, mass.r, 0, 0, 2 * pi)
        c.closePath()
        c.fill()

        const amp = 200 / (i + 1)
        const dir = (i == 0) ? -1 : 1
        mass.x = amp * cos(dir * t / 4000 + pi / 2 * (i % 2))
        mass.y = amp * sin(dir * t / 4000 + pi / 2 * (i % 2))
    }

    c.restore()
}

function sketch({canvas}) {

    const cx = 30
    const cy = 30
    const dx = 1080 / cx
    const dy = 1080 / cy

    for (let x = 0; x < cx; x++) {
        for (let y = 0; y < cy; y++) {
            p.push(PointMass((x - cx / 2) * dx, (y - cy / 2) * dy, 100, 50))
        }
    }

    // p.push(PointMass(0, 0, 100, 50))

    return ({context: c, width, height, frame}) => {
        const now = Date.now()
        const dt = (now - t) / 1000
        t = now

        c.fillStyle = '#000'
        c.fillRect(0, 0, width, height)

        render(c, width, height)

        if (!paused) {
            //TODO: animate
        }
    }
}
