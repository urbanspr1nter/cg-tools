/**
 * workbench3d.js
 * 
 * @author Roger Ngo
 * urbanspr1nter@gmail.com
 * 
 * 
 * @fileoverview WebGL workbench to make creating shaders easier.
 */
class Workbench3d {
    constructor(context, cb) {
        this.logger = new Logger();
        this.context = {
            ...{
                settings: {
                    canvas: {
                        size: {
                            width: 500,
                            height: 500
                        }
                    }
                },
                programs: []
            }, 
            ...context
        };

        this.canvas = document.getElementById('workbench');
        this.gl = this.canvas.getContext('webgl');

        if (!this.gl)
            throw Error('Your browser does not support WebGL');

        this.initCanvas();
        this.buildPrograms();

        this.start(cb);

        // Private Logger class
        function Logger() {
            return {
                log: function(...message) {
                    console.log(`[wb3d]`, ...message);
                },
                error: function(...message) {
                    console.error(`[wb3d]`, ...message);
                }
            }
        }
    }

    start(cb) {
        return cb(this);
    }

    initCanvas() {
        this.canvas.width = this.context.settings.canvas.size.width;
        this.canvas.height = this.context.settings.canvas.size.height;

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    buildPrograms() {
        this.logger.log('Compiling the programs in context');

        this.programs = {};

        for(const program of this.context.programs) {
            // Compile the vertex shader
            const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
            this.gl.shaderSource(vertexShader, program.shaders.vertex);
            this.gl.compileShader(vertexShader);

            const vertexShaderCompilationStatus = this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS);
            if (!vertexShaderCompilationStatus) {
                this.logger.error(this.gl.getShaderInfoLog(vertexShader));

                this.gl.deleteShader(vertexShader);

                throw new Error(`Unable to compile the vertex shader in ${program.id}`);
            }

            // Compile the fragment shader
            const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
            this.gl.shaderSource(fragmentShader, program.shaders.fragment);
            this.gl.compileShader(fragmentShader);

            const fragmentShaderCompilationStatus = this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS);
            if (!fragmentShaderCompilationStatus) {
                this.logger.error(this.gl.getShaderInfoLog(fragmentShader));

                this.gl.deleteShader(fragmentShader);

                throw new Error(`Unable to compile the fragment shader in ${program.id}`);
            }

            // Link the vertex + fragment shaders into a program
            this.programs[program.id] = this.gl.createProgram();
            this.gl.attachShader(this.programs[program.id], vertexShader);
            this.gl.attachShader(this.programs[program.id], fragmentShader);
            this.gl.linkProgram(this.programs[program.id]);

            const linkStatus = this.gl.getProgramParameter(this.programs[program.id], this.gl.LINK_STATUS);
            if (!linkStatus) {
                this.logger.error(this.gl.getProgramInfoLog(this.programs[program.id]));

                this.gl.deleteProgram(this.programs[program.id]);

                delete this.programs[program.id];

                throw new Error(`Unable to link shaders for the program ${program.id}`);
            }
        }

        this.logger.log('The compiled programs', this.programs);
    }

    viewportDimensions() {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }

    program() {
        if (!this.activeProgram)
            throw new Error('An active program must be set using useProgram');

        return this.activeProgram;
    }

    useProgram(id) {
        const program = this.programs[id];

        if (!program)
            throw new Error('Could not find the program', id);

        this.gl.useProgram(program);
        this.activeProgram = program;
    }
}
