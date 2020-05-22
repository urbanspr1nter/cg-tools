const colors = [
    '#ff0000',
    '#0000ff'
];

function bspline(points, step) {
    const S = 1 / 6;
    const M = glMatrix.mat4.fromValues(
        0, 1, 4, 1,
        0, 3, 0, -3,
        0, 3, -6, 3,
        1, -3, 3, -1
    );

    glMatrix.mat4.multiplyScalar(M, M, S);

    const results = [];

    for(let i = 0; i < points.length - 3; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const p2 = points[i + 2];
        const p3 = points[i + 3];

        const g_x = glMatrix.mat4.fromValues(
            p0.x, 0, 0, 0,
            p1.x, 0, 0, 0,
            p2.x, 0, 0, 0,
            p3.x, 0, 0, 0
        );
        const g_y = glMatrix.mat4.fromValues(
            p0.y, 0, 0, 0,
            p1.y, 0, 0, 0,
            p2.y, 0, 0, 0,
            p3.y, 0, 0, 0
        );

        const curve = [];

        for(let t = 0; t <= 1; t += step) {
            const T = glMatrix.mat4.fromValues(
                1, t, Math.pow(t, 2), Math.pow(t, 3),
                0, 0, 0, 0,
                0, 0, 0, 0,
                0, 0, 0, 0
            );

            const r_x = glMatrix.mat4.create();
            glMatrix.mat4.multiply(r_x, g_x, M);
            glMatrix.mat4.multiply(r_x, r_x, T);
        
            const r_y = glMatrix.mat4.create();
            glMatrix.mat4.multiply(r_y, g_y, M);
            glMatrix.mat4.multiply(r_y, r_y, T);

            curve.push({
                x: r_x[0],
                y: r_y[0]
            });
        }

        results.push({curve, color : colors[i % 2]});
    }

    return results;
}

const AppState = {
    canvas: {
        ref: null,
        resolution: 40,
        width: 500,
        height: 500,
        grid: {
            lines: '#cccccc',
            axes: '#000000',
            points: '#ff0066'
        }
    }
};

let hideControl = false;
let points = [
    {
        x: -0.1,
        y: 0.1
    },
    {
        x: -0.1,
        y: 0.3
    },
    {
        x: 0.1,
        y: 0.3
    },
    {
        x: 0.1,
        y: 0
    },
    {
        x:0.3,
        y:0
    }, 
    {
        x: 0.3,
        y: 0.3
    }, {
        x: 0.5,
        y: 0.3
    }
];

function plot() {
    new Workbench2D(AppState, (workbench) => {
        document.getElementById('points').innerHTML = `Control Points:<br/>${points.map(p => `(${p.x}, ${p.y})`)}`;
        
        if (!hideControl) {
            for(const p of points) {
                workbench.plotPixel(p.x, p.y, '#000000');
            }
            for(let p = 1; p < points.length; p++) {
                workbench.connect(
                    [points[p - 1].x, points[p - 1].y],
                    [points[p].x, points[p].y],
                    '#555555'
                );
            }
        }
        const results = bspline(points, 0.01);

        for(const curveData of results) {
            const curve = curveData.curve;
            const color = curveData.color;
            for(let p = 1; p < curve.length; p++) {
                workbench.connect(
                    [curve[p-1].x, curve[p-1].y], 
                    [curve[p].x, curve[p].y],
                    color
                );
            }
        }
    });
}

document.getElementById('btn-add').addEventListener('click', function() {
    const x = document.getElementById('input-p-x').value;
    const y = document.getElementById('input-p-y').value;

    points.push({x, y});

    plot();
});

document.getElementById('btn-reset').addEventListener('click', function() {
    points = [];
    plot();
});

document.getElementById('btn-hide-control-data').addEventListener('click', function() {
    hideControl = !hideControl;
    plot();
});

plot();

