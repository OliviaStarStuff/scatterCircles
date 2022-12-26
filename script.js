"use strict";

import { randomRGBA } from "./randomrgb.js";

const canvas = document.getElementById("testCanvas");
const box = document.getElementById("canvas")
const ctx = canvas.getContext("2d");
const output = document.getElementById("output");

function getMouesPosition(e) {
    const mX = e.offsetX * canvas.width / canvas.scrollWidth | 0;
    const mY = e.offsetY * canvas.height / canvas.scrollWidth | 0;
    return {x: mX, y: mY};
}

let isDrawing = false;
let lastM = {x:0, y:0};

function drawCircles(m, i) {
    let offsetX = 0;
    let offsetY = 0;
    let radius = 0;
    offsetX = Math.random() * 100 - 50;
    offsetY = Math.random() * 100 - 50;
    radius = Math.random() * 30 + 5;
    ctx.beginPath();
    ctx.arc(m.x+offsetX, m.y+offsetY, radius, 0, Math.PI*2)
    ctx.fillStyle = randomRGBA();
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

let randomTextColour = false;
let textColour = "white"

box.addEventListener("keypress", (e) => {
    if (e.key == "q") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "destination-over"
        state = false;

        output.textContent = "normal";
        output.style.colour = "black";
        output.style.fontWeight = "400";

    } else if (e.key == "w") {
        drawText();
        output.textContent = "normal";
        output.style.colour = "black";
        output.style.fontWeight = "400";

    } else if (e.key == "e") {
        state = true;
        ctx.globalCompositeOperation = "source-atop";
        output.textContent = "clipped";
        output.style.fontWeight = "600";
        output.style.color = "darkred";

    } else if(e.key == "r") {
        state = true
        ctx.globalCompositeOperation = "destination-over"
        output.textContent = "under";
        output.style.colour = "blue";

        output.style.fontWeight = "600";
    } else if (e.key == "t" && state) {
        state = false
        ctx.globalCompositeOperation = "source-over";
        output.textContent = "normal";
        output.style.colour = "black";

        output.style.fontWeight = "400";
    } else if (e.key == "f") {
        randomTextColour = true;
    } else if (e.key == "g") {
        randomTextColour = false;
    }




});

box.addEventListener("mouseup", (e) => {
    // console.log("mouse end");
    if (isDrawing) {
        isDrawing = false;
    }
});


let f = new FontFace("test", "url(https://fonts.gstatic.com/s/rubikmonoone/v14/UqyJK8kPP3hjw6ANTdfRk9YSN983TKU.woff2)");
f.load().then(() => {
    document.fonts.add(f);
    ctx.font = "bold 100px test";
});

let state = false;

const input = document.getElementById("input");

let inputText = input.textContent.split(" ");



function drawText() {
    ctx.globalCompositeOperation = "source-over";
    console.log("drawing", inputText)
    ctx.fillStyle = randomTextColour ? randomRGBA() : textColour;

    let line = ""
    let i=0;
    let measure = 0;
    for(let ch in inputText) {
        if (measure.width > 440) {
            ctx.fillText(line, (canvas.width-measure.width+measure.actualBoundingBoxLeft)/2 , 150+100*i);
            line = "";
            i++;
        }

        line += " " + inputText[ch];
        measure = ctx.measureText(line);
    }
    if (line.length > 0) {
        ctx.fillText(line, (canvas.width-measure.width+measure.actualBoundingBoxLeft)/2 , 150+100*i);
    }
}

const download = document.getElementById("download")

download.addEventListener('click', function (e) {
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL();
    link.click();
    link.delete;
  });


  input.addEventListener("change", (e) => {
    inputText = document.getElementById("input").value.split(" ");
    drawText();
  })

  input.addEventListener("keypress", (e) => {
    if(e.key == "Enter") {
        input.blur();
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
