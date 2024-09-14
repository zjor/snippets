const {sin, cos, atan2, sqrt} = Math

export interface RobotState {
    th1: number
    th2: number
    th3: number
}

export interface Robot extends RobotState {
    l1: number
    l2: number
    l3: number
}

export function solveInverseKinematics(x: number, y: number, phi: number, robot: Robot): RobotState {
    const {l1, l2, l3} = robot

    const x1 = x - l3 * cos(phi)
    const y1 = y - l3 * sin(phi)
    const d = (x1 ** 2 + y1 ** 2 - l1 ** 2 - l2 ** 2) / (2 * l1 * l2)

    const th2 = atan2(sqrt(1 - d ** 2), d)
    const th1 = atan2(y1, x1) - atan2(l2 * sin(th2), l1 + l2 * cos(th2))
    const th3 = phi - th1 - th2
    return {
        th1, th2, th3
    }
}

