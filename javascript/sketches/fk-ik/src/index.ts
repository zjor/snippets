import canvasSketch from 'canvas-sketch'
import {drawArmLink, drawPieCircle} from "./geometry"
import {Robot, solveInverseKinematics} from "./kinematics"
import {CircularBuffer, StoppableTime} from "./util";

const {PI: pi, sin, cos} = Math

const canvas = document.getElementById('canvas')

const BLACK = '#000'
const GREEN = '#01DC03' // rgb(1, 220, 3)
const DARK_GREEN = '#017A02'
const BLUE = '#12B8FF' // rgb(18, 184, 255)
const DARK_BLUE = '#0C88B2'
const ROSE = '#FD4499'
const RED = '#CF0000'
const ORANGE = '#FFA500' // rgb(255, 165, 0)
const YELLOW = '#FFE62D'
const PINK = '#DF19FB'

const robot: Robot = {
    th1: pi / 3,
    th2: pi * 3 / 4,
    th3: -pi / 2,
    l1: 250,
    l2: 200,
    l3: 150,
    unsolvable: false
}

function shuffle<T>(array: T[]): T[] {
    const clone = [...array];
    for (let i = clone.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [clone[i], clone[randomIndex]] = [clone[randomIndex], clone[i]];
    }
    return clone;
}

function easeInOut(t: number): number {
    if (t < 0.5) {
        return 2 * t * t;
    } else {
        return 1 - 2 * (1 - t) * (1 - t);
    }
}

function circleEaseInOut(t: number): number {
    return Math.sqrt(1 - (t - 1) ** 2)
}

function sineEaseInOut(t: number): number {
    return sin(t * pi / 2)
}

type Point = [number, number]

type CurveFunction = (t: number) => [x: number, y: number]
type ParametricFunction = (t: number) => [x: number, y: number, phi: number]

function getNormalAngle(start: Point, end: Point, reverse: boolean = false): number {
    const [x1, y1] = start
    const [x2, y2] = end
    const a = y2 - y1
    const b = -(x2 - x1)
    return reverse ? Math.atan2(-b, -a) : Math.atan2(b, a)
}

const GetLineParametricFunction = (start: Point, end: Point, reverseNormal: boolean = false): ParametricFunction => {
    const [x1, y1] = start
    const [x2, y2] = end
    return t => {
        const x = x1 + (x2 - x1) * t
        const y = y1 + (y2 - y1) * t
        return [x, y, getNormalAngle(start, end, reverseNormal)]
    }
}

const GetPhiSolver = (
    func: CurveFunction,
    bestCandidateFunc: (t: number) => number
    ): (t: number) => number => {

    const CONTROL_POINTS = 2
    const points = []
    for (let i = 0; i <= CONTROL_POINTS; i++) {
        const t = i / CONTROL_POINTS
        const [x, y] = func(t)
        const candidates = [bestCandidateFunc(t)]
        for (let j = candidates[0]; j < candidates[0] + pi; j += pi / 12) {
            candidates.push(j)
        }

        for (let phi of candidates) {
            const state = solveInverseKinematics(x, y, phi, robot)
            if (!state.unsolvable) {
                points.push(phi)
                break
            }
        }
    }

    return t => {
        const iStart = Math.floor(t * CONTROL_POINTS)
        const iEnd = Math.ceil(t * CONTROL_POINTS)
        const [phiStart, phiEnd] = [points[iStart], points[iEnd]]
        return phiStart + (phiEnd - phiStart) * (t * CONTROL_POINTS - Math.floor(t * CONTROL_POINTS))
    }

}

const GetCircularParametricFunction = (center: Point, radius: number): ParametricFunction => {
    const curveFunc: CurveFunction = (t: number) => {
        t = 2 * pi * t
        return [
            center[0] + radius * cos(t),
            center[1] + radius * 0.5 * sin(t)
        ]
    }

    const phiSolver = GetPhiSolver(curveFunc, t => Math.atan2(sin(2 * pi * t), 0.5 * cos(2 * pi * t)))

    return t => {
        const [x, y] = curveFunc(t)
        return [x, y, phiSolver(t)]
    }
}

