/*------------------------------------ Step1: Prepare the canvas and get WebGL context ---------------------------------------*/
var canvas = document.getElementById('canvasId');
var gl = canvas.getContext('experimental-webgl');
var result, min, step, index, vertices, indices, normals, colors, len;

var ambient = 0.8;
var bg = [0.1, 0.1, 0.3, 1];
var light_pos = [10, 0, 0];
var light_col = [0, 0.6, 0];

var light_pos2 = [0, 0, 0];
var light_col2 = [0, 0, 0];
function webGlStart(fun = 'f1') {
    result = [];
    min = -1, max = 1;
    step = 0.002;
    index = 0;
    len=0;
    vertices = [];
    indices = [];
    colors = [];
    normals = [];

    genVertices(fun);
    makeTriangles();
    initBuffers();
    initVertexShader();
    initFragmentShader();
    initShaderProgram();
    connectBufferShader();
    draw();

    canvas.onpointerdown = click;

    window.onkeydown = onKeyDown;
}

function getNormal(v1, v2){
    return [v2[1]*v1[2]-v2[2]*v1[1], v2[2]*v1[0]-v2[0]*v1[2], v2[0]*v1[1]-v2[1]*v1[0]];
}

function genVertices(fun) {
    var color = 0.5;
    for (i = min; i <= max; i += step) {
        len+=1;
        for (j = min; j <= max; j += step) {
            vertices.push(i, j, ((fun == 'f1') ? f1(i, j) : ((fun == 'f2') ? f2(i, j) :((fun == 'f3') ? f3(i, j) : f4(i, j)))));
            colors.push(color, color, color);
            /*if (color >= 0.3) color=0.1;
            else color += 0.1;*/
        }
    }
}
function makeTriangles() {//TRIANGULATION
    var iIndex = 0;
    var jIndex = 0;
    var normal = [0, 0, 0];
    for (i = min; i <= max - step; i += step) {
        for (j = min; j <= max - step; j += step) {
            indices.push(jIndex+iIndex*len, jIndex+1+iIndex*len, jIndex+(iIndex+1)*len);
            indices.push(jIndex+1+iIndex*len, jIndex+(iIndex+1)*len, jIndex+1+(iIndex+1)*len);
            jIndex++;
        }
        jIndex=0;
        iIndex++;
    }
    iIndex = 0;
    jIndex = 0;
    var result = [];
    for (i = min; i <= max; i += step) {
        for (j = min; j <= max; j += step) {
            var vx = vertices[jIndex+iIndex*len], vy = vertices[jIndex+iIndex*len + 1], vz = vertices[jIndex+iIndex*len +2];
            if (typeof vertices[jIndex+(iIndex-3)*len] !== 'undefined' && typeof vertices[jIndex-3+iIndex*len] !== 'undefined'){
                result = getNormal([vertices[jIndex+(iIndex-3)*len]-vx, vertices[jIndex+1+(iIndex-3)*len]-vy, vertices[jIndex+2+(iIndex-3)*len]-vz],
                 [vertices[jIndex-3+iIndex*len]-vx, vertices[jIndex-2+iIndex*len]-vy, vertices[jIndex-1+iIndex*len]-vz]);
                if (!isNaN(result[0]) && !isNaN(result[1]) && !isNaN(result[2])){
                normal[0] += result[0];
                normal[1] += result[1];
                normal[2] += result[2];
                }
            }
            if (typeof vertices[jIndex-3+iIndex*len] !== 'undefined' && typeof vertices[jIndex-3+(iIndex+1)*len] !== 'undefined'){
                result = getNormal([vertices[jIndex-3+iIndex*len]-vx, vertices[jIndex-2+iIndex*len]-vy, vertices[jIndex-1+iIndex*len]-vz],
                    [vertices[jIndex-3+(iIndex+3)*len]-vx, vertices[jIndex-2+(iIndex+3)*len]-vy, vertices[jIndex-1+(iIndex+3)*len]-vz]);
                if (!isNaN(result[0]) && !isNaN(result[1]) && !isNaN(result[2])){
                normal[0] += result[0];
                normal[1] += result[1];
                normal[2] += result[2];
                }
            }
            if (typeof vertices[jIndex-3+(iIndex+3)*len] !== 'undefined' && typeof vertices[jIndex+(iIndex+3)*len] !== 'undefined'){
                result = getNormal([vertices[jIndex-3+(iIndex+3)*len]-vx, vertices[jIndex-2+(iIndex+3)*len]-vy, vertices[jIndex-1+(iIndex+3)*len]-vz],
                    [vertices[jIndex+(iIndex+3)*len]-vx, vertices[jIndex+1+(iIndex+3)*len]-vy, vertices[jIndex+2+(iIndex+3)*len]-vz]);
                if (!isNaN(result[0]) && !isNaN(result[1]) && !isNaN(result[2])){
                normal[0] += result[0];
                normal[1] += result[1];
                normal[2] += result[2];
                }
            }
            if (typeof vertices[jIndex+(iIndex+3)*len] !== 'undefined' && typeof vertices[jIndex+3+(iIndex)*len] !== 'undefined'){
                result = getNormal([vertices[jIndex+(iIndex+3)*len]-vx, vertices[jIndex+1+(iIndex+3)*len]-vy, vertices[jIndex+2+(iIndex+3)*len]-vz],
                [vertices[jIndex+3+(iIndex)*len]-vx, vertices[jIndex+4+(iIndex)*len]-vy, vertices[jIndex+5+(iIndex)*len]-vz]);
                if (!isNaN(result[0]) && !isNaN(result[1]) && !isNaN(result[2])){
                normal[0] += result[0];
                normal[1] += result[1];
                normal[2] += result[2];
                }
            }
            if (typeof vertices[jIndex+3+(iIndex)*len] !== 'undefined' && typeof vertices[jIndex+3+(iIndex-3)*len] !== 'undefined'){
                result = getNormal([vertices[jIndex+3+(iIndex)*len]-vx, vertices[jIndex+4+(iIndex)*len]-vy, vertices[jIndex+5+(iIndex)*len]-vz],
                [vertices[jIndex+3+(iIndex-3)*len]-vx, vertices[jIndex+4+(iIndex-3)*len]-vy, vertices[jIndex+5+(iIndex-3)*len]-vz]);
                if (!isNaN(result[0]) && !isNaN(result[1]) && !isNaN(result[2])){
                normal[0] += result[0];
                normal[1] += result[1];
                normal[2] += result[2];
                }
            }
            if (typeof vertices[jIndex+3+(iIndex-3)*len] !== 'undefined' && typeof vertices[jIndex+(iIndex-3)*len] !== 'undefined'){
                result = getNormal([vertices[jIndex+3+(iIndex-3)*len]-vx, vertices[jIndex+4+(iIndex-3)*len]-vy, vertices[jIndex+5+(iIndex-3)*len]-vz],
                [vertices[jIndex+(iIndex-3)*len]-vx, vertices[jIndex+1+(iIndex-3)*len]-vy, vertices[jIndex+2+(iIndex-3)*len]-vz]);
                if (!isNaN(result[0]) && !isNaN(result[1]) && !isNaN(result[2])){
                normal[0] += result[0];
                normal[1] += result[1];
                normal[2] += result[2];
                }
            }
            normals.push(normal[0], normal[1], normal[2]);
            normal = [0, 0, 0];
            jIndex+=3;
        }
        iIndex+=3;
        jIndex=0;
    }

    /*
    vertices.push(0, -0.01, -0.01, 0, -0.01, 0.01, 1, 0, 0);
    for (i = 0; i < 3; i++){
    normals.push(vertices[vertices.length-5]*vertices[vertices.length-7]-vertices[vertices.length-4]*vertices[vertices.length-8]);
    normals.push(vertices[vertices.length-4]*vertices[vertices.length-9]-vertices[vertices.length-6]*vertices[vertices.length-7]);
    normals.push(vertices[vertices.length-6]*vertices[vertices.length-8]-vertices[vertices.length-5]*vertices[vertices.length-9]);
    }
    vertices.push(0, -0.01, 0.01, 0, 0.01, 0.01, 1, 0, 0);
    for (i = 0; i < 3; i++){
        normals.push(vertices[vertices.length-5]*vertices[vertices.length-7]-vertices[vertices.length-4]*vertices[vertices.length-8]);
        normals.push(vertices[vertices.length-4]*vertices[vertices.length-9]-vertices[vertices.length-6]*vertices[vertices.length-7]);
        normals.push(vertices[vertices.length-6]*vertices[vertices.length-8]-vertices[vertices.length-5]*vertices[vertices.length-9]);
        }
    vertices.push(0, 0.01, 0.01, 0, 0.01, -0.01, 1, 0, 0);
    for (i = 0; i < 3; i++){
        normals.push(vertices[vertices.length-5]*vertices[vertices.length-7]-vertices[vertices.length-4]*vertices[vertices.length-8]);
        normals.push(vertices[vertices.length-4]*vertices[vertices.length-9]-vertices[vertices.length-6]*vertices[vertices.length-7]);
        normals.push(vertices[vertices.length-6]*vertices[vertices.length-8]-vertices[vertices.length-5]*vertices[vertices.length-9]);
        }
    vertices.push(0, 0.01, -0.01, 0, -0.01, -0.01, 1, 0, 0);
    for (i = 0; i < 3; i++){
        normals.push(vertices[vertices.length-5]*vertices[vertices.length-7]-vertices[vertices.length-4]*vertices[vertices.length-8]);
        normals.push(vertices[vertices.length-4]*vertices[vertices.length-9]-vertices[vertices.length-6]*vertices[vertices.length-7]);
        normals.push(vertices[vertices.length-6]*vertices[vertices.length-8]-vertices[vertices.length-5]*vertices[vertices.length-9]);
        }

    vertices.push(-0.01, 0, -0.01, -0.01, 0, 0.01, 0, 1, 0);
    for (i = 0; i < 3; i++){
        normals.push(vertices[vertices.length-5]*vertices[vertices.length-7]-vertices[vertices.length-4]*vertices[vertices.length-8]);
        normals.push(vertices[vertices.length-4]*vertices[vertices.length-9]-vertices[vertices.length-6]*vertices[vertices.length-7]);
        normals.push(vertices[vertices.length-6]*vertices[vertices.length-8]-vertices[vertices.length-5]*vertices[vertices.length-9]);
        }
    vertices.push(-0.01, 0, 0.01, 0.01, 0, 0.01, 0, 1, 0);
    for (i = 0; i < 3; i++){
        normals.push(vertices[vertices.length-5]*vertices[vertices.length-7]-vertices[vertices.length-4]*vertices[vertices.length-8]);
        normals.push(vertices[vertices.length-4]*vertices[vertices.length-9]-vertices[vertices.length-6]*vertices[vertices.length-7]);
        normals.push(vertices[vertices.length-6]*vertices[vertices.length-8]-vertices[vertices.length-5]*vertices[vertices.length-9]);
        }
    vertices.push(0.01, 0, 0.01, 0.01, 0, -0.01, 0, 1, 0);
    for (i = 0; i < 3; i++){
        normals.push(vertices[vertices.length-5]*vertices[vertices.length-7]-vertices[vertices.length-4]*vertices[vertices.length-8]);
        normals.push(vertices[vertices.length-4]*vertices[vertices.length-9]-vertices[vertices.length-6]*vertices[vertices.length-7]);
        normals.push(vertices[vertices.length-6]*vertices[vertices.length-8]-vertices[vertices.length-5]*vertices[vertices.length-9]);
        }
    vertices.push(0.01, 0, -0.01, -0.01, 0, -0.01, 0, 1, 0);
    for (i = 0; i < 3; i++){
        normals.push(vertices[vertices.length-5]*vertices[vertices.length-7]-vertices[vertices.length-4]*vertices[vertices.length-8]);
        normals.push(vertices[vertices.length-4]*vertices[vertices.length-9]-vertices[vertices.length-6]*vertices[vertices.length-7]);
        normals.push(vertices[vertices.length-6]*vertices[vertices.length-8]-vertices[vertices.length-5]*vertices[vertices.length-9]);
        }

    vertices.push(-0.01, -0.01, 0, -0.01, 0.01, 0, 0, 0, 1);
    for (i = 0; i < 3; i++){
        normals.push(vertices[vertices.length-5]*vertices[vertices.length-7]-vertices[vertices.length-4]*vertices[vertices.length-8]);
        normals.push(vertices[vertices.length-4]*vertices[vertices.length-9]-vertices[vertices.length-6]*vertices[vertices.length-7]);
        normals.push(vertices[vertices.length-6]*vertices[vertices.length-8]-vertices[vertices.length-5]*vertices[vertices.length-9]);
        }
    vertices.push(-0.01, 0.01, 0, 0.01, 0.01, 0, 0, 0, 1);
    for (i = 0; i < 3; i++){
        normals.push(vertices[vertices.length-5]*vertices[vertices.length-7]-vertices[vertices.length-4]*vertices[vertices.length-8]);
        normals.push(vertices[vertices.length-4]*vertices[vertices.length-9]-vertices[vertices.length-6]*vertices[vertices.length-7]);
        normals.push(vertices[vertices.length-6]*vertices[vertices.length-8]-vertices[vertices.length-5]*vertices[vertices.length-9]);
        }
    vertices.push(0.01, 0.01, 0, 0.01, -0.01, 0, 0, 0, 1);
    for (i = 0; i < 3; i++){
        normals.push(vertices[vertices.length-5]*vertices[vertices.length-7]-vertices[vertices.length-4]*vertices[vertices.length-8]);
        normals.push(vertices[vertices.length-4]*vertices[vertices.length-9]-vertices[vertices.length-6]*vertices[vertices.length-7]);
        normals.push(vertices[vertices.length-6]*vertices[vertices.length-8]-vertices[vertices.length-5]*vertices[vertices.length-9]);
        }
    vertices.push(0.01, -0.01, 0, -0.01, -0.01, 0, 0, 0, 1);
    for (i = 0; i < 3; i++){
        normals.push(vertices[vertices.length-5]*vertices[vertices.length-7]-vertices[vertices.length-4]*vertices[vertices.length-8]);
        normals.push(vertices[vertices.length-4]*vertices[vertices.length-9]-vertices[vertices.length-6]*vertices[vertices.length-7]);
        normals.push(vertices[vertices.length-6]*vertices[vertices.length-8]-vertices[vertices.length-5]*vertices[vertices.length-9]);
        }
    colors.push(0.5, 0.1, 0.1, 0.5, 0.1, 0.1, 0, 0, 0);
    colors.push(0.5, 0.1, 0.1, 0.5, 0.1, 0.1, 0, 0, 0);
    colors.push(0.5, 0.1, 0.1, 0.5, 0.1, 0.1, 0, 0, 0);
    colors.push(0.5, 0.1, 0.1, 0.5, 0.1, 0.1, 0, 0, 0);
    colors.push(0.1, 0.5, 0.1, 0.1, 0.5, 0.1, 0, 0, 0);
    colors.push(0.1, 0.5, 0.1, 0.1, 0.5, 0.1, 0, 0, 0);
    colors.push(0.1, 0.5, 0.1, 0.1, 0.5, 0.1, 0, 0, 0);
    colors.push(0.1, 0.5, 0.1, 0.1, 0.5, 0.1, 0, 0, 0);
    colors.push(0.1, 0.1, 0.5, 0.1, 0.1, 0.5, 0, 0, 0);
    colors.push(0.1, 0.1, 0.5, 0.1, 0.1, 0.5, 0, 0, 0);
    colors.push(0.1, 0.1, 0.5, 0.1, 0.1, 0.5, 0, 0, 0);
    colors.push(0.1, 0.1, 0.5, 0.1, 0.1, 0.5, 0, 0, 0);
    indices.push(genIndex, genIndex + 1, genIndex + 2, genIndex + 3, genIndex + 4, genIndex + 5, genIndex + 6, genIndex + 7, genIndex + 8);
    genIndex += 9;
    indices.push(genIndex, genIndex + 1, genIndex + 2, genIndex + 3, genIndex + 4, genIndex + 5, genIndex + 6, genIndex + 7, genIndex + 8);
    genIndex += 9;
    indices.push(genIndex, genIndex + 1, genIndex + 2, genIndex + 3, genIndex + 4, genIndex + 5, genIndex + 6, genIndex + 7, genIndex + 8);
    genIndex += 9;
    indices.push(genIndex, genIndex + 1, genIndex + 2, genIndex + 3, genIndex + 4, genIndex + 5, genIndex + 6, genIndex + 7, genIndex + 8);
    */console.log(vertices.length);
    console.log(indices.length);
}


