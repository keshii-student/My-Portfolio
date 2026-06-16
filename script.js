const board = document.getElementById("board");
const context = board.getContext("2d");
let isDrawing = false;
const colorPicker = document.getElementById("color-picker");
const brushSize = document.getElementById("brush-size");
const clearButton = document.getElementById("clear-button");
const fillButton = document.getElementById("fill-button");
const downloadButton = document.getElementById("download-button");
const undoButton = document.getElementById("undo-button");
const redoButton = document.getElementById("redo-button");
const eraserButton = document.getElementById("eraser-button");
const undoStack = [];
const redoStack = [];
const shapeTool = document.getElementById("shape-tool")
let isErasing = false;
let currentShape = "freehand";
let startX = 0;
let startY = 0;
let snapshotBeforeAnyShape = null;

window.addEventListener("load", () => {
    saveState(undoStack);
})
board.addEventListener("pointermove", draw);
board.addEventListener("pointerdown", (e) => {
    isDrawing = true;
    if (currentShape != "freehand") {
        startX = e.offsetX;
        startY = e.offsetY;
        snapshotBeforeAnyShape = context.getImageData(0, 0, board.width, board.height);
    }

});
board.addEventListener("pointerup", () => {
    isDrawing = false;
    context.beginPath();
    saveState(undoStack);
})
board.addEventListener("pointerout", () => {isDrawing = false});
board.style.touchAction = "none";
clearButton.addEventListener("click", clearCanvas);
fillButton.addEventListener("click", fillCanvas);
downloadButton.addEventListener("click", downloadImages);
undoButton.addEventListener("click", undo);
redoButton.addEventListener("click", redo);
eraserButton.addEventListener("click", () => {
    isErasing = !isErasing;
})
shapeTool.addEventListener("change", (e) => {
    currentShape = e.target.value;
})
function draw(e)
{  
    if(!isDrawing) return;
    if (currentShape === 'freehand') {
    context.lineWidth = brushSize.value;
    context.lineCap = "round";
    context.strokeStyle = colorPicker.value; 
    context.globalCompositeOperation = isErasing ? "destination-out" : "source-over";
    context.lineTo(e.offsetX, e.offsetY);
    context.stroke();
    context.beginPath();
    context.moveTo(e.offsetX, e.offsetY);
    }
    else {
        context.putImageData(snapshotBeforeAnyShape, 0, 0);
        context.strokeStyle = colorPicker.value;
        context.lineWidth = brushSize.value;
        if (currentShape === "rectangle")
        {
            const width = e.offsetX - startX; 
            const height = e.offsetY - startY;
            context.strokeRect(startX, startY, width, height);
        }
        if (currentShape === "circle")
        {
            const radius = Math.sqrt((e.offsetX - startX) ** 2 + (e.offsetY - startY) ** 2);
            context.beginPath();
            context.arc(startX, startY, radius, 0, Math.PI * 2);
            context.stroke();
        }
        if (currentShape === "line")
        {
            context.beginPath();
            context.moveTo(startX, startY);
            context.lineTo(e.offsetX, e.offsetY);
            context.stroke();
        }
    }

}

function saveState(stack){
    const snapshot = context.getImageData(0, 0, board.width, board.height);
    stack.push(snapshot);
    if (stack.length > 30) {
        stack.shift();
    }
    redoStack.length = 0;
    updateButtonStates();
}
function clearCanvas(){
    if(!confirm("Clear Canvas ? To make sure...")) return;
    context.clearRect(0, 0, board.width, board.height);
    saveState(undoStack);

}
function fillCanvas(){
    context.fillStyle = colorPicker.value;
    context.fillRect(0, 0, board.width, board.height);
    saveState(undoStack);
}

function downloadImages(){
    const imageLink = document.createElement("a");
    imageLink.download = `testing-${Date.now()}.png`;
    imageLink.href = board.toDataURL("image/png");
    imageLink.click();
}
function undo()
{
    if (undoStack.length <= 1) return;
    if (undoStack.length > 1) {
        const currentState = undoStack.pop();
        redoStack.push(currentState);
        const previousState = undoStack[undoStack.length - 1];
        context.putImageData(previousState, 0, 0); 
        updateButtonStates();
    }
}

function redo()
{
    if (redoStack.length === 0) return;
    const nextState = redoStack.pop();
    undoStack.push(nextState);
    context.putImageData(nextState, 0, 0); 
    updateButtonStates();
}

function updateButtonStates() {
    undoButton.style.opacity = undoStack.length <= 1 ? "0.4" : "1";
    redoButton.style.opacity = redoStack.length === 0 ? "0.4" : "1";
}
