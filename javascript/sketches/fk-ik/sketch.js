const canvasSketch = require('canvas-sketch')
const {PI: pi, cos, sin, sqrt} = Math

const {Knob} = require('./knob')

const settings = {
    dimensions: [1080, 1080],
    animate: true
}

const ORANGE = '#FFA500' // rgb(255, 165, 0)

const Matrix = (m) => {
    return {
        data() {
            return m
        },
        mult(m1) {
            const result = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    let sum = 0
                    for (let k = 0; k < 3; k++) {
                        sum += m[i][k] * m1.data()[k][j]
                    }
                    result[i][j] = sum
                }
            }
            return Matrix(result)
        },
        vec() {
            return [m[0][2], m[1][2]]
        }
    }
}

const I = () => {
    return Matrix([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
    ])
}

const R = (a) => {
    const [s, c] = [sin(a), cos(a)]
    return Matrix([
        [c, -s, 0],
        [s, c, 0],
        [0, 0, 1],
    ])
}

const T = (tx, ty) => {
    return Matrix([
        [1, 0, tx],
        [0, 1, ty],
        [0, 0, 1],
    ])
}

const RevoluteLink = (length, angle) => {
    return {}
}

/**
 *
 * @param c {CanvasRenderingContext2D}
 * @param width {Number}
 * @param height {Number}
 */
function render(c, width, height) {

}

let t = Date.now()
let paused = true
canvasSketch(sketch, settings)
window.addEventListener('click', _ => paused = !paused)

window.addEventListener('mousedown', e => {
    console.log(e.pageX, e.pageY)
    knob.mouseDown(e.x, e.y)
})

const knob = Knob(pi / 3)

function sketch({canvas}) {

    return ({context: c, width, height, frame}) => {
        const now = Date.now()
        const dt = (now - t) / 1000
        t = now

        const [a1, a2] = [
            pi / 6 * (sin(t / 1000) + 0.3),
            pi / 12 * (sin(t / 1000) + 0.6),
        ]

        const m1 = R(a1).mult(T(200, 0))
        const m2 = m1.mult(R(a2).mult(T(150, 0)))

        c.fillStyle = '#000'
        c.fillRect(0, 0, width, height)

        // render(c, width, height)
        c.save()
        c.translate(width / 2, height / 2)

        knob.render(c)

        c.beginPath()
        c.moveTo(0, 0)
        c.lineTo(...m1.vec())
        c.lineTo(...m2.vec())
        c.lineWidth = 4
        c.strokeStyle = ORANGE
        c.stroke()

        c.restore()

        if (!paused) {
        }
    }
}