function f1(x, y) { return 1/(Math.exp(Math.pow((x*5),2)*Math.pow((y*5),2))); }//cone
function f2(x, y) { return 1 / (15 * (Math.pow(x, 2) + Math.pow(y, 2))); }//funnel
function f3(x, y) { return Math.sin(10 * (Math.pow(x, 2) + Math.pow(y, 2)))/10 ; }//ripples
function f4(x, y) { return Math.pow(Math.pow(0.4, 2) - Math.pow((0.6 - Math.pow((Math.pow(x, 2) + Math.pow(y, 2)), 0.5)), 2), 0.5); }//torus

/*--------------------------------- Step2: Define the geometry and store it in buffer objects -------------------------------*/
var vertex_buffer;
var color_buffer;
var index_buffer;
var normal_buffer;

function initBuffers() {
    // Create a new buffer object
    vertex_buffer = gl.createBuffer();
    // Bind an empty array buffer to it
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    // Pass the vertices data to the buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    // Unbind the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Create an empty buffer object and store color data
    color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    normal_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

/*--------------------------------------- Step3: Create and compile Shader programs -----------------------------------------*/
var vertShader;
var fragShader;
var shaderProgram;
function initVertexShader() {
    // Vertex shader source code
    var vertCode =
        'attribute vec3 coordinates;' +
        'attribute vec3 color;' +
        'attribute vec3 normal;' +
        'varying vec3 vNormal;' +
        'varying vec3 vColor;' +

        'varying vec3 pos;' +
        //matrices
        'uniform mat4 Pmatrix;' +
        'uniform mat4 Vmatrix;' +
        'uniform mat4 Mmatrix;' +
        'void main(void) {' +
        ' gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(coordinates, 1.0);' +
        ' gl_PointSize = 1.0;'+
        ' vColor = color;' +
        ' vNormal = normal;' +
        ' pos = vec3(Mmatrix * vec4(coordinates, 1.0));' +
        '}';

    //Create a vertex shader object
    vertShader = gl.createShader(gl.VERTEX_SHADER);
    //Attach vertex shader source code
    gl.shaderSource(vertShader, vertCode);
    //Compile the vertex shader
    gl.compileShader(vertShader);
    console.log(gl.getShaderInfoLog(vertShader));
}

function initFragmentShader() {
    //Fragment shader source code
    var fragCode =
        'precision mediump float;' +
        'varying vec3 vColor;' +
        'uniform vec3 bg;'+
        'varying vec3 pos;' +
        'varying vec3 vNormal;' +
        'uniform vec3 lightPos;' +
        'uniform vec3 lightCol;' +
        'uniform vec3 lightPos2;' +
        'uniform vec3 lightCol2;' +

        'uniform float ambient;' + 
        'void main(void) {' +
        'vec3 lightDir = normalize(lightPos - pos);' + 
        'vec3 lightDir2 = normalize(lightPos2 - pos);' + 
        'vec3 norm = normalize(vNormal);' +
        'float diff = max(dot(norm, lightDir), 0.0);' + 
        'float diff2 = max(dot(norm, lightDir2), 0.0);' + 
        'vec3 diffuse = diff * lightCol;' +
        'vec3 diffuse2 = diff2 * lightCol2;' +
        'vec3 ambientCol = ambient*vec3(1, 1, 1);' +
        'vec3 result = (ambient + diffuse + diffuse2) *  vColor;' +
        //'vec3 result = (ambient ) * vColor;' +
        'gl_FragColor = vec4(result, 1);' +
        '}';
    // Create fragment shader object
    fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    // Attach fragment shader source code
    gl.shaderSource(fragShader, fragCode);
    // Compile the fragment shader
    gl.compileShader(fragShader);
    console.log(gl.getShaderInfoLog(fragShader));
}

// Create a shader program object to store combined shader program
function initShaderProgram() {
    shaderProgram = gl.createProgram();
    // Attach a vertex shader
    gl.attachShader(shaderProgram, vertShader);
    // Attach a fragment shader
    gl.attachShader(shaderProgram, fragShader);
    // Link both programs
    gl.linkProgram(shaderProgram);
    // Use the combined shader program object
    gl.useProgram(shaderProgram);
}

/*------------------------------- Step 4: Associate the shader programs to buffer objects -----------------------------------*/
var Pmatrix;
var Vmatrix;
var Mmatrix;

function connectBufferShader() {
    Pmatrix = gl.getUniformLocation(shaderProgram, "Pmatrix");
    Vmatrix = gl.getUniformLocation(shaderProgram, "Vmatrix");
    Mmatrix = gl.getUniformLocation(shaderProgram, "Mmatrix");

    //Bind vertex buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    //Get the attribute location
    var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    //point an attribute to the currently bound VBO
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    //Enable the attribute
    gl.enableVertexAttribArray(coord);

    //Bind normals
    gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer);
    var normals_loc = gl.getAttribLocation(shaderProgram, "normal");
    gl.vertexAttribPointer(normals_loc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normals_loc);

    // bind the color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    // get the attribute location
    var color = gl.getAttribLocation(shaderProgram, "color");
    var bgt = gl.getUniformLocation(shaderProgram, "bg");
    var ambient_loc = gl.getUniformLocation(shaderProgram, "ambient");
    var light_pos_loc = gl.getUniformLocation(shaderProgram, "lightPos");
    var light_col_loc = gl.getUniformLocation(shaderProgram, "lightCol");
    gl.uniform3fv(bgt, new Float32Array(bg.slice(0, 3)));
    gl.uniform1f(ambient_loc, ambient);
    gl.uniform3fv(light_pos_loc, new Float32Array(light_pos));
    gl.uniform3fv(light_col_loc, new Float32Array(light_col));

    var light_pos2_loc = gl.getUniformLocation(shaderProgram, "lightPos2");
    var light_col2_loc = gl.getUniformLocation(shaderProgram, "lightCol2");
    gl.uniform3fv(light_pos2_loc, new Float32Array(light_pos2));
    gl.uniform3fv(light_col2_loc, new Float32Array(light_col2));
    // point attribute to the volor buffer object
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0);
    // enable the color attribute
    gl.enableVertexAttribArray(color);

}

