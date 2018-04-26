const eventProcessingLoop = require("./eventProcessingLoop.js");

const onBrowser = (function() {
    var documentExists = true;
    try {
        console.log(document);
    } catch (e) { documentExists = false; }
    return documentExists;
}());

const fps = 60;
// keep it square
const width = 800;
const height = 800;

var ctx;

if (onBrowser) {
    const button = document.querySelector("button");
    button.addEventListener('click', e => {
        button.remove();
        eventProcessingLoop(fps, init, update, render);
    });
}

function init() {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext("2d");
    document.body.appendChild(canvas);
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

    if (onBrowser) {
        // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        const v = t;
        // width or height? choose wisely. Should be square dimension canvas anyway
        const n = width;
        draw(n, v);
    }
}

function draw(n, v) {
    // global ctx
    var colour = 0;
    const weight = 10;
    const maxColour = 256*256*256-1;
    for (var i = 0; i < n*n; i++) {
        const coordinates = get2DFrom1D(i, n); // give it the index and column size
        const offset = {
            x: weight,
            y: weight
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
    ctx.fillRect(50, 50, 10, weight + 1);
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