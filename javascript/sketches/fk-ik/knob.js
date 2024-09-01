const {sin, cos, PI: pi} = Math

const Knob = (initialState) => {
    const gaugeRadius = 150
    const knobRadius = 25

    let state = initialState
    let knobPressed = false
    let kx = gaugeRadius * cos(pi - state)
    let ky = -gaugeRadius * sin(state)

    return {
        /**
         *
         * @param c {CanvasRenderingContext2D}
         */
        render(c) {
            c.strokeStyle = 'red'
            c.lineWidth = 4
            c.beginPath()
            c.arc(0, 0, gaugeRadius, 0, pi, true)
            c.stroke()

            c.beginPath()
            c.ellipse(kx, ky, knobRadius, knobRadius, 0, 0, 2 * pi)
            c.closePath()
            c.fillStyle = knobPressed ? 'red' : 'black'
            c.fill()
            c.stroke()
        },
        mouseDown(x, y) {
            const d = Math.sqrt((x - kx) ** 2 + (y - ky) ** 2)
            knobPressed = (d <= knobRadius)
        },
        mouseMoved(x, y) {

        },
        mouseUp() {
            knobPressed = false
        }
    }
}

module.exports = {
    Knob,
}