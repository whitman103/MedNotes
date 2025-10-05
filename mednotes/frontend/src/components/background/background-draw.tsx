import { SVG } from "@svgdotjs/svg.js"

class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    createString() {
        return `${this.x},${this.y}`
    }
}

function CreateRow(lineLength: number, xSize: number, yStart: number, offset: number): string {

    let outString = '';
    for (var triangleIndex = -1; triangleIndex < Math.ceil(xSize / (lineLength)); triangleIndex++) {
        let basePoint = new Point(triangleIndex * lineLength + offset, yStart);

        for (var i = 1; i > -2; i -= 2) {
            const rightPoint = new Point(basePoint.x + lineLength, basePoint.y);
            const topPoint = new Point(basePoint.x + lineLength / 2, basePoint.y + i * lineLength * Math.sqrt(3) / 2.);
            const middlePoint = new Point(basePoint.x + lineLength / 2, basePoint.y + i * lineLength * Math.sqrt(2) / 4.);

            outString = outString + `${basePoint.createString()} ${rightPoint.createString()} ${topPoint.createString()} ${basePoint.createString()} ${middlePoint.createString()} 
    ${topPoint.createString()}
    ${middlePoint.createString()} ${rightPoint.createString()} `
            basePoint = topPoint;
        }
    }

    return outString;
}


function DrawLogo() {

    var draw = SVG().addTo('#background').size(window.screen.width, window.screen.height);
    var gradient = draw.gradient('linear', function (add) {
        add.stop(0, '#0b9176ff')
        add.stop(1, '#1a1063ff')
    })
    const lineLength = 150;
    for (let j = 0; j < Math.ceil(window.screen.height / lineLength); j += 1) {
        var polyline = draw.polyline(CreateRow(lineLength, window.screen.width, j * lineLength, j * 10));
        polyline.fill('none');
        polyline.stroke({ color: gradient, width: 2, linecap: 'round' })
    }
}

export default DrawLogo;