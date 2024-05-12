/**
 *
 * @param x {Number}
 * @param y {Number}
 * @constructor
 */
const Vector = (x, y) => {
    let _x = x
    let _y = y

    return {
        get x() {
            return _x
        },
        set x(v) {
            _x = v
        },
        get y() {
            return _y
        },
        set y(v) {
            _y = v
        },
        length() {
            return Math.sqrt(_x ** 2 + _y ** 2)
        },
        /**
         *
         * @param v {Vector}
         * @returns {Vector}
         */
        minus(v) {
            return Vector(_x - v.x, _y - v.y)
        },
        normalize() {
            const l = this.length()
            return Vector(_x / l, _y / l)
        }
    }
}

module.exports = {
    Vector
}