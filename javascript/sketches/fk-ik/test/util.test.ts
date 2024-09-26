import {CircularBuffer} from "../src/util"

describe('CircularBuffer', () => {
    it('should return undefined on empty array', () => {
        expect(CircularBuffer([]).next()).toBeUndefined()
    })

    it('should return an element within the first round', () => {
        const buf = CircularBuffer([1, 2, 3])
        buf.next()
        expect(buf.next()).toBe(2)
    })

    it('should roll over', () => {
        const buf = CircularBuffer([1, 2])
        buf.next()
        expect(buf.next()).toBe(2)
        expect(buf.next()).toBe(1)
    })
})