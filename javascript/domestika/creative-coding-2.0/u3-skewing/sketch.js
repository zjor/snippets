const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random')
const {degToRad} = require('canvas-sketch-util/math')

const skewedRect = ({g, w = 600, h = 200, degrees = -15}) => {
    const rx = Math.cos(degToRad(degrees)) * w
    const ry = Math.sin(degToRad(degrees)) * w
    g.save()
    g.translate(-rx / 2, -(ry + h) / 2)
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(rx, ry)
    g.lineTo(rx, ry + h)
    g.lineTo(0, h)
    g.closePath()
    g.stroke()
    g.restore()
}

const settings = {
    dimensions: [1080, 1080],
    animate: false
};

const sketch = ({width, height}) => {
    let x, y, w, h;

    const rects = []
    for (let i = 0; i < 25; i++) {
        const x = random.range(0, width)
        const y = random.range(0, height)
        const w = random.range(200, 600)
        const h = random.range(100, 300)
        rects.push({x, y, w, h})
    }

    return ({context: g, width, height}) => {
        g.fillStyle = 'white';
        g.fillRect(0, 0, width, height);

        g.strokeStyle = 'blue';

        rects.forEach(rect => {
            const {x, y, w, h} = rect
            g.save()
            g.translate(x, y)
            skewedRect({g, w, h})
            g.restore();
        })

    };
};

canvasSketch(sketch, settings);
