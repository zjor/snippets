// Vertex Shader Source Code
const vertexShaderSource = `
    attribute vec2 aPosition; // Vertex position (x, y)
    attribute vec3 aColor;    // Initial vertex color (r, g, b)
    uniform float uTime;      // Time uniform for animation
    varying vec3 vColor;      // Pass rotated color to fragment shader

    // Function to convert HSV to RGB
    vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    void main() {
        // Convert initial color to HSV
        float hue = atan(sqrt(3.0) * (aColor.g - aColor.b), 2.0 * aColor.r - aColor.g - aColor.b) / (2.0 * 3.14159265359);
        float saturation = length(aColor - vec3(dot(aColor, vec3(1.0/3.0))));
        float value = dot(aColor, vec3(1.0/3.0));

        // Rotate hue based on time
        hue = mod(hue + uTime * 0.1, 1.0); // Rotate hue over time

        // Convert back to RGB
        vec3 hsvColor = vec3(hue, 1.0, 1.0);
        vColor = hsv2rgb(hsvColor);

        // Set vertex position
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`;

const fragmentShaderSource = `
precision mediump float;
    varying vec3 vColor; // Interpolated color from vertex shader

    void main() {
        gl_FragColor = vec4(vColor, 1.0); // Set pixel color
    }
`;

// Compile Shader Function
function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // Check for compilation errors
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation failed:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Main Function
function main() {
    // Get the canvas element and WebGL context
    const canvas = document.getElementById('gl-canvas');
    let gl = canvas.getContext('webgl', { antialias: false });

    if (!gl) {
        console.error('WebGL not supported, falling back to experimental-webgl');
        gl = canvas.getContext('experimental-webgl');
    }
    if (!gl) {
        console.error('Your browser does not support WebGL');
        return;
    }

    // Compile shaders
    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

    // Create shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // Check for linking errors
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Shader program linking failed:', gl.getProgramInfoLog(shaderProgram));
        return;
    }

    // Use the shader program
    gl.useProgram(shaderProgram);

    const vertices = new Float32Array([
        // Position      // Color
        -0.5, -0.5,     1.0, 0.0, 0.0, // Red (left vertex)
        0.5, -0.5,     0.0, 1.0, 0.0, // Green (right vertex)
        0.0,  0.5,     0.0, 0.0, 1.0  // Blue (top vertex)
    ]);

    // Create a buffer and upload vertex data
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Get the attribute location and enable it
    const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'aPosition');
    const colorAttributeLocation = gl.getAttribLocation(shaderProgram, 'aColor');

    gl.enableVertexAttribArray(positionAttributeLocation)
    gl.vertexAttribPointer(
        positionAttributeLocation, // Location
        2,                        // Size (x, y)
        gl.FLOAT,                 // Type
        false,                    // Normalized
        5 * Float32Array.BYTES_PER_ELEMENT, // Stride (5 elements: x, y, r, g, b)
        0                         // Offset
    );

    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.vertexAttribPointer(
        colorAttributeLocation,   // Location
        3,                        // Size (r, g, b)
        gl.FLOAT,                 // Type
        false,                    // Normalized
        5 * Float32Array.BYTES_PER_ELEMENT, // Stride (5 elements: x, y, r, g, b)
        2 * Float32Array.BYTES_PER_ELEMENT  // Offset (skip x, y)
    );

    const uTimeLocation = gl.getUniformLocation(shaderProgram, 'uTime');

    // Set up the render loop
    let time = 0;
    function render() {
        gl.viewport(0, 0, canvas.width, canvas.height);
        // Update time
        time += 0.01;

        // Clear the canvas
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Pass time to the shader
        gl.uniform1f(uTimeLocation, time);

        // Draw the triangle
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        // Request the next frame
        requestAnimationFrame(render);
    }

    // Start the render loop
    requestAnimationFrame(render);
}

// Run the main function
main();