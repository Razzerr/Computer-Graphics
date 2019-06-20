var c = document.getElementById("canvas");
var height = c.getAttribute('height');
var width = c.getAttribute('width');
var ns = 'http://www.w3.org/2000/svg'

var worldCoords = {minX: -1, maxX: 1, minY: -1, maxY: 1, minZ: -1, maxZ: 1}
var cameraM = [[1,0,0,0],[0,1,0,0],[0,0,-1,0],[0, 0.2, 0, 1]];
var boxes = []
var mouse = {x: width/2, y: height/2}
var rotation = {a: 0, b: 0}

class Box{
    constructor(x, y, z, l){
        this.m = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[x,y,z,1]];
        this.v = [[l/2, l/2, l/2, 1], [l/2, l/2, -l/2, 1], [l/2, -l/2, l/2, 1],[l/2, -l/2, -l/2, 1],
             [-l/2, l/2, l/2, 1], [-l/2, l/2, -l/2, 1],[-l/2, -l/2, l/2, 1], [-l/2, -l/2, -l/2, 1]];
        this.edges = [];
        for (var i=0; i<8; i++){
            for (var j = i; j<8; j++){
                if(this.v[i][0]*this.v[j][0] + this.v[i][1]*this.v[j][1] + this.v[i][2]*this.v[j][2] === (l*l)/4){
                    this.edges.push([this.v[i], this.v[j]])
                }
            }
        }
    }
}

function randBox(){
    boxes.push(new Box(Math.random()*2-1, 0.05, Math.random()*2-1, 0.1));
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
    for (var i = 0; i<10; i++){
        randBox()
    }
    document.onkeydown = changeCamera;
    document.onmousemove = mouseMove;
    c.onclick = function() {
        c.requestPointerLock();
      }
}

function drawLoop() {
    while (c.firstChild) {
        c.removeChild(c.firstChild);
    }
    for (var i = 0; i<boxes.length; i++){
    drawBox(boxes[i])
    }
        //vertical
        drawLine(zeroToWindow(perspectiveToZero(cameraToPerspective(worldToCamera([[-1, 0, 1, 1],[-1, 0, -1, 1]])))))
        drawLine(zeroToWindow(perspectiveToZero(cameraToPerspective(worldToCamera([[1, 0, 1, 1],[1, 0, -1, 1]])))))
        //horizontal
        drawLine(zeroToWindow(perspectiveToZero(cameraToPerspective(worldToCamera([[-1, 0, 1, 1],[1, 0, 1, 1]])))))
        drawLine(zeroToWindow(perspectiveToZero(cameraToPerspective(worldToCamera([[-1, 0, -1, 1],[1, 0, -1, 1]])))))
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

function changeCamera(event){
    switch(event.keyCode){
        case 37:
            cameraM[3][0]-=0.01;
            break;
        case 38:
            cameraM[3][2]+=0.01;
            break;
        case 39:
            cameraM[3][0]+=0.01;
            break;
        case 40:
            cameraM[3][2]-=0.01;
            break;
    }
}

function mouseMove(e){
    rotation.a += e.movementY/1000;
    cameraM[1][1]=Math.cos(rotation.a);
    cameraM[1][2]=Math.sin(rotation.a)*-1;
    cameraM[2][1]=Math.sin(rotation.a);
    cameraM[2][2]=Math.cos(rotation.a)*-1;
    rotation.b += e.movementX/1000;
    cameraM[0][0]=Math.cos(rotation.b);
    cameraM[0][2]=Math.sin(rotation.b);
    cameraM[2][0]=Math.sin(rotation.b)*-1;
    cameraM[2][2]=Math.cos(rotation.b)*-1;
}

setUp();
pollFunc(drawLoop, Infinity, 30);