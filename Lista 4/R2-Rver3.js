var canvas = document.getElementById('canvasId');
var gl = canvas.getContext('experimental-webgl');

//VARIABLES
var sun_position = [0, 0, 127];
var sun_color = [0.5, 0.2, 0.4, 0.9];

var bg_color = [0.2, 0.2, 0.5, 0.7];
var object_color = [0.5, 0.5, 0.5, 0.5];

var vertices, indices, colors, normals, v_length;
var x_range = [-1, 1];
var y_range = [-1, 1];
var result, step, index, len;

//FUNCTIONS
var functions = {
    'f1': function(x,y){x*y}, 
};

function initiate(fun = 'f1'){
    vertices = [];
    indices = [];
    colors = [];
    normals = [];
    v_length = 0;
    step = 0.1;
    generateVertices(fun);
    triangulateMesh();
}

function generateVertices(fun) {
    for (i = x_range[0]; i <= x_range[1]; i += step) {
        for (j = y_range[0]; j <= y_range[1]; j += step) {
            vertices.push(i, j, functions[fun](i, j));
            colors.push(object_color[0], object_color[1], object_color[2]);
            v_length++;
        }
    }
}

function triangulateMesh(){
    x_index = 0;
    y_index = 0;
    var len = Math.floor(v_length/(x_range[1]-x_range[0]));
    for (i = x_range[0]; i <= x_range[1]-step; i += step) {
        for (j = y_range[0]; j <= y_range[1]-step; j += step) {
            indices.push(y_index + x_index*len, y_index+1 + x_index*len, (x_index+1)*len + y_index);
            indices.push(y_index+1 + (x_index+1)*len, y_index+1 + x_index*len, (x_index+1)*len + y_index);
            y_index++;
        }
        y_index = 0;
        x_index++;
    }
    console.log(indices);
}
