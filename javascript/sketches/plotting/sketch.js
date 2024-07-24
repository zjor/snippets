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

const data = []

function emitValue(t, dt) {
    return 7 * sin(t / 97) + 17 * cos(t / 163)
}

/**
 *
 * @param c {CanvasRenderingContext2D}
 * @param width {Number}
 * @param height {Number}
 */
function render(c, width, height) {
    const [dx, dy] = [50, 50]

    const _width = 0.75 * width
    const _height = 0.5 * height

    c.save()
    c.translate((width - _width) / 2, (height - _height) / 2)

    c.strokeStyle = DARK_BLUE

    for (let x = 0; x < _width; x += dx) {
        c.lineWidth = (x % (dx * 4) == 0 && x > 0) ? 3 : 1
        c.beginPath()
        c.moveTo(x, 0)
        c.lineTo(x, _height)
        c.stroke()
    }

    for (let y = 0; y < _height; y += dy) {
        c.lineWidth = (y % (dy * 4) == 0 && y > 0) ? 3 : 1
        c.beginPath()
        c.moveTo(0, y)
        c.lineTo(_width, y)
        c.stroke()
    }

    c.save()
    c.translate(0, _height / 2)

    c.strokeStyle = ROSE
    c.lineWidth = 4

    c.beginPath()
    c.moveTo(0, 0)

    for (let i = Math.max(0, data.length - 75); i < data.length; i++) {
        const {ts, v} = data[i]
        c.lineTo(Math.max(0, _width - 10 - (t - ts)), v * 10)
    }
    c.stroke()

    c.restore()

    c.strokeStyle = GREEN
    c.lineWidth = 6
    c.strokeRect(0, 0, _width, _height)

    c.restore()
}

function sketch ({canvas}) {
    return ({context: c, width, height, frame}) => {
        const now = Date.now()
        const dt = (now - t) / 1000
        t = now

        c.fillStyle = '#000'
        c.fillRect(0, 0, width, height)

        if (frame % 1 == 0) {
            data.push({ts: t, v: emitValue(t, dt)})
            while (data.length > 75) {
                data.shift()
            }
        }


        render(c, width, height)

        if (!paused) {
            //TODO: animate
        }
    }
}
