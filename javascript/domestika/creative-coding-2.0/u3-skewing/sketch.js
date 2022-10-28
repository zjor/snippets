const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random')
const Color = require('canvas-sketch-util/color')
const {degToRad} = require('canvas-sketch-util/math')
const risoColors = require('riso-colors')

const drawPolygon = ({context, x, y, r, sides = 3}) => {
  context.translate(x, y)
  context.beginPath()
  context.moveTo(0, -r)
  for (let i = 0; i < sides; i++) {
    const angle = 2 * i * Math.PI / sides - Math.PI / 2
    context.lineTo(r * Math.cos(angle), r * Math.sin(angle))
  }
  context.closePath()
  context.stroke()
}

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
  animate: true
};

const sketch = ({width, height}) => {

  random.setSeed(560)

  const bgColor = random.pick(risoColors).hex

  const rectColors = [
    random.pick(risoColors).hex,
    random.pick(risoColors).hex,
    random.pick(risoColors).hex,
  ]

  const mask = {
    x: width * 0.5,
    y: height * 0.58,
    r: 500,
    sides: 3,
    lineWidth: 20
  }

  const rects = []
  for (let i = 0; i < 15; i++) {
    const params = Rect.generateParams(width, height, rectColors)
    rects.push(new Rect({...params, skewness: -15}))
  }

  return ({context: g, width, height, frame}) => {
    const {x, y, r, sides, lineWidth} = mask
    g.fillStyle = bgColor;
    g.fillRect(0, 0, width, height);
    g.save()
    drawPolygon({context: g, x, y, r, sides})
    g.clip()
    g.lineWidth = 20

    g.translate(-x, -y)

    rects.forEach(rect => {
      rect.draw(g)
      rect.advance()
      if (rect.hasEscaped(width)) {
        rect.regenerate()
      }
    })

    g.restore()

    g.globalCompositeOperation = 'color-burn'
    g.strokeStyle = rectColors[0]
    g.lineWidth = lineWidth

    drawPolygon({context: g, x, y, r: r - lineWidth, sides})

  };
};

canvasSketch(sketch, settings);

class Rect {
  constructor({x, y, v, w, h, skewness, fill, stroke, blend, canvasWidth, canvasHeight, rectColors}) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.skewness = skewness
    this.fill = fill
    this.stroke = stroke
    this.blend = blend

    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    this.rectColors = rectColors

    const [c, s] = [Math.cos(degToRad(skewness)), Math.sin(degToRad(skewness))]

    this.vx = c * v
    this.vy = s * v
  }

  drawSkewedRect(g) {
    g.fillStyle = this.fill;
    g.strokeStyle = this.stroke;

    g.save()

    const [c, s] = [Math.cos(degToRad(this.skewness)), Math.sin(degToRad(this.skewness))]
    const [rx, ry] = [c * this.w, s * this.w]

    g.translate(-rx / 2, -(ry + this.h) / 2)
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(rx, ry)
    g.lineTo(rx, ry + this.h)
    g.lineTo(0, this.h)
    g.closePath()

    g.globalCompositeOperation = this.blend
    g.fill()
    const shadowColor = Color.offsetHSL(this.fill, 0, 0, -20)
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

  draw(context) {
    context.save()
    context.translate(this.x, this.y)
    this.drawSkewedRect(context)
    context.restore()
  }

  advance() {
    this.x += this.vx
    this.y += this.vy
  }

  hasEscaped(canvasWidth) {
    return (this.x + this.w / 2) < 0 || (this.x - this.w / 2) > canvasWidth
  }

  regenerate() {
    const {x, y, w, h, fill, stroke, blend, v} = Rect.generateParams(this.canvasWidth, this.canvasHeight, this.rectColors)
    this.x = v > 0 ? -w / 2 : this.canvasWidth + w / 2
    this.y = y
    this.w = w
    this.h = h
    this.fill = fill
    this.stroke = stroke
    this.blend = blend
    this.v = v
  }

  static generateParams(canvasWidth, canvasHeight, rectColors) {
    const x = random.range(0, canvasWidth)
    const y = random.range(0, canvasHeight)
    const w = random.range(200, 600)
    const h = random.range(100, 300)
    const fill = random.pick(rectColors)
    const stroke = random.pick(rectColors)
    const blend = random.pick(['overlay', 'source-over'])
    const v = random.range(0.1, 0.9) * random.pick([-1, 1])
    return {x, y, w, h, fill, stroke, blend, v, canvasWidth, canvasHeight, rectColors}
  }

}

/*
TODO:
  - show faded shapes outside clipped area
  - white & red version
  - add sound, increase size on the beat
 */
