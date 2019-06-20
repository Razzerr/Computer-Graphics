var c = document.getElementById("myCanvas");

var minX = 0, maxX = 10000, minY = 0, maxY = 10000;

var pos = [1000, 2500, 0];

var polyline = "";


var polarToEuclidean = function (length) {
    return [length * Math.cos(pos[2]), length * Math.sin(pos[2])];
};

var realToPixels = function (real) {
    return [((real[0]) / (maxX - minX)) * c.getAttribute('width'), (real[1]) / (maxY - minY) * c.getAttribute('height')];
};

var degreesToPI = function (x) {
    return (x * 2 * Math.PI) / 360;
};


var actions = {
    MOVE: function (length) {
        var vector = polarToEuclidean(length);
        pos = [pos[0] + vector[0], pos[1] + vector[1], pos[2]];
        var mapped_pos = realToPixels(pos);
        polyline += " " + mapped_pos[0].toString(10) + "," + mapped_pos[1].toString(10);
    },

    ROTATE: function (x) {
        var re = /^(-)?[0-9]+$/;
        if (!re.test(x)) {
            document.getElementById("commandLine").value = "WRONG COMMAND!";
        } else {
            pos[2] += degreesToPI(x);
        }
    },

    RESET: function () {
        pos = [1000, 2500, 0];
        var mapped_pos = realToPixels(pos);
        polyline = mapped_pos[0].toString(10) + "," + mapped_pos[1].toString(10);
    }
};


actions.RESET();
