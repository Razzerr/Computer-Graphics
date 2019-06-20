var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

var minX = 0, maxX = 10000, minY = 0, maxY = 10000;

var pos = [(maxX - minX) / 2, (maxY - minY) / 2, 0];
var prevPos;
var pen = [false, "#000000"];


var polarToEuclidean = function (length) {
    return [length * Math.cos(pos[2]), length * Math.sin(pos[2])];
};

var realToPixels = function (real) {
    return [((real[0]) / (maxX - minX)) * ctx.canvas.width, ctx.canvas.height - (real[1]) / (maxY - minY) * ctx.canvas.height];
};

var degreesToPI = function (x) {
    return (x * 2 * Math.PI) / 360;
};


var actions = {
    MOVE: function (length) {
        var re = /^[0-9]+$/;
        if (!re.test(length)) {
            document.getElementById("commandLine").value = "WRONG COMMAND!";
        } else {
            var vector = polarToEuclidean(length);
            prevPos = pos;
            pos = [pos[0] + vector[0], pos[1] + vector[1], pos[2]];
            var mappedPrevPos = realToPixels(prevPos);
            var mapped_pos = realToPixels(pos);
            ctx.beginPath();
            switch (pen[0]) {
                case true:
                    ctx.moveTo(mappedPrevPos[0], mappedPrevPos[1]);
                    ctx.strokeStyle = pen[1];
                    ctx.lineTo(mapped_pos[0], mapped_pos[1]);
                    ctx.stroke();
                    break;
                case false:
                    ctx.moveTo(mapped_pos[0], mapped_pos[1]);
                    break;
            }
        }
    },

    ROTATE: function (x) {
        var re = /^(-)?[0-9]+$/;
        if (!re.test(x)) {
            document.getElementById("commandLine").value = "WRONG COMMAND!";
        } else {
            pos[2] += degreesToPI(x);
        }
    },

    COLOR: function(x){
        var re = /^[0-9a-fA-F]{6}$/;
        if (!re.test(x)) {
            document.getElementById("commandLine").value = "WRONG COMMAND!";
        } else {
            pen[1] = "#"+x;
        }
    },

    PEN_DOWN: function () {
            pen[0] = true;
    },

    PEN_UP: function () {
            pen[0] = false;
    },

    RESET: function () {
        pos = [(maxX - minX) / 2, (maxY - minY) / 2, 0];
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.moveTo(realToPixels(pos)[0], realToPixels(pos)[1]);
        pen[0] = false;
    }
};

actions.RESET();