let rows = document.getElementsByClassName("table-row");
let vector_table = document.getElementById("vector-table");
let showMath = document.getElementById("show-math");
let stepsDiv = document.getElementById("steps-div");
let outputDiv = document.getElementById("output-div");
let bottomRow = rows[rows.length - 1];

const translations = {
    en: {
        magnitude: "Magnitude",
        direction: "Direction (degrees)",
        no_vectors: "Please put in at least two vectors",
    }
};




function clamp_n180_180(degrees) {
    degrees = degrees % 360;

    if (degrees > 180) {
        degrees -= 360;
    }
    return degrees;
}


function addStep(parent, content) {
    let paragraph = document.createElement("p");
    paragraph.innerText = content;
    parent.append(paragraph);
}


function createRow() {
    let input = document.createElement("input");
        input.setAttribute("class", "table-input");
        input.setAttribute("placeholder", translations.en.magnitude);
        input.setAttribute("name", "magnitude");

    let tBox1 = document.createElement("td");
        tBox1.setAttribute("class", "table-box");
        tBox1.append(input);

    input = document.createElement("input");
        input.setAttribute("class", "table-input");
        input.setAttribute("placeholder", translations.en.direction);
        input.setAttribute("name", "direction");

    let tBox2 = document.createElement("td");
        tBox2.setAttribute("class", "table-box");
        tBox2.append(input);


    let tRow = document.createElement("tr");
        tRow.setAttribute("class", "table-row");
        tRow.append(tBox1, tBox2);

    return tRow;
}


function sumVectors(args) {
    let xTotal = 0;
    let yTotal = 0;
    let newX, newY;
    stepsDiv.style.borderStyle = "solid";

    for (let i = 0; i < args.length; i++) {
        let vector = args[i];
        addStep(stepsDiv, `Converting vector: ${vector}`);


        // Speed up the math for 0 degree cases to skip multiplying by 0 a lot
        if (vector[1] === 0) {
            addStep(stepsDiv, `Finished: (${vector[0]}, 0)`);
            xTotal += vector[0];
        } 
        else { // SOHCAHTOA
            newX = vector[0] * Math.cos(vector[1] * Math.PI / 180); // cos(degrees) = xDisp / magnitude
            newY = vector[0] * Math.sin(vector[1] * Math.PI / 180); // sin(degrees) = yDisp / magnitude

            addStep(stepsDiv, `${vector[0]} * cos(${vector[1]}) = ${newX}, ${vector[0]} * sin(${vector[1]}) = ${newY}`);
            addStep(stepsDiv, `Finished: (${newX}, ${newY})`);

            xTotal += newX;
            yTotal += newY;
        }
    }

    let finalMag = Math.sqrt(xTotal**2 + yTotal**2); // totalX^2 + totalY^2 = totalDisp^2
    let finalDir = Math.atan(yTotal / xTotal) * 180 / Math.PI; // tan(totalDegree) = totalY / totalX
    addStep(stepsDiv, `Conversions complete. Totals:`);
    addStep(stepsDiv, `Magnitude: ${finalMag}`);
    addStep(stepsDiv, `Direction (raw): ${finalDir}`);


    let quad = 1;
    /* quadrant II:
        resulting angle (finalDir) will be negative because it's the arctan of a negative number
        the angle relative to positive x-axis would be the angle adjacent to finalDir
        180 - abs(finalDir), or 180 + finalDir, is the angle in relation to the positive section of the x-axis
     or quad III:
         finalDir will be positive because it's the arctan of a positive number
         the correct angle will be finalDir + 180
    */ 
    if (xTotal < 0) {
        finalDir += 180; quad = yTotal < 0 ? 3 : 2;
    }
    /* quadrant IV:
        finalDir will be negative
        because its in quadrant IV the angle measure relative to the x-axis in quad I ==
        360 - abs(finalDir) == 360 + finalDir
    */
    else if (yTotal < 0) {
        finalDir += 360; quad = 4;
    }

    if (quad !== 1)
    {
        addStep(stepsDiv, `Angle in Quadrant ${quad}. Refactoring angle to relate to origin.`);
        addStep(stepsDiv, `Direction (relative): ${finalDir}`);
    }

    return [finalMag, finalDir];
}





function addRow(event) {
    let inputs = bottomRow.children; // The actual td wrappers for the inputs

    // check if the bottom row is not empty
    if (inputs[0].children[0].value !== "" || inputs[1].children[0].value !== "") {
        let row = createRow();

        vector_table.children[0].appendChild(row);

        // Update bottomRow and move the event listener onto it
        bottomRow.removeEventListener("keyup", addRow);
        rows = document.getElementsByClassName("table-row");
        bottomRow = rows[rows.length - 1];
        bottomRow.addEventListener("keyup", addRow);
    }
}


function calculate(event) {
    if (event.button === 0) {
        stepsDiv.innerText = "";
        stepsDiv.style.borderStyle = "hidden";

        let vectorArray = [];

        for (let row of document.getElementsByClassName("table-row")) {
            if (row.children[0].children[0].value === "") { continue; }

            let mag = +row.children[0].children[0].value;
            if (Number.isNaN(mag) || mag === 0) { continue; }

            let dir = +row.children[1].children[0].value;
            if (Number.isNaN(dir)) { continue; }

            vectorArray.push([mag, dir]);
        }

        if (vectorArray.length < 1) {
            outputDiv.setAttribute("style", "color: red");
            outputDiv.innerText = translations.en.no_vectors;
        }
        else {
            outputDiv.setAttribute("style", "color: black");
            outputDiv.innerText = "";

            let answer = sumVectors(vectorArray);

            let magDiv = document.createElement("div");
                magDiv.innerText = "Magnitude: " + answer[0];

            let dirDiv = document.createElement("div");
                dirDiv.innerText = "Direction: " + answer[1] + "°";

            let dirClampedDiv = document.createElement("div");
                dirClampedDiv.innerText = "Direction (-180 to 180): " + clamp_n180_180(answer[1]) + "°";


            outputDiv.prepend(magDiv);
            outputDiv.append(dirDiv);
            outputDiv.append(dirClampedDiv);
        }
    }
}


function clear(event) {
    clearTable(event);
    clearOutput(event);
}

function clearOutput(event) {
    outputDiv.innerHTML = "";
}

function clearTable(event) {
    stepsDiv.innerText = "";
    stepsDiv.style.borderStyle = "hidden";

    let tRow = createRow();
    tRow.addEventListener("keyup", addRow); 

    vector_table.children[0].remove();
    vector_table.append(document.createElement("tbody"));
    vector_table.children[0].append(tRow);

    bottomRow = tRow;
}

function enableMathDisplay(event) {
    if (event.button === 0) {
        if (stepsDiv.getAttribute("data-active") === "true") {
            showMath.setAttribute("style", "background-color: lightgray");
            stepsDiv.setAttribute("data-active", "false");
        }
        else if (stepsDiv.getAttribute("data-active") === "false") {
            showMath.setAttribute("style", "background-color: cadetblue");
            stepsDiv.setAttribute("data-active", "true");
        }
    }
}


// Register event listeners
showMath.addEventListener("click", enableMathDisplay);
document.getElementById("clear-button").addEventListener("click", clear);
document.getElementById("calculate-button").addEventListener("click", calculate);
bottomRow.addEventListener("keyup", addRow);
