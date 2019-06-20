var c = document.getElementById("canvas");
var height = c.getAttribute('height');
var width = c.getAttribute('width');
var ns = 'http://www.w3.org/2000/svg'
var edges = [];
var speed = 100;
var minX = -1, maxX = 1, minY = -1, maxY = 1, minZ = -1, maxZ = 1;
var worldOffset = 0;

var cameraPosition = [(maxX+minX)/2, (maxY+minY)/2, (maxZ+minZ)/2];




class Vertex {
    constructor(x, y, z, a, up) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.a = a;
        this.up = up;
    }

    translateMovement(speed) {
        var step = (maxZ - minZ) / 100;
        switch (this.a - worldOffset) {
            case 0:
                this.x += (edges[0].v2.x - edges[0].v1.x) / 100;
                if (this.up === false) {
                    this.y += (edges[0].v2.y - edges[0].v1.y) / 100;
                } else {
                    this.y += (edges[0].v2.y - edges[0].v1.y) / 200;
                }
                break;
            case 1:
                this.x += (edges[1].v2.x - edges[1].v1.x) / 100;
                if (this.up === false) {
                    this.y += (edges[1].v2.y - edges[1].v1.y) / 100;
                } else {
                    this.y += (edges[1].v2.y - edges[1].v1.y) / 200;
                }
                break;
            case 2:
                this.x += (edges[2].v2.x - edges[2].v1.x) / 100;
                if (this.up === false) {
                    this.y += (edges[2].v2.y - edges[2].v1.y) / 100;
                } else {
                    this.y += (edges[2].v2.y - edges[2].v1.y) / 200;
                }
                break;
            case 3:
                this.x += (edges[3].v2.x - edges[3].v1.x) / 100;
                if (this.up === false) {
                    this.y += (edges[3].v2.y - edges[3].v1.y) / 100;
                } else {
                    this.y += (edges[3].v2.y - edges[3].v1.y) / 200;
                }
                break;
            case 4:
                this.x += (edges[4].v2.x - edges[4].v1.x) / 100;
                if (this.up === false) {
                    this.y += (edges[4].v2.y - edges[4].v1.y) / 100;
                } else {
                    this.y += (edges[4].v2.y - edges[4].v1.y) / 200;
                }
                break;
            case 5:
                this.x += (edges[5].v2.x - edges[5].v1.x) / 100;
                if (this.up === false) {
                    this.y += (edges[5].v2.y - edges[5].v1.y) / 100;
                } else {
                    this.y += (edges[5].v2.y - edges[5].v1.y) / 200;
                }
                break;
        }
        this.z -= step;
    }

    translateToZeroCoords() {
        return [(this.x - minX) / 2, (this.y - minY) / 2, this.z];
    }
}
class Line {
    constructor(v1, v2) {
        this.v1 = v1;
        this.v2 = v2;
    }

    getSVGLineCoords() {
        var zCoords = [this.v1.translateToZeroCoords(), this.v2.translateToZeroCoords()]
        var v1 = [zCoords[0][0], zCoords[0][1], zCoords[0][2]];
        var v2 = [zCoords[1][0], zCoords[1][1], zCoords[1][2]];
        return [[v1 * width, height - zCoords[0][1] * height, zCoords[0][2] * width],
        [zCoords[1][0] * width, height - zCoords[1][1] * height, zCoords[1][2] * width]];
    }
}


function drawLine(edge) {
    var div = document.getElementById('drawing');
    var line = document.createElementNS(ns, 'line');
    var SVGLine = edge.getSVGLineCoords();
    line.setAttributeNS(null, 'x1', SVGLine[0][0]);
    line.setAttributeNS(null, 'y1', SVGLine[0][1]);
    line.setAttributeNS(null, 'x2', SVGLine[1][0]);
    line.setAttributeNS(null, 'y2', SVGLine[1][1]);
    line.setAttributeNS(null, 'style', "stroke:rgb(0,0,0);stroke-width:1");
    c.appendChild(line);
}

