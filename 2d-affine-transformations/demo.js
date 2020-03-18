/**
 * 2D Affine Transformation Demo
 * 
 * Roger Ngo
 * urbanspr1nter@gmail.com
 * 
 * rogerngo.com
 */

const canvasOpts = {
    width: 480,
    height: 480,
    origin: {
        x: 240,
        y: 240
    },
    gridSize: 48,
    colors: {
        grid: '#abcabc',
        axes: '#000000',
        points: '#ff0000',
        lines: '#ff0000'
    }
};

const state = {
    log: document.getElementById('log'),
    context: null,
    T: [],
    M: [],
    lines: [],
    points: [
        glMatrix.vec3.fromValues(-0.2, 0.1, 1), // A
        glMatrix.vec3.fromValues(-0.2, 0.2, 1), // C
        glMatrix.vec3.fromValues(-0.1, 0.3, 1), // J
        glMatrix.vec3.fromValues(0.0, 0.2, 1), // E
        glMatrix.vec3.fromValues(0.1, 0.3, 1), // G
        glMatrix.vec3.fromValues(0.2, 0.2, 1), // H
        glMatrix.vec3.fromValues(0.2, 0.1, 1), // I
        glMatrix.vec3.fromValues(0.1, 0.0, 1), // F
        glMatrix.vec3.fromValues(0.0, -0.1, 1), // D
        glMatrix.vec3.fromValues(-0.1, 0.0, 1) // B 
    ],
    results: []
};

// Initialize Grid
function initializeGrid() {
    const {context} = state;

    context.clearRect(0, 0, canvasOpts.width,canvasOpts.height);
    context.strokeStyle = canvasOpts.colors.axes;
    
    // Draw the X-axis
    context.beginPath();
    context.moveTo(canvasOpts.origin.x, 0);
    context.lineTo(canvasOpts.origin.x, canvasOpts.height);
    context.stroke();

    // Draw the Y-axis
    context.beginPath();
    context.moveTo(0, canvasOpts.origin.y);
    context.lineTo(canvasOpts.width, canvasOpts.origin.y);
    context.stroke();
    
    // Draw the grid lines
    context.strokeStyle = canvasOpts.colors.grid;
    for(let i = canvasOpts.gridSize; i < canvasOpts.width; i += canvasOpts.gridSize) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, canvasOpts.height);
        context.stroke();
    }
    for(let i = canvasOpts.gridSize; i < canvasOpts.height; i += canvasOpts.gridSize) {
        context.beginPath();
        context.moveTo(0, i);
        context.lineTo(canvasOpts.width, i);
        context.stroke();
    }
}

function plot(x, y) {
    const {context} = state;
    const origin = {
        x: canvasOpts.origin.x,
        y: canvasOpts.origin.y
    };

    const pixelX = origin.x + canvasOpts.gridSize * (x * 10);
    const pixelY = origin.y - canvasOpts.gridSize * (y * 10);

    context.strokeStyle = canvasOpts.colors.points;
    context.beginPath();
    context.moveTo(pixelX, pixelY);
    context.strokeRect(pixelX - 2, pixelY -2, 4, 4);

    state.lines.push(glMatrix.vec2.fromValues(pixelX, pixelY));
}

function connect() {
    const {context, lines} = state;

    for(let i = 1; i < lines.length; i ++) {
        const e0 = lines[i - 1];
        const e1 = lines[i];

        context.strokeStyle = canvasOpts.colors.lines;
        context.beginPath();
        context.moveTo(e0[0], e0[1]);
        context.lineTo(e1[0], e1[1]);
        context.stroke();
    }

    // Make the last connection
    context.strokeStyle = canvasOpts.colors.lines;
    const e0 = lines[lines.length - 1];
    const e1 = lines[0];

    context.beginPath();
    context.moveTo(e0[0], e0[1]);
    context.lineTo(e1[0], e1[1]);
    context.stroke();
}

function plotPoints(points) {
    for(let i = 0; i < points.length; i++) {
        plot(points[i][0], points[i][1]);
    }
}

function prettyPrintPoint(p) {
    return `(${p[0].toFixed(2)}, ${p[1].toFixed(2)})`;
}

function prettyPrintMatrix(m) {
    let r = `
${m[0].toFixed(4)}&emsp;${m[3].toFixed(4)}&emsp;${m[6].toFixed(4)}<br/>
${m[1].toFixed(4)}&emsp;${m[4].toFixed(4)}&emsp;${m[7].toFixed(4)}<br/>
${m[2].toFixed(4)}&emsp;${m[5].toFixed(4)}&emsp;${m[8].toFixed(4)}<br/>`;

    return r;
}

function buildTransformationMatrix() {
    const matrix = glMatrix.mat3.create();
    const values = [];
    for(let i = 0; i < 3; i++) {
        values[i] = [];
    }
    for(let j = 0; j < 3; j++) {
        for(let i = 0; i < 3; i++) {
            const id = `m${i}${j}`;
            values[i][j] = parseFloat(document.getElementById(id).value);
        }
    }

    glMatrix.mat3.set(matrix, ...values.flat());

    return matrix;
}

function boot() {
    const canvas = document.getElementById("model");
    canvas.width = canvasOpts.width;
    canvas.height = canvasOpts.height;
    state.context = canvas.getContext('2d');

    initializeGrid();

    log.value = 'Points: ' + "\n\t" + state.points
        .map(p => prettyPrintPoint(p))
        .join("\n\t") + "\n";

    plotPoints(state.points);
    connect();
}

boot();

document.getElementById('btn-reload').addEventListener('click', function(e) {
    location.reload();
});

document.getElementById('btn-reset').addEventListener('click', function(e)  {
    document.getElementById('m00').value = 1;
    document.getElementById('m10').value = 0;
    document.getElementById('m20').value = 0;

    document.getElementById('m01').value = 0;
    document.getElementById('m11').value = 1;
    document.getElementById('m21').value = 0;

    document.getElementById('m02').value = 0;
    document.getElementById('m12').value = 0;
    document.getElementById('m22').value = 1;
});

document.getElementById('btn-stack').addEventListener('click', function(e) {
    const matrix = buildTransformationMatrix();

    state.T.push(matrix);

    document.getElementById('transformation-stack').innerHTML = state.T.map(m => prettyPrintMatrix(m)).join(',<br/>');
});

document.getElementById('btn-transform').addEventListener('click', function(e) {
    if(state.T.length === 0) {
        return;
    }

    initializeGrid();

    state.lines = [];
    const {points, results, T} = state;

    const finalMat = glMatrix.mat3.create();

    let i = 1;
    while(T.length > 0) {
        const t = T.pop();

        log.value = `${log.value ? log.value + '\n' : ''}Applying transformation ${i}: ${prettyPrintMatrix(t).replace(/&emsp;/g, '\t').replace(/<br\/>/g, '')}\n`;

        i++;
        glMatrix.mat3.mul(finalMat, finalMat, t);
    }

    document.getElementById('transformation-stack').innerHTML = prettyPrintMatrix(finalMat);

    for(let i = 0; i < points.length; i++) {        }

    for(let i = 0; i < points.length; i++) {
        plot(results[i][0], results[i][1]);
    }
    
    connect();
});

