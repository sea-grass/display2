const eventProcessingLoop = require("./eventProcessingLoop.js");

const onBrowser = (function() {
    var documentExists = true;
    try {
        console.log(document);
    } catch (e) { documentExists = false; }
    return documentExists;
}());

var ctx;

if (onBrowser) {
    const button = document.querySelector("button");
    button.addEventListener('click', e => {
        button.remove();
        eventProcessingLoop(init, update, render);
    });
}

function init() {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 800;
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
    const t = state.time;
    const board = state.board;

    if (onBrowser) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = "black";
        board.forEach(function(val, i) {
            const min = 2;
            var str = Array.from(t.toString(16).padStart(2, 0).substr(0,2).repeat(3));
            if ((t+val) % 2 === 0) str = str.map((val, i) => str[(i+1)%str.length]);
            const colour = "#" + str.join('');
            const magnitude = 10;
            const gobbeldy = magnitude*magnitude;
            const badfood = 150;
            // const x = magnitude * i;
            // const y = magnitude * i;
            const x = Math.sin(i * t) * gobbeldy + badfood * Math.cos(i*t) + 400;
            const y = Math.cos(i * t) * gobbeldy + badfood * Math.sin(i*t) + 400;
            const w = magnitude * val + min;
            const h = magnitude * val + badfood * Math.cos(i*t) + min;
            ctx.fillStyle = colour;
            ctx.fillRect(x, y, w, h);
        });
    }
}