const GetEndEffectorRotationFunction = (position: Point, startAngle: number, endAngle: number): ParametricFunction => {
    return t => {
        return [position[0], position[1], startAngle + (endAngle - startAngle) * t]
    }
}

const GetHeartParametricFunction = (origin: Point): ParametricFunction => {
    const [a, b] = [0.5, -2.5]
    const [scaleX, scaleY] = [10, 10]
    const curveFunc: CurveFunction = t => {
        t = 2 * pi * t
        const x = scaleX * (16 * sin(t) ** 3 + a * sin(2 * t))
        const y = scaleY * (13 * cos(t) - 5 * cos(2 * t) - 2 * cos(3 * t) - cos(4 * t) + b * sin(t))
        return [origin[0] + x, origin[1] + y]
    }
    const phiSolver = GetPhiSolver(curveFunc, t => Math.atan2(sin(2 * pi * t), 0.5 * cos(2 * pi * t)))

    return t => {
        const [x, y] = curveFunc(t)
        return [x, y, phiSolver(t)]
    }

}

const ParametricAnimation = (duration: number, func: ParametricFunction, isDrawing: boolean = false) => {
    return (start: number) => {
        return {
            isOver(now: number): boolean {
                return start + duration <= now
            },
            getState(now: number): [number, number, number] {
                const t = this.isOver(now) ? 1.0 : sineEaseInOut((now - start) / duration)
                return func(t)
            },
            get isDrawing(): boolean {
                return isDrawing
            }
        }
    }
}

const MoveToAnimation = (duration: number, eX: number, eY: number, ePhi: number, isDrawing: boolean = false) => {
    return (startTime: number, sX: number, sY: number, sPhi: number) => {
        return {
            isOver(now: number): boolean {
                return startTime + duration <= now
            },
            getState(now: number): [number, number, number] {
                if (this.isOver(now)) {
                    return [eX, eY, ePhi]
                }
                const t = sineEaseInOut((now - startTime) / duration)
                return [
                    sX + (eX - sX) * t,
                    sY + (eY - sY) * t,
                    sPhi + (ePhi - sPhi) * t,
                ]
            },
            get isDrawing(): boolean {
                return isDrawing
            }
        }
    }
}

// const animationQueueTemplate = CircularBuffer([
//     MoveToAnimation(500, 200, 250, 0),
//     MoveToAnimation(1000, -200, 250, pi * 3 / 4, true),
//     MoveToAnimation(1500, 0, 450, pi / 2, true),
//     MoveToAnimation(1500, 200, 250, pi / 3, true),
//     MoveToAnimation(500, 200, 150, 0),
// ])

const startPoint: Point = [200, 100]
const endPoint: Point = [200, 350]
const [tx, ty, _] = GetHeartParametricFunction(endPoint)(0)

const normalAngle = getNormalAngle(endPoint, startPoint)
const normalAngleReversed = getNormalAngle(endPoint, startPoint, true)

// const animationQueueTemplate = CircularBuffer([
//     ParametricAnimation(2000, GetLineParametricFunction(endPoint, startPoint), false),
//     ParametricAnimation(1500, GetEndEffectorRotationFunction(startPoint, normalAngle, normalAngleReversed), false),
//     // ParametricAnimation(4000, GetHeartParametricFunction([200, 250]), true),
//     ParametricAnimation(2000, GetLineParametricFunction(startPoint, endPoint), true),
//     ParametricAnimation(1500, GetEndEffectorRotationFunction(endPoint, normalAngleReversed, normalAngle), false),
// ])

const animationQueueTemplate = CircularBuffer([
    // ParametricAnimation(2000, GetLineParametricFunction(startPoint, endPoint), false),
    // ParametricAnimation(5000, GetCircularParametricFunction(endPoint, 200), true)
    ParametricAnimation(3000, GetLineParametricFunction(startPoint, [tx, ty]), false),
    ParametricAnimation(4000, GetHeartParametricFunction(endPoint), true),
    ParametricAnimation(3000, GetLineParametricFunction([tx, ty], startPoint, true), false),
])


