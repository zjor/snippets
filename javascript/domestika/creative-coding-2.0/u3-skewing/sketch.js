const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random')
const Color = require('canvas-sketch-util/color')
const {degToRad} = require('canvas-sketch-util/math')
const risoColors = require('riso-colors')

const skewedRect = (g, {w = 600, h = 200, degrees = -15, fill, stroke, blend}) => {
    const rx = Math.cos(degToRad(degrees)) * w
    const ry = Math.sin(degToRad(degrees)) * w
    g.fillStyle = fill;
    g.strokeStyle = stroke;
    g.save()
    g.translate(-rx / 2, -(ry + h) / 2)
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(rx, ry)
    g.lineTo(rx, ry + h)
    g.lineTo(0, h)
    g.closePath()

    g.globalCompositeOperation = blend
    g.fill()
    const shadowColor = Color.offsetHSL(fill, 0, 0, -20)
    shadowColor.rgba[3] = 0.5
    g.shadowColor = Color.style(shadowColor.rgba)
    g.shadowOffsetX = -10
    g.shadowOffsetY = 20

    g.shadowColor = null;
    g.stroke()

    g.globalCompositeOperation = 'source-over'
    g.lineWidth = 2
    g.strokeStyle = 'black'
    g.stroke()

    g.restore()
}

const settings = {
    dimensions: [1080, 1080],
    animate: false
};

const rectColors = [
    random.pick(risoColors).hex,
    random.pick(risoColors).hex,
    random.pick(risoColors).hex,
]

const sketch = ({width, height}) => {

    const rects = []
    for (let i = 0; i < 15; i++) {
        const x = random.range(0, width)
        const y = random.range(0, height)
        const w = random.range(200, 600)
        const h = random.range(100, 300)
        const fill = random.pick(rectColors)
        const stroke = random.pick(rectColors)
        const blend = random.pick(['overlay', 'source-over'])

        rects.push({x, y, w, h, fill, stroke, blend})
    }

    return ({context: g, width, height}) => {
        g.fillStyle = random.pick(risoColors).hex;
        g.fillRect(0, 0, width, height);

        g.lineWidth = 20

        rects.forEach(rect => {
            const {x, y} = rect
            g.save()
            g.translate(x, y)
            skewedRect(g, rect)
            g.restore();
        })

    };
};

canvasSketch(sketch, settings);
