const identity = (size) => {
    const zeroes = (new Array(size)).fill(0)
    const matrix = []
    for (let i = 0; i < size; i++) {
        const row = Array.from(zeroes)
        row[i] = 1
        matrix.push(row)
    }
    return matrix
}

const translation = (x, y) => {
    const i = identity(3)
    i[0][2] = x
    i[1][2] = y
    return i
}

const rotation = (angle) => {
    const s = Math.sin(angle)
    const c = Math.cos(angle)
    const i = identity(3)
    i[0][0] = c
    i[0][1] = -s
    i[1][0] = s
    i[1][1] = c
    return i
}

const dot = (m, v) => {
    const r = []
    for (let i = 0; i < v.length; i++) {
        let s = 0
        for (let j = 0; j < v.length; j++) {
            s += m[i][j] * v[j]
        }
        r.push(s)
    }
    return r
}

module.exports = {
    translation, rotation, dot
}
