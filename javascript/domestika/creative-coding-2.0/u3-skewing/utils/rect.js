const random = require('canvas-sketch-util/random')
const {degToRad} = require('canvas-sketch-util/math')
const Color = require('canvas-sketch-util/color')

class Rect {
  constructor({x, y, v, w, h, skewness, fill, stroke, blend, canvasWidth, canvasHeight, rectColors, freqBin = -1}) {
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

    this.freqBin = freqBin

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
    const v = random.range(0.3, 1.6) * random.pick([-1, 1])
    return {x, y, w, h, fill, stroke, blend, v, canvasWidth, canvasHeight, rectColors}
  }

}

module.exports = Rect
