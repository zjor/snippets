const {PI: pi, sqrt, atan} = Math;

export function drawPieCircle(c: CanvasRenderingContext2D, r: number, lineWidth: number, color: string) {
    c.fillStyle = color
    c.strokeStyle = color
    c.lineWidth = lineWidth
    c.beginPath()
    c.ellipse(0, 0, r, r, 0, 0, pi * 2)
    c.stroke()

    c.beginPath()
    c.moveTo(0, 0)
    c.lineTo(r, 0)
    c.arc(0, 0, r, 0, pi / 2)
    c.fill()

    c.beginPath()
    c.moveTo(0, 0)
    c.lineTo(0, r)
    c.arc(0, 0, r, -pi / 2, pi, true)
    c.fill()
}

export function drawArmLink(c: CanvasRenderingContext2D, r1: number, r2: number, l: number, angle: number, lineWidth: number, color: string) {
    const r = 1.3 * l

    const x = l / 2 + (r1 - r2) * (r1 + r2 + 2 * r) / (2 * l)
    const y = Math.sqrt((r1 + r) ** 2 - x ** 2)

    const a = Math.atan(y / x)
    const b = Math.atan(y / (l - x))

    c.strokeStyle = color
    c.lineWidth = lineWidth

    c.save()
    c.rotate(angle)

    c.beginPath()
    c.ellipse(0, 0, r1, r1, 0, a, -a)
    c.arc(x, -y, r, pi - a, b, true)
    c.ellipse(l, 0, r2, r2, 0, b - pi, pi - b)
    c.arc(x, y, r, -b, a - pi, true)
    c.fillStyle = '#000'
    c.fill()
    c.stroke()

    c.beginPath()
    c.ellipse(0, 0, r1 * 0.7, r1 * 0.7, 0, 0, 2 * pi)
    c.lineWidth = lineWidth
    c.stroke()

    c.restore()
}

