const _padding = 16
const _fontSize = 18
const _labelFont = `${_fontSize}px monospace`
const _labelLeftPadding = 48
const _plotColor = '#12B8FF'
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

    return {
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



        }
    }
}

module.exports = {
    Plot
}