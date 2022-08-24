const canvasSketch = require('canvas-sketch');
const { rotation, translation, dot } = require('./matrix-utils')

const cycles = 512
const dotsPerCycle = 64
const iterations = cycles * dotsPerCycle
const angleStep = Math.PI * 2 / dotsPerCycle

const w = 2048, h = 2048

let translationX = 60, translationY = 120
const a = 512, b = 256
const aScaler = 32, bScaler = 32
const rotScaler = 24

const settings = {
  dimensions: [ w, h ],
};

const sketch = () => {

  const xs = []
  const ys = []

  for (let i = 0; i < iterations; i++) {
    const _a = a * Math.sin(angleStep * i / aScaler)
    const _b = b * Math.sin(angleStep * i / bScaler)

    const x = _a * Math.cos(angleStep * i)
    const y = _b * Math.sin(angleStep * i)
    const trans = translation(translationX, translationY)
    const rot = rotation(angleStep * i / rotScaler)
    const _v = dot(rot, dot(trans, [x, y, 1]))
    xs.push(_v[0] + w / 2)
    ys.push(_v[1] + h / 2)
  }


  return ({ context, width, height }) => {
    context.lineWidth = 0.1
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.moveTo(xs[0], ys[0])
    for (let i = 1; i < xs.length; i++) {
      context.lineTo(xs[i], ys[i])
    }
    context.stroke();
  };

};

canvasSketch(sketch, settings);
