const canvasSketch = require('canvas-sketch')
const {PI: pi, cos, sin} = Math
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


let paused = true

/**
 * Creates an instance of a double pendulum
 * @param l1 {Number} length of the 1st pendulum
 * @param m1 {Number} mass of the 1st pendulum
 * @param th1 {Number} initial angle of the 1st pendulum
 * @param dth1 {Number} initial angular velocity of the 1st pendulum
 * @param l2 {Number} length of the 2nd pendulum
 * @param m2 {Number} mass of the 2nd pendulum
 * @param th2 {Number} initial angle of 2nd pendulum
 * @param dth2 {Number} initial angular velocity of the 2nd pendulum
 * @constructor
 */
const Pendulum = (
    l1, m1, th1, dth1,
    l2, m2, th2, dth2
) => {
    let _th1 = th1
    let _dth1 = dth1
    let _th2 = th2
    let _dth2 = dth2

    const derive = (state, t, dt) => {
        const g = 9.81
        const [th1, dth1, th2, dth2] = state
        const dth1_ = (m2 * g * sin(th2) * cos(th1 - th2) - m2 * l1 * dth1 ** 2 * sin(th1 - th2) * cos(th1 - th2) - m2 * l2 * dth2 ** 2 * sin(th1 - th2) - (m1 + m2) * g * sin(th1)) / (l1 * (m1 + m2 * sin(th1 - th2) ** 2))
        const dth2_ = ((m1 + m2) * (l1 * dth1 ** 2 * sin(th1 - th2) - g * sin(th2) + g * sin(th1) * cos(th1 - th2)) + m2 * l2 * dth2 ** 2 * sin(th1 - th2) * cos(th1 - th2)) / (l2 * (m1 + m2 * sin(th1 - th2) ** 2))
        return [dth1, dth1_, dth2, dth2_]
    }

    return {

        integrate() {
            const state = [_th1, _dth1, _th2, _dth2]
            const newState = integrateRK4(state, 0, 0.01, derive)
            _th1 = newState[0]
            _dth1 = newState[1]
            _th2 = newState[2]
            _dth2 = newState[3]
        },

        /**
         * Renders the double pendulum
         * @param c {CanvasRenderingContext2D}
         * @param width {Number}
         * @param height {Number}
         */
        render(c, width, height) {
            // TODO: scale inner plane to screen
            const origin = [width / 2, height / 3]
            const scale = width / 4
            const x1 = origin[0] + l1 * scale * sin(_th1)
            const y1 = origin[1] + l1 * scale * cos(_th1)
            const x2 = x1 + l2 * scale * sin(_th2)
            const y2 = y1 + l2 * scale * cos(_th2)

            c.strokeStyle = GREEN
            c.lineWidth = 4
            c.beginPath()
            c.moveTo(...origin)
            c.lineTo(x1, y1)
            c.lineTo(x2, y2)
            c.stroke()

            c.fillStyle = ROSE
            c.beginPath()
            c.ellipse(origin[0], origin[1], 10, 10, 0, 0, 2 * pi)
            c.fill()

            c.fillStyle = BLUE
            c.beginPath()
            c.ellipse(x1, y1, 10, 10, 0, 0, 2 * pi)
            c.fill()

            c.fillStyle = DARK_BLUE
            c.beginPath()
            c.ellipse(x2, y2, 10, 10, 0, 0, 2 * pi)
            c.fill()
        }
    }

}

const pendulum = Pendulum(1.25, 0.25, pi / 4, 0, 0.75, 0.15, pi / 12, 0)

const sketch = ({canvas}) => {

    return ({context: c, width, height}) => {

        c.fillStyle = '#000'
        c.fillRect(0, 0, width, height)

        pendulum.render(c, width, height)

        if (!paused) {
            pendulum.integrate()
        }
    }
}


canvasSketch(sketch, settings)

window.addEventListener('click', _ => paused = !paused)
