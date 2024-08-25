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

module.exports = {
    palette: getFlamePalette()
}