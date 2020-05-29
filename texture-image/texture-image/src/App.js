import React, { useEffect, useState } from 'react';
import {Workbench3d} from './workbench3d';

const glMatrix = window.glMatrix;

const context = {
  settings: {
      canvas: {
          size: {
              width: 576,
              height: 480
          }
      }        
  },
  programs: [
      {
          id: 'msft',
          buffer: [
              0, 0,
              500, 0, 
              0, 408,
              0, 408,
              500, 0,
              500, 408
          ].map(b => b + 32),
          shaders: {
              vertex: `
attribute vec4 a_position;
attribute vec4 a_texCoord;

uniform mat4 u_rotation;
uniform vec2 u_resolution;

varying vec2 v_texCoord;

void main() {
  vec2 resolution = u_resolution;
  vec2 zeroToOne = vec2(a_position.xy) / resolution;
  vec2 zeroToTwo = zeroToOne * 2.0;
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = u_rotation * vec4(clipSpace * vec2(1, -1), 0, 1);

  v_texCoord = a_texCoord.xy;
}
              `,
              fragment: `
precision mediump float;

uniform sampler2D u_image;

varying vec2 v_texCoord;

void main() {
  gl_FragColor = texture2D(u_image, v_texCoord).rgba;
}
              `
          }
      }
  ]
};

const programName = 'msft';

function App() {
  const [angle, setAngle] = useState(0);
  const [workbench, setWorkbench] = useState(null);

  useEffect(() => {
    document.getElementById('angle').innerHTML = `${angle.toPrecision(3)}`;

    if (workbench) {
      render(workbench, angle);

      return;
    }

    new Workbench3d(context, (workbench) => {
      workbench.useProgram(programName);
      setWorkbench(workbench); 
    });
  }, [workbench, angle]);

  const updateAngle = (e) => {
    const theta = e.target.value;

    setAngle(parseInt(theta));
  }

  return (
    <div className="App">
      <div className="container">
          <div className="container">
            <h3 className="title is-3">Texture Rotation Demo</h3>
            <p>
              Rotate the old Microsoft Windows logo 360 degrees!
            </p>
          </div>
          <div className="container">
              <div className="field">
                <div class="control">
                  <label id="angle-label">Angle</label>
                  <label id="angle">0</label>
                  <input type="range" onInput={updateAngle} id="pos-x" min="0" max="360" step="1" defaultValue="0" />
                </div>
              </div>
          </div>
      </div>
      <div className="container">
          <canvas id="workbench"></canvas>
      </div>
    </div>
  );
}

function render(workbench, angle) {
  const gl = workbench.gl;



  workbench.createImage('win95.png', (image) => {
    workbench.clearCanvas();

    const program = workbench.program();

    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      0.0, 1.0,
      1.0, 0.0,
      1.0, 1.0
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    gl.uniform2f(resolutionLocation, workbench.viewportDimensions().width, workbench.viewportDimensions().height);
  
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionAttributeLocation);

    const rotationMatrix = glMatrix.mat4.create();
    glMatrix.mat4.fromZRotation(rotationMatrix, glMatrix.glMatrix.toRadian(angle));

    const rotationLocation = gl.getUniformLocation(program, 'u_rotation');
    gl.uniformMatrix4fv(rotationLocation, false, rotationMatrix);
    
    const buffer = [...context.programs.find(p => p.id === programName).buffer];
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer), gl.STATIC_DRAW);
  
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

  });
}


export default App;
