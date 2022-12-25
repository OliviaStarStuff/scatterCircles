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

document.addEventListener("keypress", (e) => {
    if (e.key == "q") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "destination-over"
        state = false;

        output.textContent = "normal";

    } else if (e.key == "w") {
        drawText();

    } else if (e.key == "e") {
        state = true;
        ctx.globalCompositeOperation = "source-atop";
        output.textContent = "clipped";
    } else if(e.key == "r") {
        state = true
        ctx.globalCompositeOperation = "destination-over"
        output.textContent = "under";
    } else if (e.key == "t" && state) {
        state = false
        ctx.globalCompositeOperation = "source-over";
        output.textContent = "normal";
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

function drawText() {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "white"
    ctx.fillText("I Will", 120, 200);
    ctx.fillText(" Feed You", -30, 300);
    ctx.fillText("When I", 150, 400);
    ctx.fillText(" finish", 50, 500);
    ctx.fillText(" coding", 50, 600);
}
