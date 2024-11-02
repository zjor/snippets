import canvasSketch from 'canvas-sketch'
import {drawPieCircle, drawArmLink} from "./geometry"
import {Robot, solveInverseKinematics} from "./kinematics"
import {CircularBuffer} from "./util";

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

type ParametricFunction = (t: number) => [x: number, y: number, phi: number]

const GetLineParametricFunction = (start: Point, end: Point): ParametricFunction => {
    return t => {
        const x = start[0] + (end[0] - start[0]) * t
        const y = start[1] + (end[1] - start[1]) * t
        // TODO: EE should be normal to the line
        return [x, y, pi/2]
    }
}

const GetHeartParametricFunction = (origin: Point): ParametricFunction => {
    const [a, b] = [0.5, -2.5]
    const [scaleX, scaleY] = [10, 10]
    return t => {
        t = 2 * pi * t
        const x = scaleX * (16 * sin(t) ** 3 + a * sin(2 * t))
        const y = scaleY * (13 * cos(t) - 5 * cos(2 * t) - 2 * cos(3 * t) - cos(4 * t) + b * sin(t))
        return [origin[0] + x, origin[1] + y, pi/2]
    }
}

const ParametricAnimation = (duration: number, func: ParametricFunction, isDrawing: boolean = false) => {
    return (start: number) => {
        return  {
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

const [tx, ty, _] = GetHeartParametricFunction([200, 250])(0)

const animationQueueTemplate = CircularBuffer([
    ParametricAnimation(500, GetLineParametricFunction([150, 50], [tx, ty]), false),
    ParametricAnimation(4000, GetHeartParametricFunction([200, 250]), true),
    ParametricAnimation(500, GetLineParametricFunction([tx, ty], [150, 50]), false),
])


const drawing = []

const robot: Robot = {
    th1: pi / 3,
    th2: pi * 3 / 4,
    th3: -pi / 2,
    l1: 250,
    l2: 200,
    l3: 150,
}

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

const sketch = ({context, width, height}) => {
    let eeX = 150
    let eeY = 50
    let phi = 0
    let now = Date.now()

    let currentAnimation = animationQueueTemplate.next()(now, eeX, eeY, phi)

    return ({context: CanvasRenderingContext2D, width, height}) => {
        now = Date.now()

        if (currentAnimation.isOver(now)) {
            currentAnimation = animationQueueTemplate.next()(now, eeX, eeY, phi)
        } else {
            const [eX, eY, ePhi] = currentAnimation.getState(now)
            eeX = eX
            eeY = eY
            phi = ePhi

            if (currentAnimation.isDrawing) {
                drawing.push([eX, eY])
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
        context.fillStyle = `rgba(255, 165, 0, 0.5)`
        for (let [x, y] of drawing) {
            context.beginPath()
            context.ellipse(x, -y, 10, 10, 0, 0, 2 * pi)
            context.fill()
        }

        drawBase(context, 80, 4, GREEN)
        drawRobot(context)

        // draw end-effector
        context.fillStyle = PINK
        context.beginPath()
        context.ellipse(eeX, -eeY, 10, 10, 0, 0, 2 * pi)
        context.fill()


        context.restore();
    }
}

let manager: any
const start = async () => {
    manager = await canvasSketch(sketch, settings);
};

start().catch(console.error);

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