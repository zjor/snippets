(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const t of o)if(t.type==="childList")for(const n of t.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&i(n)}).observe(document,{childList:!0,subtree:!0});function a(o){const t={};return o.integrity&&(t.integrity=o.integrity),o.referrerPolicy&&(t.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?t.credentials="include":o.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function i(o){if(o.ep)return;o.ep=!0;const t=a(o);fetch(o.href,t)}})();const m=`
    attribute vec2 aPosition; // Vertex position
    varying vec2 vUv;         // Texture coordinates
    
    void main() {
        vUv = aPosition * 0.5 + 0.5; // Map position to [0, 1] range
        gl_Position = vec4(aPosition, 0.0, 1.0); // Set vertex position
    }
`,d=`
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
`;function v(r,e,a){const i=r.createShader(a);return r.shaderSource(i,e),r.compileShader(i),r.getShaderParameter(i,r.COMPILE_STATUS)?i:(console.error("Shader compilation failed:",r.getShaderInfoLog(i)),r.deleteShader(i),null)}function f(){const r=document.getElementById("gl-canvas");let e=r.getContext("webgl",{antialias:!1});if(e||(console.error("WebGL not supported, falling back to experimental-webgl"),e=r.getContext("experimental-webgl")),!e){console.error("Your browser does not support WebGL");return}const a=v(e,m,e.VERTEX_SHADER),i=v(e,d,e.FRAGMENT_SHADER),o=e.createProgram();if(e.attachShader(o,a),e.attachShader(o,i),e.linkProgram(o),!e.getProgramParameter(o,e.LINK_STATUS)){console.error("Shader program linking failed:",e.getProgramInfoLog(o));return}e.useProgram(o);const t=new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]),n=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,t,e.STATIC_DRAW);const c=e.getAttribLocation(o,"aPosition");e.enableVertexAttribArray(c),e.vertexAttribPointer(c,2,e.FLOAT,!1,0,0);const u=e.getUniformLocation(o,"uTime");let s=0;function l(){s+=.01,e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT),e.uniform1f(u,s),e.drawArrays(e.TRIANGLES,0,6),requestAnimationFrame(l)}requestAnimationFrame(l)}f();
