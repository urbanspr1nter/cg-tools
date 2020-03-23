/**
 * A basic hello world type webgl program
 * adapted from: https://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html
 */

// Define our two shader programs: vertex, and fragment
const shaders = {
    vertex: `
// an attribute will receive data from a buffer
attribute vec2 a_position;

uniform vec2 u_resolution;

// all shaders have a main function
void main() {
    // convert the position from pixels to range from 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;

    // convert from ranging 0.0 to 1.0 to 0.0 to 2.0
    vec2 zeroToTwo = zeroToOne * 2.0;

    // convert from ranging 0.0 to 2.0 to -1.0 to 1.0
    vec2 clipSpace = zeroToTwo - 1.0;

    // gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`,
    fragment: `
// fragment shaders don't have a default precision so we need to
// pick one. mediump is a good default. It means "medium precision"
precision mediump float;

uniform vec4 u_color;

void main() {
    // gl_FragColor is a special variable a fragment shader
    // is responsible for setting
    gl_FragColor = u_color;
}
    `
};

// Set up the GL context
const canvas = document.getElementById('c');
const gl = canvas.getContext('webgl');

if (!gl)
    console.error('No webgl');

// Compile the program
const vertexShader = createShader(gl, gl.VERTEX_SHADER, shaders.vertex);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, shaders.fragment);
const program = createProgram(gl, vertexShader, fragmentShader);

// Set up the canvas for rasterization
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.useProgram(program);

// Create a buffer
const positionBuffer = gl.createBuffer();

// Set the positionBuffer to be the active buffer to be consumed into attribute
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// Set the u_resolution uniform
const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

// We can now set our variables after compiling the program
const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(positionAttributeLocation);

// Tell attribute how to get the data out of buffer
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
const size = 2; // Components size per iteration
const type = gl.FLOAT; // the data type
const normalize = false; // don't normalize
const stride = 0; // 0 = move forward size * sizeof(type) for each iteration (increment)
const offset = 0; // start at this offset of the buffer
gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

// Draw 50 random rectangles
const colorUniformLocation = gl.getUniformLocation(program, 'u_color');
for (let i = 0; i < 50; i++) {
    const x = randomInt(300);
    const y = randomInt(300);
    const width = randomInt(300);
    const height = randomInt(300);

    const positions = [
        x, y,
        x + width, y,
        x, y + height,
        x, y + height,
        x + width, y + height,
        x + width, y,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);

    // Draw 6 points in the context of them being vertices for triangles
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function randomInt(max) {
    return Math.floor(Math.random() * max);
}

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success)
        return shader;
    
    console.warn(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success)
        return program;

    console.warn(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}
