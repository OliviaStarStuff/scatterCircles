"use strict";

import { randomRGBA } from "./randomrgb.js";

const canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext("2d");

const canvasSection = document.getElementById("canvas-section");
const stateOutput = document.getElementById("state-output");
const textInput = document.getElementById("text-input");
const textSizeLabel = document.getElementById("text-size-label");
const textSizeInput = document.getElementById("text-size-input");
const download = document.getElementById("download-btn")
const checkbox = document.getElementById("checkbox");

let isDrawing = false;
let lastM = {x:0, y:0};
let randomTextColour = false;
let textColour = "white";
let state = false;

let inputText = textInput.textContent.split(" ");
let height = ctx.measureText(inputText[0]).actualBoundingBoxAscent;
let lines = [];
let textPosY = 0;
let textSpacing = 0;

let transparency = 1;

//impoert Font Face
let f = new FontFace("rubik", "url(https://fonts.gstatic.com/s/rubikmonoone/v14/UqyJK8kPP3hjw6ANTdfRk9YSN983TKU.woff2)");
f.load().then(() => {
    document.fonts.add(f);
    ctx.font = "bold 72px rubik";
    CanvasRenderingContext2D.textBaseline = "alphabetic";
    changeText();
    writeText();
    clipText();
});

function changeText() {
    stateOutput.textContent = "text updated";
    inputText = textInput.value.split(" ");
    lines = [];
    height = ctx.measureText(inputText[0]).actualBoundingBoxAscent;
    let line = [];
    let i=0;
    let width = 0;

    for(const word of inputText) {
        line.push(word);
        width = ctx.measureText(line.join(' ')).width;
        if(line.length > 1 && width > 790) {
            lines.push(line.slice(0, line.length-1).join(" "));
            line = [word];
            width = ctx.measureText(line.join(' ')).width;
            i++;
        }

        if (width > 795) {
            lines.push(line.join(" "));
            line = [];
            i++;
        }
    }
    if (line.length > 0) lines.push(line.join(' '));
    textPosY = (canvas.height - lines.length * height)/(lines.length+1)
    textSpacing = textPosY > height ? height*2 : textPosY + height;
    textPosY = textPosY > height ? (canvas.height - (textSpacing * lines.length))/2 : textPosY;
}

function styleText() {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = randomTextColour ? randomRGBA() : textColour;
    ctx.textAlign = "center";
}

function drawText(stroke=false) {
    for(let i in lines) {
        if (!stroke) {
            ctx.fillText(lines[i], canvas.width/2, i*(textSpacing)+textPosY + height)
        } else {
            console.log("stroking")
            ctx.strokeText(lines[i], canvas.width/2, i*(textSpacing)+textPosY + height)
        }
    }
}

function writeText() {
    styleText();
    drawText();
    stateOutput.textContent = "normal";
    stateOutput.style.colour = "black";
    stateOutput.style.fontWeight = "400";
}

function clipText() {
    state = true;
    ctx.globalCompositeOperation = "source-atop";
    stateOutput.textContent = "clipped";
    stateOutput.style.fontWeight = "600";
    stateOutput.style.color = "red";

}

function writeUnderText() {
    state = true
    ctx.globalCompositeOperation = "destination-over"
    stateOutput.textContent = "under";
    stateOutput.style.colour = "blue";
    stateOutput.style.fontWeight = "600";
    // transparency = 0.2;
}

function resetState() {
    ctx.globalCompositeOperation = "source-over";
    state = false
    stateOutput.textContent = "normal";
    stateOutput.style.colour = "black";
    stateOutput.style.fontWeight = "400";
    transparency = 1;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    resetState();
}

function previewText(fade=false, alpha=1, step = 0.01) {
    ctx.lineWidth = 0.1;
    ctx.setLineDash([20, 5]);
    ctx.strokeStyle = "rgba(0,0,0,"+alpha+")";
    clearCanvas();
    changeText();
    drawText(true);
    if(fade) {
        let requestId = requestAnimationFrame(() => {
            previewText(fade, alpha-step);

        });
        if (alpha < step) {
            cancelAnimationFrame(requestId)
            updateText();
        }
    }
}

function getMouesPosition(e) {
    const mX = e.offsetX * canvas.width / canvas.scrollWidth | 0;
    const mY = e.offsetY * canvas.height / canvas.scrollWidth | 0;
    return {x: mX, y: mY};
}

