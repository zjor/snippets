/**
 *
 * @param c {CanvasRenderingContext2D}
 * @param model {Object}
 */
function renderDxf(c, model) {
    c.beginPath()

    for (const e of model.entities) {
        console.log(e)
        if (e.type === "CIRCLE") {
            const {x, y} = e.center
            const {radius: r} = e
            c.beginPath()
            c.ellipse(x, y, r, r, 0, 0, 2 * pi)
            // c.stroke()
        } else if (e.type === "LINE") {
            const vs = e.vertices
            c.beginPath()
            c.moveTo(vs[0].x, vs[0].y)
            for (let i = 1; i < vs.length; i++) {
                c.lineTo(vs[i].x, vs[i].y)
            }
            // c.stroke()
        } else if (e.type === "ARC") {
            const {x, y} = e.center
            const {radius, startAngle, endAngle} = e
            c.beginPath()
            c.arc(x, y, radius, startAngle, endAngle)
            // c.stroke()
        }
    }
    c.closePath()
    // c.stroke()
}

module.exports = {
    renderDxf
}