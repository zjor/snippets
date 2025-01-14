// Vertex Shader Source Code
const vertexShaderSource = `
    attribute vec2 aPosition; // Vertex position
    varying vec2 vUv;         // Texture coordinates
    
    void main() {
        vUv = aPosition * 0.5 + 0.5; // Map position to [0, 1] range
        gl_Position = vec4(aPosition, 0.0, 1.0); // Set vertex position
    }
`;

const fragmentShaderSource = `
precision mediump float;
varying vec2 vUv;         // Texture coordinates
uniform float uTime;      // Time for animation

// Simplex noise function (simplified for WebGL)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - 0.5;
    i = mod289(i);
    vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    vec4 j = p - 49.0 * floor(p * (1.0 / 49.0));
    vec4 x_ = floor(j * (1.0 / 7.0));
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = (x_ * 2.0 + 0.5) / 7.0 - 1.0;
    vec4 y = (y_ * 2.0 + 0.5) / 7.0 - 1.0;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 g0 = vec3(a0.xy, h.x);
    vec3 g1 = vec3(a0.zw, h.y);
    vec3 g2 = vec3(a1.xy, h.z);
    vec3 g3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(g0, g0), dot(g1, g1), dot(g2, g2), dot(g3, g3)));
    g0 *= norm.x;
    g1 *= norm.y;
    g2 *= norm.z;
    g3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(g0, x0), dot(g1, x1), dot(g2, x2), dot(g3, x3)));
}

vec3 adjustSaturation(vec3 color, float saturation) {
    float luminance = dot(color, vec3(0.299, 0.587, 0.114)); // Calculate luminance
    return mix(vec3(luminance), color, saturation); // Adjust saturation
}

vec3 flame(vec2 uv, float time) {
    // High-frequency noise (fine details)
    float noiseHigh = snoise(vec3(uv.x * 13.0, uv.y * 13.0 - time * 1.5, time * 0.4));

    // Medium-frequency noise (medium details)
    float noiseMedium = snoise(vec3(uv.x * 7.0, uv.y * 7.0 - time * 0.5, time * 0.2));

    // Low-frequency noise (large patterns)
    float noiseLow = snoise(vec3(uv.x * 1.0, uv.y * 1.0 - time * 0.1, time * 0.1));

    // Combine noise layers
    float noise = noiseHigh * 0.4 + noiseMedium * 0.8 + noiseLow * 0.5;

    // Adjust gradient for upward flow
    float gradient = pow(1.0 - uv.y, 1.5); // Brighter at the bottom

    // Combine noise, gradient, and flame shape
    float flame = noise * gradient;

    // Flame color gradient (yellow -> orange -> red -> black)
    vec3 color;
    if (uv.y < 0.5) {
        // Bright yellow to orange transition at the bottom half
        color = mix(vec3(2.0, 0.8, 0.1), vec3(2.0, 0.4, 0.0), uv.y * 2.0);
    } else {
        // Orange to red to black transition at the top half
        color = mix(vec3(2.0, 0.4, 0.0), vec3(1.0, 0.0, 0.0), (uv.y - 0.5) * 2.0);
        color = mix(color, vec3(0.0), smoothstep(0.5, 1.0, uv.y)); // Fade to black at the top
    }

    // Increase brightness (especially at the bottom)
    float brightness = 2.0; // Overall brightness
    color = color * flame * brightness;

    // Boost saturation
    float saturation = 1.5; // Adjust this value to control saturation
    return adjustSaturation(color, saturation);
}


void main() {
    vec3 color = flame(vUv, uTime); // Generate flame effect
    gl_FragColor = vec4(color, 1.0); // Output color
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
    let gl = canvas.getContext('webgl', {antialias: false});

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

// Define vertex data for a full-screen quad
    const vertices = new Float32Array([
        // First triangle
        -1, -1, // Bottom-left
        1, -1, // Bottom-right
        -1,  1, // Top-left

        // Second triangle
        1, -1, // Bottom-right
        1,  1, // Top-right
        -1,  1  // Top-left
    ]);

    // Create a buffer and upload vertex data
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Get attribute locations
    const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'aPosition');
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const uTimeLocation = gl.getUniformLocation(shaderProgram, 'uTime');

    // Set up the render loop
    let time = 0;

    function render() {
        // gl.viewport(0, 0, canvas.width, canvas.height);
        // Update time
        time += 0.01;

        // Clear the canvas
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Pass time to the shader
        gl.uniform1f(uTimeLocation, time);

        // Draw the triangle
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // Request the next frame
        requestAnimationFrame(render);
    }

    // Start the render loop
    requestAnimationFrame(render);
}

// Run the main function
main();