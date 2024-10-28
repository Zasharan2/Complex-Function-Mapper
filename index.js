var c = document.getElementById("canv");
var ctx = c.getContext("2d");

var keys = [];

document.addEventListener("keydown", function (event) {
    keys[event.key] = true;
    if (["ArrowUp", "ArrowDown", " "].indexOf(event.key) > -1) {
        event.preventDefault();
    }
});

document.addEventListener("keyup", function (event) {
    keys[event.key] = false;
});

var mouseX, mouseY;

c.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

window.addEventListener("mousemove", function(event) {
    mouseX = Math.floor(-256 + event.clientX - c.getBoundingClientRect().left);
    mouseY = Math.floor(256 - (event.clientY - c.getBoundingClientRect().top));
    if (!(mouseX > -256 && mouseY > -256 && mouseX < 256 && mouseY < 256)) {
        mouseDown = false;
        mouseX = NaN;
        mouseY = NaN;
    }
});

var mouseDown, mouseButton;

window.addEventListener("mousedown", function(event) {
    if (mouseX > -256 && mouseY > -256 && mouseX < 256 && mouseY < 256) {
        mouseDown = true;
        mouseButton = event.buttons;
    } else {
        mouseDown = false;
    }
});

window.addEventListener("mouseup", function(event) {
    mouseDown = false;
});

function roundTo(x, precision) {
    return (Math.round(x * (Math.pow(10, precision))) / Math.pow(10, precision));
}

var xRangeSlider = document.getElementById("xRangeSlider");
var yRangeSlider = document.getElementById("yRangeSlider");
var resolutionSlider = document.getElementById("resolutionSlider");
var lineMinDistSlider = document.getElementById("lineMinDistSlider");

var xRangeLabel = document.getElementById("xRangeLabel");
var yRangeLabel = document.getElementById("yRangeLabel");
var resolutionLabel = document.getElementById("resolutionLabel");
var lineMinDistLabel = document.getElementById("lineMinDistLabel");

xRangeSlider.addEventListener("input", function() {
    scale[0] = xRangeSlider.value / 5;
    xRangeLabel.innerText = roundTo(scale[0], 1);
});

yRangeSlider.addEventListener("input", function() {
    scale[1] = yRangeSlider.value / 5;
    yRangeLabel.innerText = roundTo(scale[1], 1);
});

resolutionSlider.addEventListener("input", function() {
    setResolution(resolutionSlider.value / 10);
    resolutionLabel.innerText = roundTo(resolution, 1);
});

lineMinDistSlider.addEventListener("input", function() {
    lineMinDist = lineMinDistSlider.value * 0.4;
    lineMinDistLabel.innerText = roundTo(lineMinDist, 1);
});

var functionInput = document.getElementById("functionInput");
var functionInputButton = document.getElementById("functionInputButton");
var functionRemoveButton = document.getElementById("functionRemoveButton");

var functionDisplaySpan = document.getElementById("functionDisplaySpan");

var inputFunctionList = [];

var inputOperators = ["+", "-", "*", "/", "^", "ln", "log", "sin", "cos", "arcsin", "arccos", "sinh", "cosh", "arcsinh", "arccosh", "d/dz"];

functionInputButton.addEventListener("click", function() {
    if (functionInput.value == "delete") {
        mapFuncZ.pop();
    } else if (inputOperators.includes(functionInput.value)) {
        // operator
        mapFuncZ.push(operators[inputOperators.indexOf(functionInput.value)]);
    } else if (functionInput.value == "z") {
        mapFuncZ.push("Z");
    } else if (functionInput.value.includes("i")) {
        if (functionInput.value.includes("+")) {
            // a+bi OR -a+bi
            mapFuncZ.push(new ComplexNumber(toNum(functionInput.value.split("+")[0]), toNum(functionInput.value.split("+")[1].split("i")[0])));
        } else if (functionInput.value.includes("-")) {
            if (functionInput.value.split("-").length == 2) {
                // a-bi
                mapFuncZ.push(new ComplexNumber(toNum(functionInput.value.split("+")[0]), -1*toNum(functionInput.value.split("+")[1].split("i")[0])));
            } else if (functionInput.value.split("-").length == 3) {
                // -a-bi
                mapFuncZ.push(new ComplexNumber(-1*toNum(functionInput.value.split("+")[1]), -1*toNum(functionInput.value.split("+")[2].split("i")[0])));
            }
        } else if (functionInput.value.includes("i")) {
            // bi
            if (functionInput.value.split("i").length == 2) {
                if (functionInput.value.split("i")[0] == "") {
                    // i = 1i
                    mapFuncZ.push(new ComplexNumber(0, 1));
                } else {
                    mapFuncZ.push(new ComplexNumber(0, functionInput.value.split("i")[0]));
                }
            }
        }
    } else if (toNum(functionInput.value) != NaN) {
        // a
        mapFuncZ.push(new ComplexNumber(toNum(functionInput.value), 0));
    }
    functionInput.value = "";
    updateFunctionDisplay();
});

