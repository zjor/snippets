export function CircularBuffer(coll: Array<any>) {
    let i = 0
    return {
        next: function (): any {
            if (coll.length == 0) {
                return undefined
            }
            const el = coll[i++]
            if (i >= coll.length) {
                i = 0
            }
            return el
        }
    }

}