function randpoint() {
    return [(Math.random() / 5) - 0.1, Math.random() / 5 - 0.1, 1.0];
}

function genBox(path){
    var pathFarMax = maxX / 10;
    var pathFarMin = minX / 10;
    var pathFarStep = (pathFarMax - pathFarMin) / 5;
    var pathCloseStep = (maxX - minX) / 5;
    var leftLine = path-worldOffset;
    edges.push(new Line(new Vertex(pathFarMin+pathFarStep*(leftLine), (maxY + minY) / 2 + maxY / 100, 1, leftLine, true), 
        new Vertex(pathFarMin+pathFarStep*(leftLine+1), (maxY + minY) / 2 + maxY / 100, 1, leftLine+1, true)));
    edges.push(new Line(new Vertex(pathFarMin+pathFarStep*(leftLine+1), (maxY + minY) / 2 + maxY / 100, 1, leftLine+1, true), 
        new Vertex(pathFarMin+pathFarStep*(leftLine+1), (maxY + minY) / 2, 1, leftLine+1, false)));
    edges.push(new Line(new Vertex(pathFarMin+pathFarStep*(leftLine), (maxY + minY) / 2 + maxY / 100, 1, leftLine, true), 
        new Vertex(pathFarMin+pathFarStep*(leftLine), (maxY + minY) / 2, 1, leftLine, false)));

}

function setUp() {
    //paths
    var pathFarMax = maxX / 10;
    var pathFarMin = minX / 10;
    var pathFarStep = (pathFarMax - pathFarMin) / 5;
    var pathCloseStep = (maxX - minX) / 5;
    edges.push(new Line(new Vertex(pathFarMin, (maxY + minY) / 2, 1, 0, false),
        new Vertex(minX, minY, 0, 0, false)));
    edges.push(new Line(new Vertex(pathFarMin + pathFarStep, (maxY + minY) / 2, 1, 0, false),
        new Vertex(minX + pathCloseStep, minY, 0, 0, false)));
    edges.push(new Line(new Vertex(pathFarMin + 2 * pathFarStep, (maxY + minY) / 2, 1, 0, false),
        new Vertex(minX + 2*pathCloseStep, minY, 0, 0, false)));
    edges.push(new Line(new Vertex(pathFarMax - 2 * pathFarStep, (maxY + minY) / 2, 1, 0, false),
        new Vertex(maxX- 2*pathCloseStep, minY, 0, 0, false)));
    edges.push(new Line(new Vertex(pathFarMax - pathFarStep, (maxY + minY) / 2, 1, 0, false),
        new Vertex(maxX -pathCloseStep, minY, 0, 0, false)));
    edges.push(new Line(new Vertex(pathFarMax, (maxY + minY) / 2, 1, 0, false),
        new Vertex(maxX, minY, 0, 0, false)));

    //horizon line
    edges.push(new Line(new Vertex(minX, (maxY + minY) / 2, 1, false), 
        new Vertex(maxX, (maxY + minY) / 2, 1, 0, false)));

}
var counter = 20;
function drawLoop() {
    if(counter++ === 20){
        genBox(Math.floor(Math.random()*3+1));
        counter = 0;
    }
    while (c.firstChild) {
        c.removeChild(c.firstChild);
    }
    for (var i = 0; i < edges.length; i++) {
        if (i > 6) {
            edges[i].v1.translateMovement(speed);
            edges[i].v2.translateMovement(speed);
        }
        if (edges[i].v1.z < minZ) {
            edges.pop(edges[i]);
        } else {
            drawLine(edges[i]);
        }
    }
}

function pollFunc(fn, timeout, interval) {
    var startTime = (new Date()).getTime();
    interval = interval || 1000;

    (function p() {
        fn();
        if (((new Date).getTime() - startTime) <= timeout) {
            setTimeout(p, interval);
        }
    })();
}

setUp();
pollFunc(drawLoop, 20000, 100);