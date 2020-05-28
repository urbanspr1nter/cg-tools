const context = {
    settings: {
        canvas: {
            size: {
                width: 500,
                height: 500
            }
        }        
    },
    programs: [
        {
            id: 'triangle',
            buffer: [
                -0.3, 0.0,
                0.0, 0.4,
                0.3, 0.0
            ],
            shaders: {
                vertex: `
attribute vec4 a_position;

varying vec4 v_color;

void main() {
    gl_Position = a_position;

    v_color = gl_Position * 0.5 + 0.5;
}
                `,
                fragment: `
precision mediump float;

varying vec4 v_color;

void main() {
    gl_FragColor = v_color;
}
                `
            }
        }
    ]
};

new Workbench3d(context, function(workbench) {
    let positionOffsets = {
        x: 0,
        y: 0
    };

    document.getElementById('pos-x').addEventListener('input', function(e) {
        const val = e.target.value;
        positionOffsets.x = parseFloat(val);

        document.getElementById('pos-x-val').innerHTML = `${positionOffsets.x.toFixed(2)}`;

        render();

    });

    document.getElementById('pos-y').addEventListener('input', function(e) {
        const val = e.target.value;
        positionOffsets.y = parseFloat(val);

        document.getElementById('pos-y-val').innerHTML = `${positionOffsets.y.toFixed(2)}`;

        render();

    });

    const gl = workbench.gl;

    render();

    function render() {
        workbench.useProgram('triangle');

        const program = workbench.program();

        const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionAttributeLocation);

        const buffer = context.programs.find(p => p.id === 'triangle').buffer.map(b => b);
        for(let i = 0; i < buffer.length; i += 2) {
            buffer[i] += parseFloat(positionOffsets.x);
            buffer[i + 1] += parseFloat(positionOffsets.y);
        }

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer), gl.STATIC_DRAW);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
});    