/*==================== MATRIX =====================*/

function get_projection(angle, a, zMin, zMax) {
    var ang = Math.tan((angle * .5) * Math.PI / 180);
    return [
        0.5 / ang, 0, 0, 0,
        0, 0.5 * a / ang, 0, 0,
        0, 0, -(zMax + zMin) / (zMax - zMin), -1,
        0, 0, (-2 * zMax * zMin) / (zMax - zMin), 0
    ];
}

var proj_matrix = get_projection(40, canvas.width / canvas.height, 1, 100);

var mov_matrix = [1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1];
var view_matrix = [1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1];

// translating z
view_matrix[14] = view_matrix[14] - 3;//zoom

/*==================== Rotation ====================*/

function rotateZ(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv0 = m[0], mv4 = m[4], mv8 = m[8];

    m[0] = c * m[0] - s * m[1];
    m[4] = c * m[4] - s * m[5];
    m[8] = c * m[8] - s * m[9];

    m[1] = c * m[1] + s * mv0;
    m[5] = c * m[5] + s * mv4;
    m[9] = c * m[9] + s * mv8;
}

function rotateX(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv1 = m[1], mv5 = m[5], mv9 = m[9];

    m[1] = m[1] * c - m[2] * s;
    m[5] = m[5] * c - m[6] * s;
    m[9] = m[9] * c - m[10] * s;

    m[2] = m[2] * c + mv1 * s;
    m[6] = m[6] * c + mv5 * s;
    m[10] = m[10] * c + mv9 * s;
}

