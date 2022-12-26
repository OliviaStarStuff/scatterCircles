function random255(min = 0, max = 256) {
    if (min == 0 && max == 256) {
        return Math.floor(Math.random() * 256);
    }
    return Math.floor(Math.random() * (max - min) + min);
}

export function generateRGB(ranges = null) {
    if (ranges == null) {
        return random255() + ", " + random255() + ", " + random255();
    }
    let colour = "";
    for (let i = 0; i < 3; i++) {
        colour += random255(ranges[0].min, ranges[1].max) + ", ";
    }
    return colour;
}

function randomRGB() {
    return "rgb(" + generateRGB() + ")";
}

export function randomRGBA() {
    return "rgba(" + generateRGB() + ", " + randomAlpha() + ")";
}

function randomAlpha(min = 0, max = 1) {
    if (min == 0 && max == 1) {
        return Math.random();
    }
    return Math.random() * (max - min) + min;
}