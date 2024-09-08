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

const Star = (innerRadius, outerRadius, spikes) => {
    let _x = 0
    let _y = 0
    // or generated
    let locationSet = false

    return {
        setLocation(x, y) {
            _x = x; _y = y
            locationSet = true
        },
        generateLocation() {
            _x = (Math.random() - 0.2) * 200
            _y = -100 - Math.random() * 150
            locationSet = false
        },
        isTouched(x, y) {
            const d2 = (_x - x) ** 2 + (_y - y) ** 2
            return d2 <= outerRadius ** 2
        },
        draw(c) {
            let rot = Math.PI / 2 * 3;
            let x = _x;
            let y = _y;
            const step = Math.PI / spikes;

            c.beginPath();
            c.moveTo(_x, _y - outerRadius)
            for (i = 0; i < spikes; i++) {
                x = _x + Math.cos(rot) * outerRadius;
                y = _y + Math.sin(rot) * outerRadius;
                c.lineTo(x, y)
                rot += step

                x = _x + Math.cos(rot) * innerRadius;
                y = _y + Math.sin(rot) * innerRadius;
                c.lineTo(x, y)
                rot += step
            }
            c.lineTo(_x, _y - outerRadius);
            c.closePath();
            c.lineWidth = 5;
            c.strokeStyle = ORANGE;
            c.stroke();
            c.fillStyle = YELLOW;
            c.fill();
        },
        get locationWasSet() {
            return locationSet
        },
        get x() {
            return _x
        },
        get y() {
            return _y
        }
    }
}

function solveInverseKinematics(l1, l2, x, y) {
    const th2 = Math.acos((x ** 2 + y ** 2 - l1 ** 2 - l2 ** 2) / (2 * l1 * l2))
    let phi = Math.atan(y / x)
    if (x < 0) {
        phi = phi - pi
    }
    const th1 = phi - Math.atan(l2 * sin(th2) / (l1 + l2 * cos(th2)))
    return [th1, th2]
}

let star = Star(15, 25, 8)
star.generateLocation()

const pressedKeys = new Set()

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
window.addEventListener('keyup', e => pressedKeys.delete(e.key))
window.addEventListener('keydown', e => pressedKeys.add(e.key))

const knobA = Knob(pi - pi / 3, 1080 / 3, 1080 * 3 / 4, 'a', 'd', BLUE, PINK)
const knobB = Knob(pi - pi / 3, 1080 * 2 / 3, 1080 * 3 / 4, 's', 'w', BLUE, GREEN)

const [l1, l2] = [200, 150]
let [a1, a2] = [-knobA.state, knobB.state]

// target angles
let [tA1, tA2] = [0, 0]

function sketch({canvas}) {

    canvas.addEventListener('mousedown', onMouseDown(canvas))
    canvas.addEventListener('mousemove', onMouseMove(canvas))
    canvas.addEventListener('mouseup', onMouseUp(canvas))


    return ({context: c, width, height, frame}) => {
        const now = Date.now()
        const dt = (now - t) / 1000
        t = now

        if (Math.abs(a1 - tA1) > 1e-3) {
            a1 += (tA1 - a1) / 10
            knobA.state = a1 - pi
        }

        if (Math.abs(a2 - tA2) > 1e-3) {
            a2 += (tA2 - a2) / 10
            knobB.state = a2
        }

        const m1 = R(a1).mult(T(l1, 0))
        const m2 = m1.mult(R(a2).mult(T(l2, 0)))

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

        star.draw(c)

        c.restore()

        if (!star.locationWasSet && star.isTouched(...endEffector)) {
            star.generateLocation()
        }

        for (let key of pressedKeys) {
            knobA.keyDown(key)
            knobB.keyDown(key)
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

        const _x = x - 1080 / 2
        const _y = y - 1080 / 2

        console.log(_x, _y)
        if (_y < 0) {
            star.setLocation(_x, _y)
            const targetEE = [star.x, star.y]
            const _ik = solveInverseKinematics(l1, l2, targetEE[0], targetEE[1])
            tA1 = _ik[0]
            tA2 = _ik[1]
        }
    }
}

/*
TODO:
- move star by click
- animate angle value from a -> b
- synchronize angles with knob statuses
 */

