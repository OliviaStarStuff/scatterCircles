"use strict";

import { randomRGBA } from "./randomrgb.js";

const canvas = document.getElementById("testCanvas");
const ctx = canvas.getContext("2d");

const box = document.getElementById("canvas")
const output = document.getElementById("output");
const input = document.getElementById("input");

const download = document.getElementById("download")

let isDrawing = false;
let lastM = {x:0, y:0};
let randomTextColour = false;
const textColour = "white"
let state = false;
let inputText = input.textContent.split(" ");

let f = new FontFace("rubik", "url(https://fonts.gstatic.com/s/rubikmonoone/v14/UqyJK8kPP3hjw6ANTdfRk9YSN983TKU.woff2)");
f.load().then(() => {
    document.fonts.add(f);
    ctx.font = "bold 100px rubik";
    CanvasRenderingContext2D.textBaseline = "alphabetic"
    changeText();
    writeText();
    clipText();
});

let lines = []
let height = ctx.measureText(inputText[0]).actualBoundingBoxAscent;

function changeText(e) {
    output.textContent = "text updated"
    inputText = input.value.split(" ");
    lines = []
    height = ctx.measureText(inputText[0]).actualBoundingBoxAscent;
    let line = []
    let i=0;
    let width = 0;

    for(const word of inputText) {
        line.push(word);
        width = ctx.measureText(line.join(' ')).width;
        if(line.length > 1 && width > 800) {
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
}

function drawText() {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = randomTextColour ? randomRGBA() : textColour;
    ctx.textAlign = "center"


    let start = (canvas.height - lines.length * height)/(lines.length+1)
    let spacing = start > height ? height*2 : start + height;
    // let spacing = start;
    for(let i in lines) {
        ctx.fillText(lines[i], canvas.width/2, i*(spacing)+start + height)
    }
}

function writeText() {
    drawText();
    output.textContent = "normal";
    output.style.colour = "black";
    output.style.fontWeight = "400";
}

function clipText() {
    state = true;
    ctx.globalCompositeOperation = "source-atop";
    output.textContent = "clipped";
    output.style.fontWeight = "600";
    output.style.color = "darkred";

}

function writeUnderText() {
    state = true
    ctx.globalCompositeOperation = "destination-over"
    output.textContent = "under";
    output.style.colour = "blue";
    output.style.fontWeight = "600";
    // transparency = 0.2;
}

function resetState() {
    ctx.globalCompositeOperation = "source-over";
    state = false
    output.textContent = "normal";
    output.style.colour = "black";
    output.style.fontWeight = "400";
    transparency = 1;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    resetState();
}

function getMouesPosition(e) {
    const mX = e.offsetX * canvas.width / canvas.scrollWidth | 0;
    const mY = e.offsetY * canvas.height / canvas.scrollWidth | 0;
    return {x: mX, y: mY};
}

let transparency = 1;

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
        setTimeout(() => {
            drawCircles(m, i+1)
        }, 50);
    });
    if (i+1 >= 10) {
        cancelAnimationFrame(requestId)
    }
}

function getTouchPosition(e) {
    let rect = e.target.getBoundingClientRect();
    let x = (e.targetTouches[0].pageX - rect.left)
    let y = (e.targetTouches[0].pageY - rect.top)
    return getMouesPosition({offsetX: x, offsetY: y});
}

box.addEventListener("touchstart", (e) => {
    e.preventDefault();
    // console.log("touch start");
    const m = getTouchPosition(e);
    isDrawing = true;
    lastM = m;
    drawCircles(m, 0);
});

box.addEventListener("touchmove", (e) => {
    const m = getTouchPosition(e)
    const step = 100;
    const text = `${m.x} ${m.y}`;
    output.textContent = text;
    if (isDrawing && Math.hypot(lastM.x-m.x, lastM.y-m.y) > step) {
        lastM = m;
        drawCircles(m, 0);
    }

});

box.addEventListener("touchend", (e) => {
    // console.log("touch end");
    if (isDrawing) {
        isDrawing = false;
    }
});

box.addEventListener("mousedown", (e) => {
    // console.log("mouse start");
    const m = getMouesPosition(e);
    isDrawing = true;
    lastM = m;
    drawCircles(m, 0);
});

box.addEventListener("mousemove", (e) => {
    const step = 100;
    const m = getMouesPosition(e);
    if (isDrawing && Math.hypot(lastM.x-m.x, lastM.y-m.y) > step) {
        lastM = m;
        drawCircles(m, 0);
    }
});

document.getElementById("clip").addEventListener("click", clipText);
document.getElementById("write").addEventListener("click", writeText);
document.getElementById("reset").addEventListener("click", resetState);
document.getElementById("clear").addEventListener("click", clearCanvas);
document.getElementById("under").addEventListener("click", writeUnderText);

document.addEventListener("keypress", (e) => {
    if (e.key == "q") clearCanvas();
    else if (e.key == "w") writeText();
    else if (e.key == "e") clipText();
    else if(e.key == "r") writeUnderText();
    else if (e.key == "t" && state) resetState();
    else if (e.key == "f") randomTextColour = true;
    else if (e.key == "g") randomTextColour = false;
});

box.addEventListener("mouseup", (e) => {
    // console.log("mouse end");
    if (isDrawing) {
        isDrawing = false;
    }
});

download.addEventListener('click', function (e) {
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL();
    link.click();
    link.delete;
  });


input.addEventListener("input", (e) => {
    output.textContent = "modifying text";
});

input.addEventListener("change", (e) => {
    clearCanvas();
    changeText();
    writeText();
    clipText();
})

input.addEventListener("keypress", (e) => {
    if(e.key == "Enter") {
        input.blur();
    }
    e.stopImmediatePropagation();
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
