const canvas = document.querySelector('#canvas')
const ctx = canvas.getContext('2d')

const M_2PI = Math.PI * 2

let [width, height] = [0, 0]
let [cx, cy] = [0, 0]

const resizeObserver = new ResizeObserver(() => {
  width = Math.round(canvas.clientWidth * devicePixelRatio)
  height = Math.round(canvas.clientHeight * devicePixelRatio)
  canvas.width = width
  canvas.height = height
  cx = width / 2
  cy = height / 2
});

resizeObserver.observe(canvas);

const bgColor = '#04070A'
const bgGradientStartColor = '#0C2C3E'
const brightBlueColor = '#91E8FB'
const primaryBlueColor = '#2DAEF7'
const secondaryBlueColor = '#023D4A'
const pinkColor = '#F0B7AE'
const textColor = '#F8F7F7'

const heartRadius = 160

function render(time) {

  const bgGradient = ctx.createRadialGradient(cx, cy, heartRadius, cx, cy, 480)
  bgGradient.addColorStop(0, bgGradientStartColor)
  bgGradient.addColorStop(1, bgColor)

  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, width, height)

  drawCircle(cx, cy, heartRadius, 4, pinkColor, 12)
  drawCircle(cx, cy, heartRadius * 1.5, 3, brightBlueColor)
  drawCircle(cx, cy, heartRadius * 2.5, 2, secondaryBlueColor)

  drawText(cx, cy, '67', 60, textColor)
  drawText(cx, cy + 60, 'BPM', 60, textColor)

  requestAnimationFrame(render)
}

requestAnimationFrame(render)

function drawCircle(x, y, r, lineWidth, color, shadowBlur = 0) {
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.beginPath()
  ctx.ellipse(x, y, r, r, 0, 0, M_2PI)
  ctx.shadowColor = color
  ctx.shadowBlur = shadowBlur
  ctx.stroke()
  ctx.shadowBlur = 0
}

function drawText(x, y, text, size, color) {
  ctx.fillStyle = color
  ctx.font = `normal ${size}px monospace`
  let m = ctx.measureText(text)
  ctx.shadowColor = color
  ctx.shadowBlur = 25
  ctx.fillText(text, x - m.width / 2, y)
  ctx.shadowBlur = 0
}


