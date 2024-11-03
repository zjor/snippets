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

export function StoppableTime(isStopped: boolean = false) {
    let delay: number = 0
    let stoppedAt: number = Date.now()
    let stopped: boolean = isStopped
    return {
        now(): number {
            if (stopped) {
                return stoppedAt - delay
            } else {
                return Date.now() - delay
            }
        },
        toggleStop() {
            if (stopped) {
                delay += Date.now() - stoppedAt
                stopped = false
            } else {
                stoppedAt = Date.now()
                stopped = true
            }
        }
    }
}