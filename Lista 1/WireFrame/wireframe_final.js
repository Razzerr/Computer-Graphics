var c = document.getElementById("canvas");
var height = c.getAttribute('height');
var width = c.getAttribute('width');
var ns = 'http://www.w3.org/2000/svg'

var worldCoords = {minX: -1, maxX: 1, minY: -1, maxY: 1, minZ: -1, maxZ: 1}
var horizon = 10;
var cameraM = [[1,0,0,0],[0,1,0,0],[0,0,-1,0],[0, 0.6, 0, 1]];
var boxes = []

var xStep = (worldCoords.maxX - worldCoords.minX)/5
var lineMiddle = [worldCoords.minX+1.5*xStep, worldCoords.minX+2.5*xStep, worldCoords.minX+3.5*xStep]
var steps = 1000;
var score = 0;
currentLine = 1;

class Box{
    constructor(line){
        this.line = line
        this.m = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[lineMiddle[line], 0.2, horizon, 1]];
        this.v = [[xStep/2, xStep/2, xStep/2, 1], [xStep/2, xStep/2, -xStep/2, 1], [xStep/2, -xStep/2, xStep/2, 1],[xStep/2, -xStep/2, -xStep/2, 1],
             [-xStep/2, xStep/2, xStep/2, 1], [-xStep/2, xStep/2, -xStep/2, 1],[-xStep/2, -xStep/2, xStep/2, 1], [-xStep/2, -xStep/2, -xStep/2, 1]];
        this.edges = [];
        for (var i=0; i<8; i++){
            for (var j = i; j<8; j++){
                if(this.v[i][0]*this.v[j][0] + this.v[i][1]*this.v[j][1] + this.v[i][2]*this.v[j][2] === (xStep*xStep)/4){
                    this.edges.push([this.v[i], this.v[j]])
                }
            }
        }
    }
}

function randBox(){
    boxes.push(new Box(Math.floor(Math.random()*3)));
}

function drawBox(box){
    for (var i = 0; i < box.edges.length; i++){
        drawLine(
            zeroToWindow(
                perspectiveToZero(
                    cameraToPerspective(
                        worldToCamera(
                            localToWorld(box.edges[i], box.m))))))
    }
}


function localToWorld(edge, m){
    return math.multiply(edge, m);
}

function worldToCamera(edge){
    var temp = math.multiply(edge, math.inv(cameraM))
    if (temp[0][2]>=0 && temp[1][2]<0){
        temp[0][2] = -0.0001
    } else if (temp[0][2]>=0 && temp[1][2]>=0){
        temp[0][2] = 50000
        temp[1][2] = 50000
    } else if (temp[0][2]<0 && temp[1][2]>=0){
        temp[1][2] = -0.0001
    }
    return temp
}

function cameraToPerspective(edge){
    var temp = [[edge[0][0]/edge[0][2]*-1, edge[0][1]/edge[0][2]], [edge[1][0]/edge[1][2]*-1, edge[1][1]/edge[1][2]]]
    return temp
}

function perspectiveToZero(edge){
    return [[(edge[0][0]-worldCoords.minX)/2, (edge[0][1]-worldCoords.minY)/2],
            [(edge[1][0]-worldCoords.minX)/2, (edge[1][1]-worldCoords.minY)/2]]
}

function zeroToWindow(edge){
    return [[width*edge[0][0], height*edge[0][1]], [width*edge[1][0], height*edge[1][1]]]
}

function drawLine(edge) {
    var line = document.createElementNS(ns, 'line');
    line.setAttributeNS(null, 'x1', edge[0][0]);
    line.setAttributeNS(null, 'y1', edge[0][1]);
    line.setAttributeNS(null, 'x2', edge[1][0]);
    line.setAttributeNS(null, 'y2', edge[1][1]);
    line.setAttributeNS(null, 'style', "stroke:rgb(0,200,100);stroke-width:1");
    c.appendChild(line);
}

function setUp() {
    document.onkeydown = changeCamera;
}

var counter = steps/10;
function drawLoop() {
    score+=1;
    if (counter++ === steps/10) {
        randBox();
        if (steps>350){
        steps-=10;
        }
        counter = 0;
    }
    while (c.firstChild) {
        c.removeChild(c.firstChild);
    }
    for (var i = 0; i<boxes.length; i++){
        boxes[i].m[3][2]-=4*(horizon-cameraM[3][2])/steps;
        if (boxes[i].line === currentLine && boxes[i].m[3][2]-cameraM[3][2]<xStep/2){
            var text = document.createElementNS(ns, 'text');
            text.setAttributeNS(null, 'x', width/2-5);
            text.setAttributeNS(null, 'y', height/2);
            text.setAttributeNS(null, 'fill', "rgb(0,200,100)");
            text.textContent="Crash! Score: " + score;
            c.appendChild(text);
            throw new Error("BUUUUU");
        }
        drawBox(boxes[i])
        if (boxes[i].m[3][2] < xStep/2){
            boxes[i]='delete'
        }
    }
    boxes = boxes.filter(function(a){return a !== 'delete'})

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

        //vertical
    drawLine(zeroToWindow(perspectiveToZero(cameraToPerspective(worldToCamera([[worldCoords.minX+xStep, 0, horizon, 1],
        [worldCoords.minX+xStep, 0, 0, 1]])))))
    drawLine(zeroToWindow(perspectiveToZero(cameraToPerspective(worldToCamera([[worldCoords.minX+2*xStep, 0, horizon, 1],
        [worldCoords.minX+2*xStep, 0, 0, 1]])))))
    drawLine(zeroToWindow(perspectiveToZero(cameraToPerspective(worldToCamera([[worldCoords.minX+3*xStep, 0, horizon, 1],
        [worldCoords.minX+3*xStep, 0, 0, 1]])))))
    drawLine(zeroToWindow(perspectiveToZero(cameraToPerspective(worldToCamera([[worldCoords.minX+4*xStep, 0, horizon, 1],
        [worldCoords.minX+4*xStep, 0, 0, 1]])))))
        //horizontal
    drawLine(zeroToWindow(perspectiveToZero(cameraToPerspective(worldToCamera([[10*worldCoords.minX, 0, horizon, 1],
        [10*worldCoords.maxX, 0, horizon, 1]])))))

    if (shiftCamera){
        switch(Math.sign(shiftDir)){
            case -1:
                cameraM[3][0]-=xStep/8;
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
                cameraM[3][0]+=xStep/8;
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
        if(!(currentLine===0)&&!shiftCamera){
            shiftCamera = true;
            shiftDir = -1;
            currentLineDelta = -1;
        }
        break;
    case 39:
        if(!(currentLine===2)&&!shiftCamera){
            shiftCamera = true;
            shiftDir = 1;
            currentLineDelta = 1;
        }
        break;
    case 38:
        cameraM[3][1]+=xStep/8;
        break;
    case 40:
        cameraM[3][1]-=xStep/8;
        break;
}
}
setUp();
pollFunc(drawLoop, Infinity, 20);