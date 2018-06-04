const eventProcessingLoop = require("./eventProcessingLoop.js");

const onBrowser = (function() {
  var documentExists = true;
  try {
    console.log(document);
  } catch (e) {
    documentExists = false;
  }
  return documentExists;
})();

const fps = 60;
const DEBUG = true;

const windowWidth = 800;
const windowHeight = 800;
// const numTv = windowWidth/tvSize+windowHeight/tvSize;
const numTv = 1;

// keep it square
var length = 63;
var width = length;
var height = length;
var d = 0;

var container;
var canvas;
var ctx;
var tvList;

if (onBrowser) {
  const button = document.querySelector("button");
  button.addEventListener("click", e => {
    button.remove();
    eventProcessingLoop(fps, init, update, render);
  });

  const sizeSelector = document.querySelector("#n");
  sizeSelector.addEventListener("change", e => {
    const selectedValue =
      sizeSelector.options[sizeSelector.selectedIndex].value;
    setSize(Number.parseInt(selectedValue));
  });
  for (var i = 1; i <= 256; i++) {
    const val = i;
    addOption(sizeSelector, val, val === length);
  }

  const differenceSelector = document.querySelector("#d");
  differenceSelector.addEventListener("change", e => {
    const selectedValue =
      differenceSelector.options[differenceSelector.selectedIndex].value;
    setDifference(Number.parseInt(selectedValue));
  });
  addOption(differenceSelector, 0, 0 === d);
  for (var i = 0; i < 20; i++) {
    const val = Math.pow(2, i);
    addOption(differenceSelector, val, val === d);
  }
}

function addOption(selectEl, val, isSelected) {
  const option = document.createElement("option");
  option.value = val;
  option.innerText = val;
  if (isSelected) option.setAttribute("selected", "selected");
  selectEl.appendChild(option);
}

function setSize(new_size) {
  // global length, width, height, canvas
  length = new_size;
  width = length;
  height = length;
  canvas.width = width;
  canvas.height = height;
}
function setDifference(new_d) {
  // global d
  d = new_d;
}

function init() {
  // global document,
  container = document.body;

  canvas = document.createElement("canvas");
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

  subject.next(
    Object.assign(
      {
        board: board
      },
      state
    )
  );
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
  // global d

  drawBuffer(n, generateVBuffer(n, v, d));
}

// n is the size of the image, where there are n*n pixels in the image
// v is the default variance set for this buffer
// d is used to add a difference to the variance per pixel, based on that
// pixel's index
function generateVBuffer(n, v, d) {
  const numPixels = n * n;
  var V = new Array(numPixels);
  // create buffer of values
  // V[0] = initial_colour
  // V[1..numPixels] = v at that pixel, where v=variance from the previous colour
  // set initial colour
  V[0] = 0;
  for (var i = 1; i < numPixels; i++) {
    V[i] = v + i * d - 1;
  }
  return V;
}

function drawBuffer(n, V) {
  // global ctx
  var colour = 0;
  const maxColour = 256 * 256 * 256 - 1;
  const weight = 1;
  // draw the (kinda) buffer to our canvas
  for (var i = 0; i < V.length; i++) {
    colour = (colour + V[i]) % maxColour;
    const coordinates = get2DFrom1D(i, n); // give it the index and column size
    const offset = {
      x: 0,
      y: 0
    };
    const x = coordinates.x + offset.x;
    const y = coordinates.y + offset.y;
    const hexColour = getColourFromInteger(colour);
    ctx.fillStyle = hexColour;

    ctx.fillRect(x, y, weight, weight);
  }

  const imageData = ctx.canvas.toDataURL();
  // and multiply the image to all img elements
  tvList.forEach(tv => (tv.style.background = "url(" + imageData + ")"));
}

function get2DFrom1D(index, numCols) {
  return {
    x: index % numCols,
    y: Math.floor(index / numCols)
  };
}

// return a hex colour string from the padded hex value of an integer
function getColourFromInteger(i) {
  return (
    "#" +
    i
      .toString(16)
      .padStart(6, 0)
      .substr(0, 6)
  );
}
