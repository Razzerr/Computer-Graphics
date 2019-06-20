var canvas;
var gl;

var vertexShader;
var fragmentShader;
var program;

function main()
{
    // Getting canvas and gl context
    console.log("Initialising canvas and gl context");
    canvas = document.getElementById("myCanvas");
    gl = canvas.getContext("webgl");

    // Initialising shaders and buffer
    console.log("Creating shaders and buffer");
    initShaders();

    // Initial canvas clearing
    console.log("Initial canvas clearing");
    clear();

    // Draw lines separating the regions
    draw(gl.LINES, new Float32Array([
        -1.0, 0.0,
        1.0, 0.0,
        -0.333, 1.0,
        -0.333, -1.0,
        0.333, 1.0,
        0.333, -1.0
    ]));

    // Initialise Objects to draw
    var lineVerts = new Float32Array([
        -0.9, 0.9,
        -0.433, 0.1
    ]);

    var lineStripVerts = new Float32Array([
        -0.3, 0.9,
        0.3, 0.7,
        -0.3, 0.5,
        0.3, 0.3,
        -0.3, 0.1
    ]);

    var lineLoopVerts = new Float32Array([
        0.433, 0.9,
        0.9, 0.6,
        0.6, 0.1,
        0.8, 0.2
    ]);

    var triangleVerts = new Float32Array([
        -0.9, -0.1,
        -0.433, -0.6,
        -0.8, -0.8
    ]);

    var triangleStripVerts = new Float32Array([
        -0.3, -0.1,
        0.3, -0.2,
        -0.2, -0.4,
        0.1, -0.6,
        -0.3, -0.9
    ]);

    var triangleFanVerts = new Float32Array([
        0.666, -0.7,
        0.7, -0.1,
        0.9, -0.5,
        0.8, -0.9,
        0.5, -0.9,
        0.4, -0.6
    ]);

    var pointVerts = new Float32Array([
        0.0, 0.0
    ]);

    // Draw initialised objects
    draw(gl.POINTS, pointVerts);

    draw(gl.LINES, lineVerts);
    draw(gl.LINE_STRIP, lineStripVerts);
    draw(gl.LINE_LOOP, lineLoopVerts);

    draw(gl.TRIANGLES, triangleVerts);
    draw(gl.TRIANGLE_STRIP, triangleStripVerts);
    draw(gl.TRIANGLE_FAN, triangleFanVerts);

    // Print log
    getActiveLog();
}

function getActiveLog()
{
    var info;

    const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < numAttribs; ++i)
    {
        info = gl.getActiveAttrib(program, i);
        console.log('ATTRIBUTE\n> name:', info.name, '\n> type:', info.type, '\n> size:', info.size);
    }

    const numUniform = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < numUniform; ++i)
    {
        info = gl.getActiveUniform(program, 0);
        console.log('UNIFORM\n> name:', info.name, '\n> type:', info.type, '\n> size:', info.size);
    }

}

function draw(type, verts)
{
    var n = initBuffers(verts);
    if(n<0)
    {
        console.error("Failed to set verts position");
        return;
    }
    gl.drawArrays(type, 0, n);
}

function initBuffers(verts)
{
    var n = verts.length/2;

    var vertexBuffer = gl.createBuffer();
    if(!vertexBuffer)
    {
        console.error("Failed to create buffer");
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    gl.useProgram(program);

    var positionLoc = gl.getAttribLocation(program, "position");
    if(positionLoc < 0)
    {
        console.error("Failed to get location of position");
        return -1;
    }

    var colorLoc = gl.getUniformLocation(program, "color");
    if(colorLoc < 0)
    {
        console.error("Failed to get location of color");
        return -1;
    }

    gl.uniform3f(colorLoc, Math.random(), Math.random(), Math.random());

    gl.vertexAttribPointer(
        positionLoc, // location of attribute (because we bind it, we can enter 4 instead of "positionLoc")
        2, // number of elements
        gl.FLOAT, // type
        false,
        2 * Float32Array.BYTES_PER_ELEMENT, // size per vertex
        0 // bytes that data is shifted by
    );

    gl.enableVertexAttribArray(positionLoc);

    return n;
}

function clear()
{
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function initShaders()
{
    // Creating vertex shader
    vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, [
       `attribute vec2 position;
   
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }`
    ].join('\n'));

    // Creating fragment shader
    fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, [
       `precision mediump float;
        uniform vec3 color;
    
        void main() {
            gl_FragColor = vec4(color, 1.0);
        }`
    ].join('\n'));

    // Compiling shaders
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    // Creating program and attaching shaders
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // Binding attribute to 0th position
    gl.bindAttribLocation(program, 4, "position");

    // Linking program
    gl.linkProgram(program);
}