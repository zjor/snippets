const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random')
const Color = require('canvas-sketch-util/color')
const {degToRad} = require('canvas-sketch-util/math')
const risoColors = require('riso-colors')

const hexToRgba = (hex, alpha = 1) => {
  hex = hex.toUpperCase();

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const withContext = (context, func) => {
  context.save()
  func(context)
  context.restore()
}

const getPolygonPoints = ({x, y, r, sides = 3}) => {
  const points = []
  for (let i = 0; i < sides; i++) {
    const angle = 2 * i * Math.PI / sides - Math.PI / 2
    const [_x, _y] = [r * Math.cos(angle), r * Math.sin(angle)]
    points.push({x: x + _x, y: y + _y})
  }
  return points
}

const drawPolygon = ({context, x, y, r, sides = 3}) => {
  context.beginPath()
  let points = getPolygonPoints({x, y, r, sides})

  context.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < sides; i++) {
    const {x, y} = points[i]
    context.lineTo(x, y)
  }
  context.closePath()
  context.stroke()
}

const drawStencil = ({g, x, y, r, sides, width, height, fillStyle}) => {
  g.beginPath();

  //outer shape, clockwise
  g.moveTo(0, 0);
  g.lineTo(width, 0);
  g.lineTo(width, height);
  g.lineTo(0, height);
  g.closePath();

  // inner shape (hole), counter-clockwise
  const points = getPolygonPoints({x, y, r, sides}).reverse()
  const {x: x0, y: y0} = points[0]
  g.moveTo(x0, y0)
  points.slice(1).forEach(({x, y}) => g.lineTo(x, y))
  g.closePath()

  g.fillStyle = fillStyle
  g.fill()
}

const settings = {
  dimensions: [1080, 1080],
  animate: true
};

const sketch = ({width, height}) => {

  random.setSeed(561)

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
    g.lineWidth = 20

    const scale = Math.cos(frame / 5) * 0.1 + 1;
    rects.forEach((rect, index) => {
      rect.draw(g, (index % 3 == 1) ? scale : 1.0)
      rect.advance()
      if (rect.hasEscaped(width)) {
        rect.regenerate()
      }
    })

    g.restore()

    withContext(g, g => {
      g.globalCompositeOperation = 'color-burn'
      g.strokeStyle = rectColors[0]
      g.lineWidth = lineWidth

      drawPolygon({context: g, x, y, r: r - lineWidth, sides})
    })

    withContext(g, g => {
      g.strokeStyle = 'black'
      drawPolygon({context: g, x, y, r, sides})
      g.globalCompositeOperation = 'source-over'
    })

    drawStencil({g, x, y, r, sides, width, height, fillStyle: hexToRgba(bgColor, 0.8)})

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

  drawSkewedRect(g, scale = 1) {
    g.fillStyle = this.fill;
    g.strokeStyle = this.stroke;

    g.save()

    const [c, s] = [Math.cos(degToRad(this.skewness)), Math.sin(degToRad(this.skewness))]
    const [rx, ry] = [c * this.w * scale, s * this.w * scale]
    const h = this.h * scale

    g.translate(-rx / 2, -(ry + h) / 2)
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(rx, ry)
    g.lineTo(rx, ry + h)
    g.lineTo(0, h)
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

  draw(context, scale = 1) {
    context.save()
    context.translate(this.x, this.y)
    this.drawSkewedRect(context, scale)
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
    const {
      x,
      y,
      w,
      h,
      fill,
      stroke,
      blend,
      v
    } = Rect.generateParams(this.canvasWidth, this.canvasHeight, this.rectColors)
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
