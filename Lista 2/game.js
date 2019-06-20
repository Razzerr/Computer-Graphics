var canvas = document.getElementById('canvasId');
var gl = canvas.getContext('experimental-webgl');

var ball, paddle, vertices, indices, colors, bg;
var proj_matrix, mov_matrix, view_matrix;

function start(){
    setUp();
    generateVertices();
    initBuffers();
    initVertexShader();
    initFragmentShader();
    initShaderProgram();
    connectBufferShader();
    draw();
    game();
    window.onkeydown = onKeyDown;
}

//game logic
function game(){
    var id = setInterval(frame, 25);
    function frame(){
        var angle = (ball.alpha/180) * Math.PI;
        ball.x += Math.cos(angle)*ball.speed;
        ball.y += Math.sin(angle)*ball.speed;
        if (ball.x >= 1-paddle.w && ball.y < paddle.y + paddle.h && ball.y > paddle.y - paddle.h){
            ball.alpha = 180 - ball.alpha;
        } else if (ball.x <= -1){
            ball.alpha = 180 - ball.alpha;
        } else if (ball.x >= 1){
            console.log("Lost");
            window.clearInterval(id);
        }
        if (ball.y < -1 || ball.y > 1){
            ball.alpha = -ball.alpha;
        } 

        generateVertices();
        initBuffers();
        connectBufferShader();
        draw();
    }
}

function setUp(){
    ball = {x: 0.0, y: 0.0, s: 0.01, alpha: -150, speed: 0.02}; 
    paddle = {x: 1.0, y: 0.0, h: 0.2, w: 0.05}; 
    bg = {r: 0, g: 0, b: 0, s: 1};
    proj_matrix = get_projection(40, canvas.width / canvas.height, 1, 100);

    mov_matrix = [1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1];
    view_matrix = [1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, -1.9, 1];
}

function generateVertices(){
    vertices = []; 
    indices = []; 
    colors = []; 
    //Pushing ball vertices
    vertices.push(ball.x-ball.s, ball.y-ball.s, 0.4901);
    vertices.push(ball.x-ball.s, ball.y+ball.s, 0.4901);
    vertices.push(ball.x+ball.s, ball.y-ball.s, 0.4901);
    vertices.push(ball.x+ball.s, ball.y+ball.s, 0.4901);

    indices.push(0, 1, 2, 1, 2, 3);
    //Pushing paddle vertices
    vertices.push(paddle.x - paddle.w, paddle.y - paddle.h, 0.4901);
    vertices.push(paddle.x - paddle.w, paddle.y + paddle.h, 0.4901);
    vertices.push(paddle.x + paddle.w, paddle.y - paddle.h, 0.4901);
    vertices.push(paddle.x + paddle.w, paddle.y + paddle.h, 0.4901);
    indices.push(4, 5, 6, 5, 6, 7);
    for (i = 0; i < 8; i++) colors.push(0.7, 0.7, 0.7);

    //Pushing background




    vertices.push(-1.5, -1.5, 0.49);//8
    vertices.push(-1.0, -1.0, 0.49);//9

    vertices.push(-1.5, 1.5, 0.49);//12
    vertices.push(-1.0, 1.0, 0.49);//13

    vertices.push(1.5, -1.5, 0.49);//10
    vertices.push(1.0, -1.0, 0.49);//11

    vertices.push(1.5, 1.5, 0.49);//14
    vertices.push(1.0, 1.0, 0.49);//15
    indices.push(8, 9, 10, 9, 10, 11, 8, 9, 12, 9, 12, 13, 14, 15, 12, 15, 12, 13, 14, 15, 10, 15, 10, 11);
    for (i = 0; i < 4; i++) colors.push(0.5, 0.7, 0.5);
    colors.push(0.7, 0.5, 0.5);
    colors.push(0.7, 0.5, 0.5);
    colors.push(0.7, 0.5, 0.5);
    colors.push(0.7, 0.5, 0.5);
    
}
//Starting WebGL fun
//---Buffers
var vertex_buffer;
var index_buffer;
var color_buffer;

function initBuffers() {
    vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}
//---Shaders
var vertShader;
var fragShader;
var shaderProgram;
function initVertexShader() {
    var vertCode =
        'attribute vec3 coordinates;' +
        'attribute vec3 color;' +
        'varying vec3 vColor;' +
        //matrices
        'uniform mat4 Pmatrix;' +
        'uniform mat4 Vmatrix;' +
        'uniform mat4 Mmatrix;' +
        'void main(void) {' +
        ' gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(coordinates, 1.0);' +
        ' gl_PointSize = 1.0;'+
        ' vColor = color;' +
        '}';


    vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertCode);
    gl.compileShader(vertShader);
    console.log(gl.getShaderInfoLog(vertShader));
}

function initFragmentShader() {
    var fragCode =
        'precision mediump float;' +
        'varying vec3 vColor;' +
        'void main(void) {' +
        'gl_FragColor = vec4(vColor, 1);' +
        '}';
    fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(fragShader);
    console.log(gl.getShaderInfoLog(fragShader));
}

function initShaderProgram() {
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);
}

//---Matrices
var Pmatrix;
var Vmatrix;
var Mmatrix;

//Connecting buffors to shaders
function connectBufferShader() {
    Pmatrix = gl.getUniformLocation(shaderProgram, "Pmatrix");
    Vmatrix = gl.getUniformLocation(shaderProgram, "Vmatrix");
    Mmatrix = gl.getUniformLocation(shaderProgram, "Mmatrix");

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);

    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    var colorBuff = gl.getAttribLocation(shaderProgram, "color");
    gl.vertexAttribPointer(colorBuff, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorBuff);
}

function get_projection(angle, a, zMin, zMax) {
    var ang = Math.tan((angle * .5) * Math.PI / 180);
    return [
        0.5 / ang, 0, 0, 0,
        0, 0.5 * a / ang, 0, 0,
        0, 0, -(zMax + zMin) / (zMax - zMin), -1,
        0, 0, (-2 * zMax * zMin) / (zMax - zMin), 0
    ];
}

function draw() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(bg.r, bg.g, bg.b, bg.s);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL); 

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(Pmatrix, false, proj_matrix);
    gl.uniformMatrix4fv(Vmatrix, false, view_matrix);
    gl.uniformMatrix4fv(Mmatrix, false, mov_matrix);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    console.log("Drawing");
}

function onKeyDown(e) {
    // var code=e.keyCode? e.keyCode : e.charCode;
    var code = e.which || e.keyCode;
    switch (code) {
        case 38: // up
            if (paddle.y + paddle.h < 1){
                paddle.y += 0.05;
            }
            break;
        case 40: // down
            if (paddle.y - paddle.h > -1){
                paddle.y -= 0.05;
            }
            break;
        /*
        case 75: // K
        case 37: // left
        case 74:// J
        case 39:// right
        case 76: // L
        case 70: // F
        case 66: // B
        case 86: // V
        case 32: // space
        case 80: // P
        case 84: // T
        case 49: // 1
        case 50: // 2
        case 51: // 3
        case 52: // 4*/
        case 82: // R
            console.log("Restart");
            start();
            break;
        /*case 81: // Q
        case 69: // E
        case 191: // ?
        case 68: // D
        case 13: // enter
        case 187: // +
        case 27: // escape
        case 189: // -
        case 86: // V
        case 46: // Delete
        case 51: // #
        case 83: // S
        case 65: // A
        case 56: // *
        case 88: // X
        case 74: // J*/
    }
}