function drawCircles(m, i) {
    let offsetX = 0;
    let offsetY = 0;
    let radius = 0;
    offsetX = Math.random() * 100 - 50;
    offsetY = Math.random() * 100 - 50;
    radius = Math.random() * 30 + 5;
    ctx.beginPath();
    ctx.arc(m.x+offsetX, m.y+offsetY, radius, 0, Math.PI*2)
    ctx.fillStyle = randomRGBA(transparency)
    ctx.fill();

    let requestId = requestAnimationFrame(() => {
        setTimeout(() => { drawCircles(m, i+1); }, 50);
    });
    if (i+1 >= 10) {
        cancelAnimationFrame(requestId);
    }
}

function getTouchPosition(e) {
    let rect = e.target.getBoundingClientRect();
    let x = (e.targetTouches[0].pageX - rect.left)
    let y = (e.targetTouches[0].pageY - rect.top)
    return getMouesPosition({offsetX: x, offsetY: y});
}

function updateText() {
    clearCanvas();
    changeText();
    writeText();
    clipText();
}

function inputEnd() {
    isDrawing = false;
}

function startDraw(m) {
    isDrawing = true;
    lastM = m;
    drawCircles(m, 0);
}

function continueDraw(m) {
    const step = 100;
    // const text = `${m.x} ${m.y}`;
    // stateOutput.textContent = text;
    if (isDrawing && Math.hypot(lastM.x-m.x, lastM.y-m.y) > step) {
        lastM = m;
        drawCircles(m, 0);
    }
}

canvasSection.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startDraw(getTouchPosition(e));
});

canvasSection.addEventListener("touchmove", (e) => {
    continueDraw(getTouchPosition(e));
});

canvasSection.addEventListener("touchend", inputEnd);

canvasSection.addEventListener("mousedown", (e) => {
    startDraw(getMouesPosition(e));
});

canvasSection.addEventListener("mousemove", (e) => {
    continueDraw(getMouesPosition(e));
});

canvasSection.addEventListener("mouseup", inputEnd);

document.getElementById("clip-btn").addEventListener("click", clipText);
document.getElementById("write-btn").addEventListener("click", writeText);
document.getElementById("reset-btn").addEventListener("click", resetState);
document.getElementById("clear-btn").addEventListener("click", clearCanvas);
document.getElementById("under-draw-btn").addEventListener("click", writeUnderText);

document.addEventListener("keypress", (e) => {
    if (e.key == "q") clearCanvas();
    else if (e.key == "w") writeText();
    else if (e.key == "e") clipText();
    else if(e.key == "r") writeUnderText();
    else if (e.key == "t" && state) resetState();
    else if (e.key == "f") randomTextColour = true;
    else if (e.key == "g") randomTextColour = false;
});

download.addEventListener('click', function (e) {
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL();
    link.click();
    link.delete;
});

textSizeInput.addEventListener("input", (e) => {
    textSizeLabel.textContent = textSizeInput.value+"px";
    ctx.font =`bold ${textSizeLabel.textContent} rubik`;
    previewText();
})

textSizeInput.addEventListener("mouseup", (e) => {
    textSizeLabel.textContent = textSizeInput.value+"px";
    ctx.font =`bold ${textSizeLabel.textContent} rubik`;
    textColour = "white";
    previewText(true);
    // updateText();
})

textSizeInput.addEventListener("touchend", (e) => {
    textSizeLabel.textContent = textSizeInput.value+"px";
    ctx.font =`bold ${textSizeLabel.textContent} rubik`;
    previewText(true);
    // updateText();
})

textInput.addEventListener("input", (e) => {
    stateOutput.textContent = "modifying text";
    previewText();
});

textInput.addEventListener("change", (e) => {
    updateText();
})

textInput.addEventListener("keypress", (e) => {
    if(e.key == "Enter") textInput.blur();
    e.stopImmediatePropagation();
});

checkbox.addEventListener("change", (e) => {
  console.log("checkbox", checkbox.checked, checkbox)
  if(checkbox.checked) {
    textInput.style.display = "block";
  } else {
    textInput.style.display = "none";
  }
});
// let image;
// window.addEventListener("resize", (e) => {
//     if(image == null) {
//         image = ctx.getImageData(0, 0, canvas.width, canvas.height);
//     }
//     if (window.innerWidth < 832) {
//         canvas.width = window.innerWidth - 2 * 16;
//         ctx.clearRect(0,0,canvas.width,canvas.height)
//         ctx.putImageData(image, 0, 0);
//         ctx.font = "bold 100px test";
//     } else {
//         canvas.width = 800;

//         ctx.clearRect(0,0,canvas.width,canvas.height)
//         ctx.putImageData(image, 0, 0);
//         ctx.font = "bold 100px test";
//     }

// })
