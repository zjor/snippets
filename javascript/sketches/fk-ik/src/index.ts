import canvasSketch from 'canvas-sketch'
import {drawPieCircle, drawArmLink} from "./geometry";

const canvas = document.getElementById('canvas')

const settings = {
    canvas,
    dimensions: [ 1080, 1080 ],
    animate: false
};

const sketch = ({context, width, height}) => {
    console.log("Sketch called")
    return ({context: CanvasRenderingContext2D, width, height}) => {
        console.log("Rendering...")
        context.fillStyle = "#000";
        context.fillRect(0, 0, width, height);
        context.save()
        context.translate(width / 2, height / 2);
        drawArmLink(context, 50, 30, 150, Math.PI / 3, 4, '#50f3de')
        drawPieCircle(context, 20, 4, '#fae495');
        context.restore();
    }
}

let manager: any
const start = async () => {
    manager = await canvasSketch(sketch, settings);
};

start().catch(console.error);