function toNum(inp) {
    if (inp == "e") {
        return Math.E;
    }
    if (inp == "pi") {
        return Math.PI;
    }
    if (Number(inp) != NaN) {
        return Number(inp);
    }
    return NaN;
}

functionRemoveButton.addEventListener("click", function() {
    mapFuncZ.pop();
    functionInput.value = "";
    updateFunctionDisplay();
});

function updateFunctionDisplay() {
    functionDisplaySpan.innerText = "";
    for (var i = 0; i < mapFuncZ.length; i++) {
        if (i == 0) {
            if (mapFuncZ[i] instanceof ComplexNumber) {
                functionDisplaySpan.innerText += (String(mapFuncZ[i].RealComponent) + "+" + String(mapFuncZ[i].ImaginaryComponent) + "i");
            } else {
                functionDisplaySpan.innerText += String(mapFuncZ[i]);
            }
        } else {
            if (mapFuncZ[i] instanceof ComplexNumber) {
                functionDisplaySpan.innerText += ("," + String(mapFuncZ[i].RealComponent) + "+" + String(mapFuncZ[i].ImaginaryComponent) + "i");
            } else {
                functionDisplaySpan.innerText += "," + String(mapFuncZ[i]);
            }
        }
    }
}

var clearDrawingButton = document.getElementById("clearDrawingButton");

clearDrawingButton.addEventListener("click", function() {
    drawnPoints = [];
});

var scale = [10, 10];

var operators = ["ADD", "SUB", "MUL", "DIV", "POW", "LN", "LOG", "SIN", "COS", "ARCSIN", "ARCCOS", "SINH", "COSH", "ARCSINH", "ARCCOSH", "DEV"];

var complexFunction = true;

class ComplexNumber {
    constructor(re, im) {
        this.SetCartesian(re, im);
    }

    SetCartesian(re, im) {
        this.RealComponent = re;
        this.ImaginaryComponent = im;
        this.CartesianToPolar();
    }

    SetPolar(r, theta) {
        this.Radius = r;
        this.Theta = theta;
        this.PolarToCartesian();
    }

    CartesianToPolar() {
        this.Radius = Math.pow((Math.pow(this.RealComponent, 2) + Math.pow(this.ImaginaryComponent, 2)), 0.5);
        this.Theta = Math.atan2(this.ImaginaryComponent, this.RealComponent);
    }

    PolarToCartesian() {
        this.RealComponent = this.Radius * Math.cos(this.Theta);
        this.ImaginaryComponent = this.Radius * Math.sin(this.Theta);
    }

    Conjugate() {
        return new ComplexNumber(this.RealComponent, -this.ImaginaryComponent)
        // var temp = new ComplexNumber()
        // temp.SetCartesian(this.RealComponent, -this.ImaginaryComponent);
        // return temp;
    }

    Add(z) {
        return new ComplexNumber(this.RealComponent + z.RealComponent, this.ImaginaryComponent + z.ImaginaryComponent);
        // var temp = new ComplexNumber();
        // temp.SetCartesian(this.RealComponent + z.RealComponent, this.ImaginaryComponent + z.ImaginaryComponent);
        // return temp;
    }

    Sub(z) {
        return new ComplexNumber(this.RealComponent - z.RealComponent, this.ImaginaryComponent - z.ImaginaryComponent);
        // var temp = new ComplexNumber();
        // temp.SetCartesian(this.RealComponent - z.RealComponent, this.ImaginaryComponent - z.ImaginaryComponent);
        // return temp;
    }

    Mul(z) {
        var temp = new ComplexNumber();
        temp.SetPolar(this.Radius * z.Radius, this.Theta + z.Theta);
        temp.PolarToCartesian();
        return temp;
    }

    Scale(c) {
        this.RealComponent *= c;
        this.ImaginaryComponent *= c;
        this.CartesianToPolar();
    }

    Inverse() {
        var temp = this.Conjugate();
        temp.Scale(Math.pow(temp.Radius, -2));
        temp.CartesianToPolar();
        return temp;
    }