function rotateY(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv0 = m[0], mv4 = m[4], mv8 = m[8];

    m[0] = c * m[0] + s * m[2];
    m[4] = c * m[4] + s * m[6];
    m[8] = c * m[8] + s * m[10];

    m[2] = c * m[2] - s * mv0;
    m[6] = c * m[6] - s * mv4;
    m[10] = c * m[10] - s * mv8;
}

function moveX(m, dist) {
    m[12] += dist;
}
function moveY(m, dist) {
    m[13] += dist;
}
function moveZ(m, dist) {
    m[14] += dist;
}


/*------------------------------------- Step5: Drawing the required object (triangle) ----------------------------------------*/
var type = 'p';
function draw() {
    // Clear the canvas
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(bg[0], bg[1], bg[2], bg[3]);
    gl.clearDepth(1.0);

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Draw the triangle
    gl.uniformMatrix4fv(Pmatrix, false, proj_matrix);
    gl.uniformMatrix4fv(Vmatrix, false, view_matrix);
    gl.uniformMatrix4fv(Mmatrix, false, mov_matrix);
    switch(type){
        case 't':
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
            gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
            break;
        case 'p':
            gl.drawArrays(gl.POINTS, 0, vertices.length/3);
    }
}

function onKeyDown(e) {
    // var code=e.keyCode? e.keyCode : e.charCode;
    var code = e.which || e.keyCode;
    switch (code) {
        /*case 38: // up
        case 73: // I
        case 40: // down
        case 75: // K
        case 37: // left
        case 74:// J
        case 39:// right
        case 76: // L
        case 70: // F
        case 66: // B
        case 86: // V
        case 32: // space*/
        case 80: // P
            type = 'p';
            draw();
            break;
        case 84: // T
            type = 't';
            draw();
            break;
        case 49: // 1
            webGlStart('f1');
            break;
        case 50: // 2
            webGlStart('f2');
            break;
        case 51: // 3
            webGlStart('f3');
            break;
        case 52: // 4
            webGlStart('f4');
            break;
        case 82: // R
            mov_matrix = [1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1];
            view_matrix = [1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1];

            // translating z
            view_matrix[14] = -3;//zoom
            draw();
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
function onMouseMove(e) {
    rotateY(view_matrix, e.movementX * (Math.PI/1000));
    rotateX(view_matrix, e.movementY * (Math.PI/1000));
    draw();
}

function onWheel(e) {
    view_matrix[14] += e.wheelDeltaY / 300;
    draw();
}

function click() {
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
    canvas.requestPointerLock();
    window.onmousemove = onMouseMove;
    window.onwheel = onWheel;
}