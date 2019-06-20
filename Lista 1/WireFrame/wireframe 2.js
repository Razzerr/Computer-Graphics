var c = document.getElementById("canvas");
var height = c.getAttribute('height');
var width = c.getAttribute('width');
var ns = 'http://www.w3.org/2000/svg'
var edges = [];
var score = 0;

var minX = -1, maxX = 1, minY = -1, maxY = 1, minZ = -1, maxZ = -0.001;
var horizonZ = -0.5;
var step = (maxX-minX)/5;
var steps = 1000;
var yMiddle = (maxY+minY)/2;
var cameraPosition = [(maxX + minX) / 2, (maxY + minY) / 2, -0.01];
var currentLine = 2;
var lineLimits = [[minX+step, minX+2*step],[minX+2*step, maxX-2*step],[maxX-2*step, maxX-step]];

class Vertex {
    constructor(x, y, z, t) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.t = t;
    }

    translateMovement() {
        if (this.t) {
            this.z += ((maxZ-minZ)/steps);
        }
    }

    translateToZeroCoords() {
        return [((this.x-cameraPosition[0])*(cameraPosition[2]/this.z) - minX) / 2, 
        ((this.y-cameraPosition[1])*(cameraPosition[2]/this.z) - minY) / 2];
    }
}
class Line {
    constructor(v1, v2) {
        this.v1 = v1;
        this.v2 = v2;
    }

    getSVGLineCoords() {
        var zCoords = [this.v1.translateToZeroCoords(), this.v2.translateToZeroCoords()]
        var v1 = [zCoords[0][0], zCoords[0][1]];
        var v2 = [zCoords[1][0], zCoords[1][1]];
        return [[v1[0]*width, height - v1[1]*height],[v2[0]*width, height - v2[1]*height]]
    }
}


function drawLine(edge) {
    var line = document.createElementNS(ns, 'line');
    var SVGLine = edge.getSVGLineCoords();
    line.setAttributeNS(null, 'x1', SVGLine[0][0]);
    line.setAttributeNS(null, 'y1', SVGLine[0][1]);
    line.setAttributeNS(null, 'x2', SVGLine[1][0]);
    line.setAttributeNS(null, 'y2', SVGLine[1][1]);
    line.setAttributeNS(null, 'style', "stroke:rgb(0,200,100);stroke-width:1");
    c.appendChild(line);
}

function randBox() {
    var step = (maxX-minX)/5;
    var paths = [minX+step, minX+2*step, maxX-2*step, maxX-step];
    var v1 = paths[Math.floor(Math.random()*4)];
    var v2 = paths[Math.floor(Math.random()*4)];
    while (v2 === v1 || (v1 === paths[0] && v2 === paths[3]) || (v1 === paths[3] && v2 === paths[0])){
        v2 = paths[Math.floor(Math.random()*4)];
    }
    return [v1, v2];
}

function genBox(path) {
    var p = randBox();
    var h1 = minY+(0.5);

    edges.push(new Line(new Vertex(p[0], minY, horizonZ-0.01, true), new Vertex(p[0], h1, horizonZ-0.01, true)));
    edges.push(new Line(new Vertex(p[0], h1, horizonZ-0.01, true), new Vertex(p[1], h1, horizonZ-0.01, true)));
    edges.push(new Line(new Vertex(p[0], minY, horizonZ-0.01, true), new Vertex(p[1], minY, horizonZ-0.01, true)));
    edges.push(new Line(new Vertex(p[1], h1, horizonZ-0.01, true), new Vertex(p[1], minY, horizonZ-0.01, true)));

    edges.push(new Line(new Vertex(p[0], h1, horizonZ-0.01, true), new Vertex(p[0], h1, horizonZ, true)));
    edges.push(new Line(new Vertex(p[1], h1, horizonZ-0.01, true), new Vertex(p[1], h1, horizonZ, true)));

    edges.push(new Line(new Vertex(p[0], minY, horizonZ, true), new Vertex(p[0], h1, horizonZ, true)));
    edges.push(new Line(new Vertex(p[0], h1, horizonZ, true), new Vertex(p[1], h1, horizonZ, true)));
    edges.push(new Line(new Vertex(p[0], minY, horizonZ, true), new Vertex(p[1], minY, horizonZ, true)));
    edges.push(new Line(new Vertex(p[1], h1, horizonZ, true), new Vertex(p[1], minY, horizonZ, true)));
}

