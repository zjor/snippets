const canvasSketch = require('canvas-sketch')

const settings = {
    dimensions: [1080, 1080],
    animate: true
}

let paused = true

const palette = getFlamePalette()

function getFlamePalette() {
    const colors = [
        [255, 255, 255],  // White
        [255, 255, 0],    // Yellow
        [255, 165, 0],    // Orange
        [255, 0, 0],      // Red
        [0, 0, 255],      // Blue
        [0, 0, 0]         // Black
    ];

    const steps = 256;

    const result = [];
    const numSections = colors.length - 1;
    const stepsPerSection = Math.floor(steps / numSections);

    for (let i = 0; i < numSections; i++) {
        const startColor = colors[i];
        const endColor = colors[i + 1];

        for (let j = 0; j < stepsPerSection; j++) {
            const ratio = j / stepsPerSection;
            const interpolatedColor = startColor.map((start, index) =>
                Math.round((1 - ratio) * start + ratio * endColor[index])
            );
            result.push(interpolatedColor);
        }
    }

    if (result.length < steps) {
        result.push(colors[colors.length - 1]);
    }

    return result;
}

const FLAME_TILE = 4
const FLAME_WIDTH = 1080 / FLAME_TILE
const FLAME_HEIGHT = 1080 / FLAME_TILE
const flame = []

const coolingMap = []

function initFlame() {
    for (let y = 0; y < FLAME_HEIGHT; y++) {
        const row = []
        const cmRow = []
        for (let x = 0; x < FLAME_WIDTH; x++) {
            row.push(255)
            cmRow.push(Math.floor(Math.random() * 32))
        }
        flame.push(row)
        coolingMap.push(cmRow)
    }
}

function coolFlame() {
    for (let y = 0; y < FLAME_HEIGHT; y++) {
        for (let x = 0; x < FLAME_WIDTH; x++) {
            flame[y][x] += coolingMap[y][x]
            if (flame[y][x] > 255) {
                flame[y][x] = 255
            }
        }
    }
}

function generateFlame() {
    const row = []
    for (let x = 0; x < FLAME_WIDTH; x++) {
        row[x] = Math.floor(Math.random() * 196)
    }
    for (let x = 1; x < FLAME_WIDTH - 2; x++) {
        flame[FLAME_HEIGHT - 1][x] = (row[x - 1] + row[x] + row[x + 1] + row[x + 2]) >> 2
    }
}

function blurImage(image) {
    for (let y = 1; y < FLAME_HEIGHT - 1; y++) {
        for (let x = 1; x < FLAME_WIDTH - 1; x++) {
            image[y][x] = (image[y - 1][x] + image[y + 1][x] + image[y][x - 1] + image[y][x + 1]) >> 2
        }
    }
}

function liftUpFlame() {
    for (let y = 0; y < FLAME_HEIGHT - 1; y++) {
        for (let x = 0; x < FLAME_WIDTH; x++) {
            flame[y][x] = flame[y + 1][x]
        }
    }
}

/**
 * Renders frame
 * @param c {CanvasRenderingContext2D}
 * @param width {Number}
 * @param height {Number}
 */
function render(c, width, height) {
    coolFlame()
    liftUpFlame()
    generateFlame()
    blurImage(flame)

    for (let y = 0; y < FLAME_HEIGHT; y++) {
        for (let x = 0; x < FLAME_WIDTH; x++) {
            const [r, g, b] = palette[flame[y][x]]
            c.fillStyle = `rgb(${r}, ${g}, ${b})`
            c.fillRect(x * FLAME_TILE, y * FLAME_TILE, FLAME_TILE, FLAME_TILE)
        }
    }
}

const sketch = ({canvas}) => {
    initFlame()

    for (let i = 0; i < 24; i++) {
        blurImage(coolingMap)
    }

    return ({context: c, width, height}) => {
        if (!paused) {
            render(c, width, height)
        }
    }
}

canvasSketch(sketch, settings)

window.addEventListener('click', _ => paused = !paused)