    Div(z) {
        return this.Mul(z.Inverse());
    }

    Exp() {
        // shallow copy
        var temp = new ComplexNumber(this.RealComponent, this.ImaginaryComponent);
        temp.Radius = Math.exp(temp.RealComponent);
        temp.Theta = temp.ImaginaryComponent;
        temp.PolarToCartesian();
        return temp;
    }

    Ln() {
        // shallow copy
        var temp = new ComplexNumber(this.RealComponent, this.ImaginaryComponent);
        temp.CartesianToPolar();
        temp.RealComponent = Math.log(temp.Radius);
        temp.ImaginaryComponent = temp.Theta;
        temp.CartesianToPolar();
        return temp;
    }

    Pow(z) {
        return (z.Mul(this.Ln())).Exp();
    }

    Cos() {
        return this.Mul(new ComplexNumber(0, 1)).Exp().Add(this.Mul(new ComplexNumber(0, -1)).Exp()).Div(new ComplexNumber(2, 0));
    }

    Sin() {
        return this.Mul(new ComplexNumber(0, 1)).Exp().Sub(this.Mul(new ComplexNumber(0, -1)).Exp()).Div(new ComplexNumber(0, 2));
    }

    Cosh() {
        return this.Mul(new ComplexNumber(0, 1)).Cos();
    }

    Sinh() {
        return this.Mul(new ComplexNumber(0, 1)).Sin().Mul(new ComplexNumber(0, -1));
    }
};

var mapFuncX = [];
var mapFuncY = [];

var mapFuncZ = [];

// // mirror
// mapFuncX = ["X"];
// mapFuncY = ["Y"];

// // rotation
// mapFuncX = [0,"Y","SUB"];
// mapFuncY = ["X"];

// // polar
// mapFuncX = ["Y","COS","X","MUL"];
// mapFuncY = ["Y","SIN","X","MUL"];

// // 1/z = (x/(x^2+y^2), -y/(x^2+y^2))
// mapFuncX = ["X","X",2,"POW","Y",2,"POW","ADD","DIV"];
// mapFuncY = [0,"Y","SUB","X",2,"POW","Y",2,"POW","ADD","DIV"];

// // what
// mapFuncX = ["X","COS","X","MUL"];
// mapFuncY = ["Y","SIN","X","MUL"];

// // e^z
// mapFuncX=["Y","COS",Math.E,"X","POW","MUL"];
// mapFuncY=["Y","SIN",Math.E,"X","POW","MUL"];

// z
mapFuncZ = ["Z"];

// // z*i
// mapFuncZ = ["Z",new ComplexNumber(0, 1),"MUL"];

// // z^2
// mapFuncZ = ["Z",new ComplexNumber(2,0),"POW"];

// // z^i
// mapFuncZ = ["Z",new ComplexNumber(0,1),"POW"];

// // ln(z)
// mapFuncZ = ["Z","LN"];

// // e^z
// mapFuncZ = [new ComplexNumber(Math.E,0),"Z","POW"];

// // z^z
// mapFuncZ = ["Z","Z","POW"];

// // cos(z)
// mapFuncZ = ["Z","COS"];

// // √z
// mapFuncZ = ["Z", new ComplexNumber(0.5, 0), "POW"]

// // 1/z
// mapFuncZ = ["Z", new ComplexNumber(-1, 0), "POW"]

// // 1/((z)(z-1))
// mapFuncZ = ["Z", new ComplexNumber(-1, 0), "Z", "ADD", "MUL", new ComplexNumber(-1, 0), "POW"]

var stack = [];

