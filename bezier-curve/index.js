function bezier(p0, p1, p2, p3, t) {
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

    const M = glMatrix.mat4.fromValues(
        1, 0, 0, 0, 
        -3, 3, 0, 0, 
        3, -6, 3, 0, 
        -1, 3, -3, 1
    );
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

    return {
        x: r_x[0],
        y: r_y[0]
    };
}

const AppState = {
    canvas: {
        ref: null,
        resolution: 40,
        width: 400,
        height: 400,
        grid: {
            lines: '#cccccc',
            axes: '#000000',
            points: '#ff0066'
        }
    }
};

function plot(p0, p1, p2, p3) {
    new Workbench2D(AppState, (workbench) => {
        let prev = null;

        workbench.plotPixel(p0.x, p0.y, '#000000');
        workbench.plotPixel(p1.x, p1.y, '#000000');
        workbench.plotPixel(p2.x, p2.y, '#000000');
        workbench.plotPixel(p3.x, p3.y, '#000000');

        workbench.connect([p0.x, p0.y], [p1.x, p1.y], '#555555');
        workbench.connect([p1.x, p1.y], [p2.x, p2.y], '#555555');
        workbench.connect([p2.x, p2.y], [p3.x, p3.y], '#555555');

    
        for(let t = 0; t <= 1.0; t += 0.01) {
            const coord = bezier(p0, p1, p2, p3, t);
            
            if (prev)
                workbench.connect([prev.x, prev.y], [coord.x, coord.y], '#ff0000');
    
            prev = coord;
        }
    });
}


const plotButton = document.getElementById('btn-plot');
const inputs = Array.from(document.getElementsByTagName('input'));
inputs.map(i => i.addEventListener('change', function() {
    plotButton.click();
}));
plotButton.addEventListener('click', function() {
    const p0x = document.getElementById('input-p0-x').value;
    const p0y = document.getElementById('input-p0-y').value;

    const p1x = document.getElementById('input-p1-x').value;
    const p1y = document.getElementById('input-p1-y').value;

    const p2x = document.getElementById('input-p2-x').value;
    const p2y = document.getElementById('input-p2-y').value;

    const p3x = document.getElementById('input-p3-x').value;
    const p3y = document.getElementById('input-p3-y').value;

    plot(
        {x: p0x, y: p0y},
        {x: p1x, y: p1y},
        {x: p2x, y: p2y},
        {x: p3x, y: p3y}
    );

    document.getElementById('points').innerHTML = `P0: (${p0x}, ${p0y}), P1: (${p1x}, ${p1y}), P2: (${p2x}, ${p2y}), P3: (${p3x}, ${p3y})`;
});

plotButton.click();
