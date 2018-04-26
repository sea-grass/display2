const eventProcessingLoop = require("./eventProcessingLoop.js");

const onBrowser = (function() {
    var documentExists = true;
    try {
        console.log(document);
    } catch (e) { documentExists = false; }
    return documentExists;
}());

const fps = 60;
const DEBUG = true;
// keep it square
const length = 200;
const width = length;
const height = length;
const tvSize = 50;
const windowWidth = 800;
const windowHeight = 800;
// const numTv = windowWidth/tvSize+windowHeight/tvSize;
const numTv = 1;

var container;
var ctx;
var tvList;

if (onBrowser) {
    const button = document.querySelector("button");
    button.addEventListener('click', e => {
        button.remove();
        eventProcessingLoop(fps, init, update, render);
    });
}

function init() {
    container = document.body;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    for (var i = 0; i < numTv; i++) {
        const div = document.createElement("div");
        div.classList.add("tv");
        container.appendChild(div);
    }

    tvList = Array.from(document.querySelectorAll(".tv"));
}

// perform updates to the state, then pass the updated state to the subject
function update(state, subject) {
    const t = state.time;

    var board = [];
    for (var x = 0; x < 10; x++) {
        for (var y = 0; y < 10; y++) {
            board.push(t % (x + y));
        }
    }

    subject.next(Object.assign({
        board: board
    }, state))
}

function render(state) {
    // global ctx
    const t = state.time;
    const board = state.board;

    if (DEBUG) console.time("render");
    if (onBrowser) {
        // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        const v = t;
        // width or height? choose wisely. Should be square dimension canvas anyway
        const n = width;
        draw(n, v);
    }
    if (DEBUG) console.timeEnd("render");
}

function draw(n, v) {
    // global ctx
    var colour = 0;
    const weight = 1;
    const maxColour = 256*256*256-1;

    // draw to our canvas
    for (var i = 0; i < n*n; i++) {
        const coordinates = get2DFrom1D(i, n); // give it the index and column size
        const offset = {
            x: 0,
            y: 0
        };
        const x = coordinates.x + offset.x;
        const y = coordinates.y + offset.y;
        const hexColour = getColourFromInteger(colour);
        ctx.fillStyle = hexColour;

        ctx.fillRect(
            x, y,
            weight, weight
        );

        colour = (colour+v)%maxColour;
    }

    const imageData = ctx.canvas.toDataURL();
    // and multiply the image to all img elements
    tvList.forEach(tv => tv.style.background = 'url(' + imageData + ')');
}

function get2DFrom1D(index, numCols) {
    return {
        x: index % numCols,
        y: Math.floor(index / numCols)
    };
}

// return a hex colour string from the padded hex value of an integer
function getColourFromInteger(i) {
    return "#" + (
        i.toString(16).padStart(6, 0).substr(0, 6)
    );
}