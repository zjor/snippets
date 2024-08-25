const canvasSketch = require('canvas-sketch')
const {PI: pi, cos, sin, sqrt} = Math

const {palette} = require('./palette')

const settings = {
    dimensions: [1080, 1080],
    animate: true
}

let paused = true
canvasSketch(sketch, settings)
window.addEventListener('click', _ => paused = !paused)

let t = Date.now()
let angle = 0.0
let omega = 0.0
let lastColor = 0.0

/**
 *
 * @param c {CanvasRenderingContext2D}
 * @param width {Number}
 * @param height {Number}
 */
function render(c, width, height) {
    c.save()
    c.translate(width / 2, height / 2)

    const radius = 32

    for (let i = width/4; i >= radius; i -= 4) {

        for (let a = 0; a <= 360; a += 60) {
            const phi = angle + a * pi / 180
            const [x, y] = [200 * cos(phi), 200 * sin(phi)]

            // const ix = Math.floor(255 * radius / i)
            const filter = 0.2
            // lastColor = filter * Math.abs(omega) + (1 - filter) * lastColor
            lastColor = Math.max(Math.abs(omega), lastColor - 0.00005)
            const ix = Math.min(255, Math.floor(255 * (lastColor / 5)))

            const [r, g, b] = palette[255 - ix]
            c.beginPath()
            c.ellipse(x, y, i, i, 0, 0, 2 * pi)
            const beta = Math.min(1.0, radius / (i * 0.5))
            c.fillStyle = `rgba(${r * beta}, ${g * beta}, ${b * beta})`
            c.fill()


            c.beginPath()
            c.ellipse(x, y, radius, radius, 0, 0, 2 * pi)
            c.fillStyle = `rgba(${r}, ${g}, ${b})`
            c.fill()
        }
    }

    c.restore()

}

function getAngularVelocity(x) {
    const period = 4 * pi
    x = (x % period) - period / 2
    return 10 * cos(4 * x) / (2 + x * x)
}

function sketch({canvas}) {
    return ({context: c, width, height, frame}) => {
        const now = Date.now()
        const dt = (now - t) / 1000
        t = now

        c.fillStyle = '#000'
        c.fillRect(0, 0, width, height)

        render(c, width, height)

        if (!paused) {
            omega = getAngularVelocity(t / 2000)
            angle += omega * dt
        }
    }
}
