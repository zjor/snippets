const canvasSketch = require('canvas-sketch')
const {PI: pi, cos, sin, sqrt} = Math

const {Knob} = require('./knob')

const settings = {
    dimensions: [1080, 1080],
    animate: true
}

const ORANGE = '#FFA500' // rgb(255, 165, 0)
const BLUE = '#12B8FF'
const GREEN = '#01DC03'
const YELLOW = '#FFE62D'
const ROSE = '#FD4499'
const PINK = '#DF19FB'

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
        },
        getTransform() {
            return [m[0][0], m[1][0], m[0][1], m[1][1], m[0][2], m[1][2]]
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

let star = generateStar()

function generateStar() {
    return [(Math.random() - 0.2) * 200, -100 - Math.random() * 150]
}

function drawStar(c) {
    const outerRadius = 20
    const innerRadius = 15
    const spikes = 8
    let rot = Math.PI / 2 * 3;
    let x = star[0];
    let y = star[1];
    const step = Math.PI / spikes;

    c.beginPath();
    c.moveTo(star[0], star[1] - outerRadius)
    for (i = 0; i < spikes; i++) {
        x = star[0] + Math.cos(rot) * outerRadius;
        y = star[1] + Math.sin(rot) * outerRadius;
        c.lineTo(x, y)
        rot += step

        x = star[0] + Math.cos(rot) * innerRadius;
        y = star[1] + Math.sin(rot) * innerRadius;
        c.lineTo(x, y)
        rot += step
    }
    c.lineTo(star[0], star[1] - outerRadius);
    c.closePath();
    c.lineWidth = 5;
    c.strokeStyle = ORANGE;
    c.stroke();
    c.fillStyle = YELLOW;
    c.fill();

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
window.addEventListener('keydown', e => {
    knobA.keyDown(e.key)
    knobB.keyDown(e.key)
})

const knobA = Knob(pi - pi / 3, 1080 / 3, 1080 * 3 / 4, 'a', 'd', BLUE, PINK)
const knobB = Knob(pi - pi / 3, 1080 * 2 / 3, 1080 * 3 / 4, 's', 'w', BLUE, GREEN)

function sketch({canvas}) {

    canvas.addEventListener('mousedown', onMouseDown(canvas))
    canvas.addEventListener('mousemove', onMouseMove(canvas))
    canvas.addEventListener('mouseup', onMouseUp(canvas))

    return ({context: c, width, height, frame}) => {
        const now = Date.now()
        const dt = (now - t) / 1000
        t = now

        const [a1, a2] = [
            -knobA.state,
            knobB.state,
        ]

        const m1 = R(a1).mult(T(200, 0))
        const m2 = m1.mult(R(a2).mult(T(150, 0)))

        c.fillStyle = '#000'
        c.fillRect(0, 0, width, height)

        // render(c, width, height)
        knobA.render(c)
        knobB.render(c)

        const endEffector = m2.vec()

        c.save()
        c.translate(width / 2, height / 2)

        c.beginPath()
        c.moveTo(0, 0)
        c.lineTo(...m1.vec())
        c.lineTo(...endEffector)
        c.lineWidth = 4
        c.strokeStyle = ORANGE
        c.stroke()

        c.beginPath()
        c.moveTo(-20, 0)
        c.lineTo(20, 0)
        c.stroke()

        c.beginPath()
        c.ellipse(0, 0, 10, 10, 0, 0, 2 * pi)
        c.fillStyle = PINK
        c.fill()

        c.beginPath()
        c.ellipse(m1.vec()[0], m1.vec()[1], 10, 10, 0, 0, 2 * pi)
        c.fillStyle = GREEN
        c.fill()

        c.save()
        c.transform(...m2.getTransform())
        c.rotate(-pi / 2)
        c.beginPath()

        c.moveTo(-10, 20)
        c.lineTo(-10, 0)
        c.lineTo(10, 0)
        c.lineTo(10, 20)

        c.stroke()
        c.restore()

        drawStar(c)

        c.restore()

        if (sqrt((star[0] - endEffector[0]) ** 2 + (star[1] - endEffector[1]) ** 2) <= 30) {
            star = generateStar()
        }

        if (!paused) {
        }
    }
}

const onMouseDown = (canvas) => {
    return (e) => {
        const x = (e.offsetX / canvas.offsetWidth) * canvas.width
        const y = (e.offsetY / canvas.offsetHeight) * canvas.height
        knobA.mouseDown(x, y)
        knobB.mouseDown(x, y)
    }
}

const onMouseMove = (canvas) => {
    return (e) => {
        const x = (e.offsetX / canvas.offsetWidth) * canvas.width
        const y = (e.offsetY / canvas.offsetHeight) * canvas.height
        knobA.mouseMoved(x, y)
        knobB.mouseMoved(x, y)

    }
}

const onMouseUp = (canvas) => {
    return (e) => {
        const x = (e.offsetX / canvas.offsetWidth) * canvas.width
        const y = (e.offsetY / canvas.offsetHeight) * canvas.height
        knobA.mouseUp()
        knobB.mouseUp()
    }
}

