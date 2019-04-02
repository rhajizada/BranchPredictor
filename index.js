var textAsArray = [];
var textArray = [];
var fileIsRead = false;
var fixedTrueLog = "";
var staticLog = "";
var bimodalLog = "";
var twoLayerLog = "";

input.onchange = function (event) {
    var file = event.target.files[0],
        reader = new FileReader();
    reader.onloadend = function (event) {
        textAsArray = reader.result.split("\n");
        for (var i = 0; i < textAsArray.length; i++) {
            var x = textAsArray[i].split("\t");
            var j = {
                address: x[0],
                direction: x[1]
            }
            textArray.push(j)
        }
        textArray.pop();
        t1.style.visibility = "visible";
        t2.style.visibility = "visible";
        t3.style.visibility = "visible";
        out.value = event.target.result;
        bp.value = fixedTrue() + "\n" + static() + "\n" + bimodal() + "\n" + twoLayer() + "\n";
        staticL.value = staticLog;
        fixed.value = fixedTrueLog;
        bimodalL.value = bimodalLog;
        twolayerL.value = twoLayerLog;
        console.dir(bimodalTable);
        console.dir(twoLayerArray);

    };
    fileIsRead = true;
    reader.readAsText(file);

};

function makeArray(w, h, val) {
    /* Creates an array of width w height h and fills it with val*/
    var arr = [];
    for (let i = 0; i < h; i++) {
        arr[i] = [];
        for (let j = 0; j < w; j++) {
            arr[i][j] = val;
        }
    }
    return arr;
}

var staticTable = makeArray(2, 1024, null); // Static Table
var bimodalTable = makeArray(2, 1024, null);
var twoLayerTable = makeArray(2, 1024, null);

function printType() {
    if (fileIsRead) {
        console.log(typeof textAsArray);
    } else {
        alert("No file");
    }
}

function printText() {
    if (fileIsRead) {
        console.dir(textArray);
    } else {
        alert("No file");
    }
}

function fixedTrue() {
    if (fileIsRead) {
        var prediction = '@'
        var timesTrue = 0
        textArray.forEach(function (element) {
            if (element.direction === prediction) {
                timesTrue++
            }
            fixedTrueLog += "Branch: " + element.address + " prediction: " + prediction + " actual: " + element.direction + "\n";
        });
        console.log("Fixed true: " + timesTrue + "/" + (textArray.length));
        return ("Fixed true: " + timesTrue + "/" + (textArray.length));
    } else {
        alert("No file");
        fixedTrueLog = "No input file";
    }
}


function static() {
    if (fileIsRead) {
        var timesTrue = 0
        textArray.forEach(function (element) {
            var prediction = staticCounter(element.address, element.direction)
            if (element.direction === prediction) {
                timesTrue++
            }
            staticLog += "Branch: " + element.address + " prediction: " + prediction + " actual: " + element.direction + "\n";
        });
        console.log("Static: " + timesTrue + "/" + (textArray.length));
        return ("Static: " + timesTrue + "/" + (textArray.length));
    } else {
        alert("No file");
        staticLog = "No input file";
    }
}

function staticCounter(address, actual) {
    var proper;
    if (actual === '@') {
        proper = true;
    } else {
        proper = false;
    }
    var index = parseInt(address, 16) & (~(~0 << 10));
    if (staticTable[index][0] == parseInt(address, 16)) {
        if (staticTable[index][1]) {
            return '@';
        } else {
            return '.';
        }
    } else {
        staticTable[index][0] = parseInt(address, 16);
        staticTable[index][1] = proper
        return '@';
    }
}

function bimodal() {
    if (fileIsRead) {
        var timesTrue = 0
        textArray.forEach(function (element) {
            var prediction = bimodalCounter(element.address, element.direction)
            if (element.direction === prediction) {
                timesTrue++
            }
            bimodalLog += "Branch: " + element.address + " prediction: " + prediction + " actual: " + element.direction + "\n";
        });
        console.log("Bimodal: " + timesTrue + "/" + (textArray.length));
        return ("Bimodal: " + timesTrue + "/" + (textArray.length));
    } else {
        alert("No file");
        bimodalLog = "No input file";
    }
}

function bimodalCounter(address, actual) {
    var proper;
    if (actual === '@') {
        proper = true;
    } else {
        proper = false;
    }
    var index = parseInt(address, 16) & (~(~0 << 10));
    if (bimodalTable[index][0] != parseInt(address, 16)) {
        bimodalTable[index][0] = parseInt(address, 16)
        bimodalTable[index][1] = ~(~0 << 2);
    }
    prediction = Boolean(bimodalTable[index][1] & (1 << 1));
    if (prediction != proper) {
        bimodalTable[index][1] += 1;
    } else {
        bimodalTable[index][1] &= (1 << 1);
    }
    bimodalTable[index][1] &= ~(~0 << 2);
    if (prediction) {
        return '@';
    } else {
        return '.';
    }
}

function twoLayer() {
    if (fileIsRead) {
        var timesTrue = 0
        var s = ""
        textArray.forEach(function (element) {
            var prediction = twoLayerCounter(element.address, element.direction)
            if (element.direction === prediction) {
                timesTrue++
            }
            twoLayerLog += "Branch: " + element.address + " prediction: " + prediction + " actual: " + element.direction + "\n";
        });
        console.log("2-layer: " + timesTrue + "/" + (textArray.length));
        return ("2-layer: " + timesTrue + "/" + (textArray.length));
    } else {
        alert("No file");
        twoLayerLog = "No input file";
    }
}

function twoLayerCounter(address, actual) {
    debugger;
    var proper;
    if (actual === '@') {
        proper = true;
    } else {
        proper = false;
    }
    var index = parseInt(address, 16) & (~(~0 << 10));
    if (twoLayerTable[index][0] != (parseInt(address, 16))) {
        twoLayerTable[index][0] = (parseInt(address, 16));
        twoLayerTable[index][1] = ~((1 << 1) | (1 << 5));
    }
    var history = (twoLayerTable[index][1] & ((1 << 9) | (1 << 8))) >> 8;
    var doubleHistory = 2 * history;
    var pred_err = ((twoLayerTable[index][1] & (((1 << 1) | (1 << 0)) << doubleHistory))) >> doubleHistory;
    var prediction = pred_err & (1 << 1);
    if (Boolean(prediction) != proper) {
        pred_err += 1;
    } else {
        pred_err &= (1 << 1);
    }
    pred_err &= ~(~0 << 2);
    pred_err <<= doubleHistory;
    twoLayerTable[index][1] &= ~(((1 << 1) | (1 << 0)) << (doubleHistory));
    twoLayerTable[index][1] |= pred_err;
    history <<= 1;
    history |= proper ? 1 : 0;
    history &= ~(~0 << 2);
    history <<= 8;
    twoLayerTable[index][1] &= ~((1 << 9) | (1 << 8));
    twoLayerTable[index][1] |= history;
    if (prediction) {
        return '@';
    } else {
        return '.';
    }
}