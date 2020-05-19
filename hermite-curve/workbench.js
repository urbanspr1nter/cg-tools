/**
 * workbench.js
 * 
 * @author Roger Ngo
 * urbanspr1nter@gmail.com
 * 
 * @fileoverview A simple 2D workbench resembling graph paper.
 */

class Workbench2D {
    constructor (appState, cb) {
        this.AppState = appState;

        this.start(cb);
    }

    start(cb) {
        this.drawGrid();

        return cb(this);
    }

    clear() {
        const context = this.AppState.canvas.ref.getContext('2d');
        context.clearRect(0, 0, this.AppState.canvas.ref.width, this.AppState.canvas.ref.height);

        this.drawGrid();
    }

    drawGrid() {
        const AppState = this.AppState;
        const canvas = document.getElementById('workbench');
        AppState.canvas.ref = canvas;
    
        const context = AppState.canvas.ref.getContext('2d');
    
        AppState.canvas.ref.width = AppState.canvas.width;
        AppState.canvas.ref.height = AppState.canvas.height;
    
        const w = AppState.canvas.ref.width;
        const h = AppState.canvas.ref.height;
        const res = AppState.canvas.resolution;
        
        const gap = {
            width: w / res,
            height: h / res
        };
        const origin = {
            x: w / 2,
            y: h / 2
        };
    
        context.clearRect(0, 0, w, h);
        context.strokeStyle = AppState.canvas.grid.axes;
    
        // Y Axes
        context.beginPath();
        context.moveTo(origin.x, 0);
        context.lineTo(origin.x, h);
        context.stroke();
    
        // X Axes
        context.beginPath();
        context.moveTo(0, origin.y);
        context.lineTo(w, origin.y);
        context.stroke();
    
        // Draw the grid lines
        context.strokeStyle = AppState.canvas.grid.lines;
        for(let i = gap.width; i < w; i += gap.width) {
            context.beginPath();
            context.moveTo(i, 0);
            context.lineTo(i, h);
            context.stroke();
        }
        for(let i = gap.height; i < h; i += gap.height) {
            context.beginPath();
            context.moveTo(0, i);
            context.lineTo(w, i);
            context.stroke();
        }
    }

    plotPixel(x, y, color) {
        const AppState = this.AppState;
        const pixelColor = color || AppState.canvas.grid.points;
        const context = AppState.canvas.ref.getContext('2d');
    
        const w = AppState.canvas.ref.width;
        const h = AppState.canvas.ref.height;
        const res = AppState.canvas.resolution;
      
        const gap = {
            width: w / res,
            height: h / res
        };
        const origin = {
            x: w / 2,
            y: h / 2
        };
    
        const pixelX = origin.x + gap.width * (x * (res / 2));
        const pixelY = origin.y - gap.height * (y * (res / 2));
    
        context.fillStyle = pixelColor;
        context.beginPath();
        context.moveTo(pixelX, pixelY);
        context.fillRect(pixelX - 2, pixelY - 2, 4, 4);
    }

    connect(p0, p1, color) {
        const AppState = this.AppState;

        const pixelColor = color || AppState.canvas.grid.points;
        const context = AppState.canvas.ref.getContext('2d');
    
        const w = AppState.canvas.ref.width;
        const h = AppState.canvas.ref.height;
        const res = AppState.canvas.resolution;

        const gap = {
            width: w / res,
            height: h / res
        };

        const origin = {
            x: (w / 2) + (gap.width * (p0[0] * (res / 2))),
            y: (h / 2) - (gap.height * (p0[1] * (res / 2)))
        };

        const destination = {
            x: (w / 2) + (gap.width * (p1[0] * (res / 2))),
            y: (h / 2) - (gap.height * (p1[1] * (res / 2)))
        };

        context.strokeStyle = pixelColor;
        context.beginPath();
        context.moveTo(origin.x, origin.y);
        context.lineTo(destination.x, destination.y);
        context.stroke();
    }
}

