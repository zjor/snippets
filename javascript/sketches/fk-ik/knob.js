const {sin, cos, PI: pi} = Math

const Knob = (initialState, centerX, centerY, incKey, decKey, mainColor, knobColor) => {
    const gaugeRadius = 100
    const knobRadius = 25

    let state = initialState
    let knobPressed = false
    let kx = gaugeRadius * cos(state)
    let ky = -gaugeRadius * sin(state)

    function setState(angle) {
        state = angle
        kx = gaugeRadius * cos(state)
        ky = -gaugeRadius * sin(state)
    }

    return {
        /**
         *
         * @param c {CanvasRenderingContext2D}
         */
        render(c) {
            c.save()
            c.translate(centerX, centerY)

            c.strokeStyle = mainColor
            c.lineWidth = 3
            c.beginPath()
            c.arc(0, 0, gaugeRadius, 0, pi, true)
            c.stroke()

            c.beginPath()
            c.moveTo(-gaugeRadius - 2 * knobRadius, 0)
            c.lineTo(gaugeRadius + 2 * knobRadius, 0)
            c.stroke()

            const [w, h] = [gaugeRadius, gaugeRadius * 0.5]
            c.beginPath()
            c.roundRect(-w / 2, -h / 2, w, h, 5)
            c.fillStyle = 'black'
            c.fill()
            c.stroke()

            c.font = "24px monospace";
            c.textBaseline = "middle"
            c.fillStyle = mainColor
            let text = `${((pi - state) * 180 / pi).toFixed(1)}°`
            let metrics = c.measureText(text)
            c.fillText(text, -metrics.width / 2, 0)

            text = incKey.toUpperCase()
            metrics = c.measureText(text)
            c.fillText(text, -gaugeRadius - metrics.width / 2, 24 * 2)

            text = decKey.toUpperCase()
            metrics = c.measureText(text)
            c.fillText(text, gaugeRadius - metrics.width / 2, 24 * 2)

            c.strokeStyle = knobColor
            c.beginPath()
            c.ellipse(kx, ky, knobRadius, knobRadius, 0, 0, 2 * pi)
            c.closePath()
            c.fillStyle = knobPressed ? knobColor : 'black'
            c.fill()
            c.stroke()
            c.restore()
        },
        mouseDown(x, y) {
            x -= centerX
            y -= centerY
            const d = Math.sqrt((x - kx) ** 2 + (y - ky) ** 2)
            knobPressed = (d <= knobRadius)
        },
        mouseMoved(x, y) {
            if (!knobPressed) {
                return
            }
            x -= centerX
            y -= centerY
            y = -y
            if (y < 0) {
                if (x >= 0) {
                    y = 0
                } else {
                    setState(pi)
                    return
                }
            }
            let angle = Math.atan(y / x)
            if (angle < 0) {
                angle += pi
            }
            console.log(x, y, angle * 180 / pi)
            setState(angle)

        },
        mouseUp() {
            knobPressed = false
        },
        keyDown(key) {
            const step = 0.05
            if (key == incKey) {
                if (state + step < pi) {
                    setState(state + step)
                }
            } else if (key == decKey) {
                if (state - step > 0) {
                    setState(state - step)
                }
            }
        },
        get state() {
            return state
        },
        set state(angle) {
            while (angle > 2 * pi) {
                angle -= 2 * pi
            }
            while (angle < -2 * pi) {
                angle += 2 * pi
            }

            setState(angle)
        }
    }
}

module.exports = {
    Knob,
}