function performOperator(op) {
    switch (op) {
        // [x,y,'ADD'] --> y+x
        case "ADD": {
            var p = stack.pop();
            var q = stack.pop();
            if (complexFunction) {
                stack.push(p.Add(q));
            } else {
                stack.push(p + q);
            }
            break;
        }
        // [x,y,'SUB'] --> x-y
        case "SUB": {
            var p = stack.pop();
            var q = stack.pop();
            if (complexFunction) {
                stack.push(q.Sub(p));
            } else {
                stack.push(q - p);
            }
            break;
        }
        // [x,y,'MUL'] --> y*x
        case "MUL": {
            var p = stack.pop();
            var q = stack.pop();
            if (complexFunction) {
                stack.push(p.Mul(q));
            } else {
                stack.push(p * q);
            }
            break;
        }
        // [x,y,'DIV'] --> x/y
        case "DIV": {
            var p = stack.pop();
            var q = stack.pop();
            if (complexFunction) {
                stack.push(q.Div(p));
            } else {
                stack.push(q / p);
            }
            break;
        }
        // [x,y,'POW'] --> x^y
        case "POW": {
            var p = stack.pop();
            var q = stack.pop();
            if (complexFunction) {
                stack.push(q.Pow(p));
            } else {
                stack.push(Math.pow(q, p));
            }
            break;
        }
        // [x,'LN'] --> ln(x)
        case "LN": {
            var p = stack.pop();
            if (complexFunction) {
                stack.push(p.Ln());
            } else {
                stack.push(Math.log(p));
            }
            break;
        }
        // [x,y,'LOG'] --> log_x(y)
        case "LOG": {
            var p = stack.pop();
            var q = stack.pop();
            if (complexFunction) {
                stack.push((p.Ln()).Div(q.Ln()));
            } else {
                stack.push((Math.log(p) / Math.log(q)));
            }
            break;
        }
        // [x, 'SIN'] --> sin(x)
        case "SIN": {
            var p = stack.pop();
            if (complexFunction) {
                stack.push(p.Sin());
            } else {
                stack.push(Math.sin(p));
            }
            break;
        }
        // [x, 'COS'] --> cos(x)
        case "COS": {
            var p = stack.pop();
            if (complexFunction) {
                stack.push(p.Cos());
            } else {
                stack.push(Math.cos(p));
            }
            break;
        }
        // [x, 'ARCSIN'] --> arcsin(x)
        case "ARCSIN": {
            var p = stack.pop();
            stack.push(Math.asin(p));
            break;
        }
        // [x, 'ARCCOS'] --> arccos(x)
        case "ARCCOS": {
            var p = stack.pop();
            stack.push(Math.acos(p));
            break;
        }
        // [x, 'SINH'] --> sinh(x)
        case "SINH": {
            var p = stack.pop();
            if (complexFunction) {
                stack.push(p.Sinh());
            } else {
                stack.push(Math.sinh(p));
            }
            break;
        }
        // [x, 'COSH'] --> cosh(x)
        case "COSH": {
            var p = stack.pop();
            if (complexFunction) {
                stack.push(p.Cosh());
            } else {
                stack.push(Math.cosh(p));
            }
            break;
        }
        // [x, 'ARCSINH'] --> arcsinh(x)
        case "ARCSINH": {
            var p = stack.pop();
            stack.push(Math.asinh(p));
            break;
        }
        // [x, 'ARCCOSH'] --> arccosh(x)
        case "ARCCOSH": {
            var p = stack.pop();
            stack.push(Math.acosh(p));
            break;
        }
        default: {
            break;
        }
    }
}

function calculateMappings(inpX, inpY) {
    stack = [];
    if (complexFunction) {
        for (var i = 0; i < mapFuncZ.length; i++) {
            if (operators.includes(mapFuncZ[i])) {
                performOperator(mapFuncZ[i]);
            } else {
                if (mapFuncZ[i] == "X") {
                    stack.push(inpX);
                } else if (mapFuncZ[i] == "Y") {
                    stack.push(inpY);
                } else if (mapFuncZ[i] == "Z") {
                    stack.push(new ComplexNumber(inpX, inpY));
                } else {
                    stack.push(mapFuncZ[i]);
                }
            }
        }
    } else {
        for (var i = 0; i < mapFuncX.length; i++) {
            if (operators.includes(mapFuncX[i])) {
                performOperator(mapFuncX[i]);
            } else {
                if (mapFuncX[i] == "X") {
                    stack.push(inpX);
                } else if (mapFuncX[i] == "Y") {
                    stack.push(inpY);
                } else {
                    stack.push(mapFuncX[i]);
                }
            }
        }
        for (var i = 0; i < mapFuncY.length; i++) {
            if (operators.includes(mapFuncY[i])) {
                performOperator(mapFuncY[i]);
            } else {
                if (mapFuncY[i] == "X") {
                    stack.push(inpX);
                } else if (mapFuncY[i] == "Y") {
                    stack.push(inpY);
                } else {
                    stack.push(mapFuncY[i]);
                }
            }
        }
    }
}

