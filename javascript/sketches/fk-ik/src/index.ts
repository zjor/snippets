import canvasSketch from 'canvas-sketch'
import {drawPieCircle, drawArmLink} from "./geometry"
import {Robot, solveInverseKinematics} from "./kinematics"

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
    let eeX = 250
    const eeY = 310
    let phi = pi/3
    let t = Date.now()
    return ({context: CanvasRenderingContext2D, width, height}) => {
        t = Date.now()
        eeX = 100 + 150 * sin(t / 400)
        phi = pi/6 + (1 + sin(t / 400)) * pi / 3
        const state = solveInverseKinematics(eeX, eeY, phi, robot)
        robot.th1 = state.th1
        robot.th2 = state.th2
        robot.th3 = state.th3

        context.fillStyle = BLACK;
        context.fillRect(0, 0, width, height);
        context.save()
        context.translate(width / 2, height / 2);
        drawBase(context, 80, 4, GREEN)
        drawRobot(context)

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