const drawing = []

function drawRobot(c: CanvasRenderingContext2D) {
    c.save()

    c.rotate(-robot.th1)
    drawArmLink(c, 60, 45, robot.l1, 2, ORANGE)
    drawPieCircle(c, 15, 1, YELLOW)

    c.translate(robot.l1, 0)
    c.rotate(-robot.th2)
    drawArmLink(c, 45, 35, robot.l2, 2, ORANGE)
    drawPieCircle(c, 15, 1, YELLOW)

    c.translate(robot.l2, 0)
    c.rotate(-robot.th3)
    drawArmLink(c, 35, 25, robot.l3, 2, ORANGE)
    drawPieCircle(c, 15, 1, YELLOW)

    c.restore()
}

function drawBase(c: CanvasRenderingContext2D, r: number, lineWidth: number, color: string) {
    c.beginPath()
    c.arc(0, 0, r, 0, pi, true)
    c.lineTo(-r, r)
    c.lineTo(r, r)
    c.closePath()
    c.strokeStyle = color
    c.lineWidth = lineWidth
    c.stroke()
    c.strokeRect(-r * 1.5, r, 3 * r, r / 3)
}

const settings = {
    canvas,
    dimensions: [1080, 1080],
    animate: true
};

const time = StoppableTime(true)

const sketch = ({context, width, height}) => {
    let eeX = 150
    let eeY = 50
    let phi = 0
    // TODO: treat time as something that could be stopped
    let now = time.now()

    let currentAnimation = animationQueueTemplate.next()(now, eeX, eeY, phi)

    return ({context: CanvasRenderingContext2D, width, height, frame}) => {
        now = time.now()

        if (currentAnimation.isOver(now)) {
            currentAnimation = animationQueueTemplate.next()(now, eeX, eeY, phi)
        } else {
            const [eX, eY, ePhi] = currentAnimation.getState(now)
            eeX = eX
            eeY = eY
            phi = ePhi

            if (currentAnimation.isDrawing) {
                drawing.push([eX, eY, frame])
            }
        }

        const state = solveInverseKinematics(eeX, eeY, phi, robot)
        robot.th1 = state.th1
        robot.th2 = state.th2
        robot.th3 = state.th3

        context.fillStyle = BLACK;
        context.fillRect(0, 0, width, height);
        context.save()
        context.translate(width / 2, height / 2);

        // draw scene
        for (let i = 0; i < drawing.length; i++) {
            const [x, y, creationFrame] = drawing[i]
            const age = 1 - 0.01 * (frame - creationFrame)
            context.beginPath()
            context.ellipse(x, -y, 10, 10, 0, 0, 2 * pi)
            context.fillStyle = `rgba(253, 68, 153, ${age})`
            context.fill()
        }

        drawBase(context, 80, 4, GREEN)
        drawRobot(context)

        // draw end-effector
        context.fillStyle = currentAnimation.isDrawing ? ROSE : BLACK
        context.beginPath()
        context.ellipse(eeX, -eeY, 10, 10, 0, 0, 2 * pi)
        context.fill()
        context.strokeStyle = ROSE
        context.stroke()

        context.restore();
    }
}

let manager: any
const start = async () => {
    manager = await canvasSketch(sketch, settings);
};

start().catch(console.error);

window.addEventListener('click', _ => time.toggleStop())

/*
 TODO:
 - encode different state-actions as functions:
    - draw on/off
    - choose color
    - fade out scene
    - pause
    - terminate animation loop
 - find an angle to ensure state consistency, should be close to the previous angle
 - find solvable trajectory (angle should allow for the solution existence along the way)
 - vectorize drawn segments, vectorize the segment being drawn but not complete
 - find a parametric description of a heart
 - try shaders to make certain part of a scene glow
 - support pause animations
 */