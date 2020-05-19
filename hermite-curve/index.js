function hermite(p0, p1, pp0, pp1, t) {
    const g_x = glMatrix.mat4.fromValues(
        p0.x, 0, 0, 0,
        p1.x, 0, 0, 0,
        pp0.x, 0, 0, 0,
        pp1.x, 0, 0, 0
    );
    const g_y = glMatrix.mat4.fromValues(
        p0.y, 0, 0, 0,
        p1.y, 0, 0, 0,
        pp0.y, 0, 0, 0,
        pp1.y, 0, 0, 0
    );

    const M = glMatrix.mat4.fromValues(
        1, 0, 0, 0, 
        0, 0, 1, 0, 
        -3, 3, -2, -1, 
        2, -2, 1, 1
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
        x: r_x[0] / 10,
        y: r_y[0] / 10
    };
}

const AppState = {
    canvas: {
        ref: null,
        resolution: 40,
        width: 500,
        height: 500,
        grid: {
            lines: '#abcabc',
            axes: '#000000',
            points: '#ff0066'
        }
    }
};

function plot(p0, p1, pp0, pp1) {
    new Workbench2D(AppState, (workbench) => {
        let prev = null;
    
        for(let t = 0; t <= 1.0; t += 0.01) {
            const coord = hermite(p0, p1, pp0, pp1, t);
            
            if (prev)
                workbench.connect([prev.x, prev.y], [coord.x, coord.y]);
    
            prev = coord;
        }
    });
}


const plotButton = document.getElementById('btn-plot');
plotButton.addEventListener('click', function() {
    const p0x = document.getElementById('input-p0-x').value;
    const p0y = document.getElementById('input-p0-y').value;

    const p1x = document.getElementById('input-p1-x').value;
    const p1y = document.getElementById('input-p1-y').value;

    const pp0x = document.getElementById('input-pp0-x').value;
    const pp0y = document.getElementById('input-pp0-y').value;

    const pp1x = document.getElementById('input-pp1-x').value;
    const pp1y = document.getElementById('input-pp1-y').value;

    plot(
        {x: p0x, y: p0y},
        {x: p1x, y: p1y},
        {x: pp0x, y: pp0y},
        {x: pp1x, y: pp1y}
    );
});