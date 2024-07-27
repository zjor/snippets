const _padding = 16
const _fontSize = 18
const _labelFont = `${_fontSize}px monospace`
const _labelLeftPadding = 48
const _plotColor = '#12B8FF'
const _dataPointsTopBottomPadding = 24
const _maxDataPoints = 200

/**
 *
 * @param c {CanvasRenderingContext2D}
 * @param text {String}
 */
const getTextWidth = (c, font, text) => {
    c.font = font
    const textMetrics = c.measureText(text);
    return textMetrics.width;
}

const Plot = ({top, left, width, height, title}) => {

    top += _padding
    left += _padding
    width -= 2 * _padding
    height -= 2 * _padding

    const data = []
    let minTimestamp = 0
    let maxTimestamp = 0
    let minValue = 1 << 24
    let maxValue = -1 << 24

    function updateMinMax() {
        minValue = 1 << 24
        maxValue = -1 << 24
        for (let dataPoint of data) {
            minValue = Math.min(minValue, dataPoint.v)
            maxValue = Math.max(maxValue, dataPoint.v)
        }
    }

    function scaleToFit(x, min, max, toMin, toMax) {
        if (Math.abs(min - max) > 1e-3) {
            return toMin + (toMax - toMin) * ((x - min) / (max - min))
        } else {
            return x
        }
    }

    /**
     *
     * @param c {CanvasRenderingContext2D}
     */
    function plotData(c) {
        if (data.length < 2) {
            return
        }
        updateMinMax()
        // console.log(minValue, maxValue)
        c.strokeStyle = _plotColor

        c.save()

        c.translate(left, top + height / 2)

        const verticalSpan = height / 2 - _dataPointsTopBottomPadding

        c.beginPath()
        c.moveTo(data[0].ts - minTimestamp, scaleToFit(data[0].v, minValue, maxValue, -verticalSpan, verticalSpan))
        for (let i = 1; i < data.length; i++) {
            const x = (data[i].ts - minTimestamp) * 0.15
            const y = scaleToFit(data[i].v, minValue, maxValue, -verticalSpan, verticalSpan)
            c.lineTo(x, y)
        }
        c.stroke()

        c.restore()
    }

    return {

        /**
         *
         * @param timestamp {Number}
         * @param value {Number}
         */
        appendDataPoint(timestamp, value) {
            data.push({ts: timestamp, v: value})
            while (data.length > _maxDataPoints) {
                data.shift()
            }
            if (data.length > 0) {
                minTimestamp = data[0].ts
                maxTimestamp = data[data.length - 1].ts
            }
        },

        /**
         *
         * @param c {CanvasRenderingContext2D}
         */
        render(c) {
            c.textBaseline = 'bottom'
            c.fillStyle = 'rgba(0, 0, 0, 0.5)'
            c.strokeStyle = _plotColor
            c.lineWidth = 2

            c.beginPath()
            c.roundRect(left, top, width, height, 8)
            c.fill()
            c.stroke()

            const labelWidth = getTextWidth(c, _labelFont, title) + 2 * _padding
            c.fillStyle = '#000'
            c.beginPath()
            c.roundRect(left + _labelLeftPadding, top - 16, labelWidth, 32, 8)
            c.fill()
            c.stroke()

            c.fillStyle = _plotColor
            c.font = _labelFont
            c.fillText(title, left + _labelLeftPadding + _padding, top + _fontSize / 2)

            plotData(c)
        }
    }
}

module.exports = {
    Plot
}