function setUp() {
    document.onkeydown = changeCamera;
    var paths = [minX+step, minX+2*step, maxX-2*step, maxX-step];

    //paths
    edges.push(new Line(new Vertex(paths[0], minY, horizonZ, false),
        new Vertex(paths[0], minY, maxZ, false)));
    edges.push(new Line(new Vertex(paths[1], minY, horizonZ, false),
        new Vertex(paths[1], minY, maxZ, false)));    
    edges.push(new Line(new Vertex(paths[2], minY, horizonZ, false),
        new Vertex(paths[2], minY, maxZ, false)));    
    edges.push(new Line(new Vertex(paths[3], minY, horizonZ, false),
        new Vertex(paths[3], minY, maxZ, false)));
    //horizon line
    edges.push(new Line(new Vertex(minX/maxZ, minY, horizonZ, false),
        new Vertex(maxX/maxZ, minY, horizonZ, false)));

}
function checkCollision(v1, v2){
    if ((lineLimits[currentLine-1][0]===v1.x && lineLimits[currentLine-1][1]===v2.x)||
        (lineLimits[currentLine-1][0]===v2.x && lineLimits[currentLine-1][1]===v1.x)||
        (currentLine!==3 && lineLimits[currentLine-1][0]===v1.x && lineLimits[currentLine][1]===v2.x)||
        (currentLine!==3 && lineLimits[currentLine-1][0]===v2.x && lineLimits[currentLine][1]===v1.x)||
        (currentLine!==1 && lineLimits[currentLine-1][1]===v1.x && lineLimits[currentLine-2][0]===v2.x)||
        (currentLine!==1 && lineLimits[currentLine-1][1]===v2.x && lineLimits[currentLine-2][0]===v1.x)){
            var text = document.createElementNS(ns, 'text');
            text.setAttributeNS(null, 'x', width/2-5);
            text.setAttributeNS(null, 'y', height/2);
            text.setAttributeNS(null, 'fill', "rgb(0,200,100)");
            text.textContent="Crash! Score: " + score;
            c.appendChild(text);
        throw new Error("BUUUUU");
    }
}

var counter = steps/10;

function drawLoop() {
    score+=1;
    if (counter++ === steps/10) {
        genBox();
        if (steps>350){
        steps-=10;
        }
        counter = 0;
    }
    while (c.firstChild) {
        c.removeChild(c.firstChild);
    }
    for (var i = 0; i < edges.length; i++) {
        var v1 = edges[i].v1;
        var v2 = edges[i].v2;
        v1.translateMovement();
        v2.translateMovement();
        if (v1.z > cameraPosition[2]) {
            checkCollision(v1, v2);
            edges[i] = 'delete';
        }
    }
    var text = document.createElementNS(ns, 'text');
    text.setAttributeNS(null, 'x', 10);
    text.setAttributeNS(null, 'y', 20);
    text.setAttributeNS(null, 'fill', "rgb(0,200,100)");
    text.textContent="Score: " + score;
    c.appendChild(text);
    var text2 = document.createElementNS(ns, 'text');
    text2.setAttributeNS(null, 'x', 10);
    text2.setAttributeNS(null, 'y', 40);
    text2.setAttributeNS(null, 'fill', "rgb(0,200,100)");
    text2.textContent="Speed: " + (1000-steps);
    c.appendChild(text2);
    edges = edges.filter(function(a){return a !== 'delete'})
    for (var i = 0; i < edges.length; i++) {
            drawLine(edges[i]);
    }
    if (shiftCamera){
        switch(Math.sign(shiftDir)){
            case -1:
                cameraPosition[0]-=step/8;
                shiftDir+=0.125;
                break;
            case 0:
                shiftCamera = false;
                if(currentLineDelta===-1){
                    currentLine--;
                } else {
                    currentLine++;
                }
                currentLineDelta = 0;
                break;
            case 1:
                cameraPosition[0]+=step/8;
                console.log(shiftDir);
                shiftDir-=0.125;
                break;
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

var shiftCamera = false;
var shiftDir = 0;
var currentLineDelta = 0;

function changeCamera(event){
switch(event.keyCode){
    case 37:
        if(!(currentLine===1)&&!shiftCamera){
            shiftCamera = true;
            shiftDir = -1;
            currentLineDelta = -1;
        }
        break;
    case 39:
        if(!(currentLine===3)&&!shiftCamera){
            shiftCamera = true;
            shiftDir = 1;
            currentLineDelta = 1;
        }
        break;
        case 38:
        cameraPosition[1]+=0.1;
        break;
    case 40:
        cameraPosition[1]-=0.1;
        break;
}
}

setUp();
pollFunc(drawLoop, Infinity, 10);