function mapPoint(inpX, inpY, size, colour) {
    if ((mapFuncZ.length > 0 && complexFunction) || (mapFuncX.length > 0 && mapFuncY.length > 0 && (!complexFunction))) {
        // point in input space
        ctx.fillStyle = colour;
        if ((256 + inpX) > 0 && (256 + inpX) < 512 && (256 - inpY) > 0 && (256 - inpY) < 512)
        ctx.fillRect((256 + inpX) - (size / 2), (256 - inpY) - (size / 2), size, size);

        // calculateMappings(inpX / scale[0], inpY / scale[1]);
        calculateMappings(inpX * scale[0] / 256, inpY * scale[1] / 256);

        // point in output space
        ctx.fillStyle = colour;
        if (complexFunction) {
            stack = [stack[0].RealComponent, stack[0].ImaginaryComponent]
        }
        if (768 + (256 * stack[0] / scale[0]) > 512 && 768 + (256 * stack[0] / scale[0]) < 1024 && 256 - (256 * stack[1] / scale[1]) > 0 && 256 - (256 * stack[1] / scale[1]) < 512) {
            ctx.fillRect((768 + (256 * stack[0] / scale[0])) - (size / 2), (256 - ((256 * stack[1] / scale[1]))) - (size / 2), size, size);
        }
    }
}

var drawnPoints = [];

var lineMinDist = 20;
var resolution = 1;
var calcRes = 1 / resolution;

function setResolution(res) {
    resolution = res;
    calcRes = 1 / resolution;
}

function main() {
    // background
    ctx.fillStyle = "#ffffffff";
    ctx.fillRect(0, 0, 1024, 512);

    // dividing line
    ctx.moveTo(512, 0);
    ctx.strokeStyle = "#000000ff";
    ctx.lineWidth = 3;
    ctx.lineTo(512, 512);
    ctx.stroke();

    // draw original centre behind the mapped centre in output space
    ctx.fillStyle = "#88888888";
    ctx.fillRect(768 - (5 / 2), 256 - (5 / 2), 5, 5);

    // map y lines
    for (var a = -scale[0]; a < scale[0]; a++) {
        for (var b = -256; b < 256; b += calcRes) {
            // draw original gridlines behind the mapped gridlines in output space
            ctx.fillStyle = "#88888888";
            ctx.fillRect((768 + (a + (scale[0] - Math.round(scale[0]))) * 256 / scale[0]) - (1 / 2), (256 - b) - (1 / 2), 1, 1);

            mapPoint((a + (scale[0] - Math.round(scale[0]))) * 256 / scale[0], b, 1, "#ff0000ff");
        }
    }

    // map x lines
    for (var a = -scale[1]; a < scale[1]; a++) {
        for (var b = -256; b < 256; b += calcRes) {
            // draw original gridlines behind the mapped gridlines in output space
            ctx.fillStyle = "#88888888";
            ctx.fillRect((768 + b) - (1 / 2), (256 - (a + (scale[1] - Math.round(scale[1]))) * 256 / scale[1]) - (1 / 2), 1, 1);

            mapPoint(b, (a + (scale[1] - Math.round(scale[1]))) * 256 / scale[1], 1, "#0000ffff");
        }
    }

    // map centre
    mapPoint(0, 0, 5, "#000000ff");

    // map curve
    for (var a = 0; a < drawnPoints.length; a++) {
        if (a != drawnPoints.length - 1) {
            if ((Math.abs(drawnPoints[a][0] - drawnPoints[a + 1][0]) < lineMinDist) && (Math.abs(drawnPoints[a][1] - drawnPoints[a + 1][1]) < lineMinDist)) {
                // linear interpolation between two close points ("smooth" the curve)
                for (var b = 0; b < 1; b += (calcRes * 0.1)) {
                    mapPoint(drawnPoints[a][0] + (b*(drawnPoints[a + 1][0] - drawnPoints[a][0])), drawnPoints[a][1] + (b*(drawnPoints[a + 1][1] - drawnPoints[a][1])), 3, "#000000ff");
                }
            } else {
                mapPoint(drawnPoints[a][0], drawnPoints[a][1], 3, "#000000ff");
            }
        } else {
            mapPoint(drawnPoints[a][0], drawnPoints[a][1], 3, "#000000ff");
        }
    }

    // map mouse
    mapPoint(mouseX, mouseY, 5, "#000000ff");

    if (mouseDown) {
        drawnPoints.push([mouseX, mouseY]);
    }
}

var deltaTime = 0;
var deltaCorrect = (1 / 8);
var prevTime = Date.now();
function loop() {
    deltaTime = (Date.now() - prevTime) * deltaCorrect;
    prevTime = Date.now();

    main();
    window.requestAnimationFrame(loop);
}

function init() {
    window.requestAnimationFrame(loop)
}
window.requestAnimationFrame(init);