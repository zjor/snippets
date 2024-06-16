const canvasSketch = require('canvas-sketch')
const {PI: pi, cos, sin, sqrt, random} = Math

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

/**
 *
 * @param c {CanvasRenderingContext2D}
 * @param width {Number}
 * @param height {Number}
 * @param frame {Number}
 */
function render(c, width, height, frame) {

    c.lineWidth = 4.0

    c.save()
    c.translate(width / 2, height / 2)

    c.save()

    let a = 20.0 * sin(t / 3000)
    c.translate(random() * a, random() * a)
    // c.lineWidth = Math.abs(random()) * 5.0

    c.beginPath()
    c.rect(-100, -100, 200, 200)
    c.strokeStyle = PINK
    c.stroke()

    c.restore()

    c.save()

    a = 20.0 * sin(t / 3000)
    c.translate(random() * a, random() * a)

    c.beginPath()
    c.moveTo(-150, -100)
    c.lineTo(0, -220)
    c.lineTo(150, -100)
    c.closePath()
    c.strokeStyle = YELLOW
    c.stroke()

    c.restore()

    c.save()

    a = 20.0 * sin(t / 3000)
    c.translate(random() * a, random() * a)

    c.beginPath()
    c.rect(-60, -60, 50, 50)
    c.strokeStyle = BLUE
    c.stroke()

    c.restore()

    c.save()

    a = 20.0 * sin(t / 3000)
    c.translate(random() * a, random() * a)

    c.beginPath()
    c.rect(10, -60, 60, 160)
    c.strokeStyle = DARK_GREEN
    c.stroke()

    c.restore()

    c.restore()

}

let t = Date.now()

const sketch = ({canvas}) => {
    return ({context: c, width, height, frame}) => {
        const now = Date.now()
        const dt = (now - t) / 1000
        t = now

        c.fillStyle = '#000'
        c.fillRect(0, 0, width, height)

        render(c, width, height, frame)

        if (!paused) {
            // integrate(t, dt)
        }
    }
}

canvasSketch(sketch, settings)

window.addEventListener('click', _ => paused = !paused)