const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");

const rows = 15, cols = 15, cellSize = 30;
canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

let maze = [];
let player = { r: 0, c: 0 };
let goal = { r: rows - 1, c: cols - 1 };
let deviceType = null;

// Colors
const wallColor = "#6a1b9a";       // purple walls
const goalColor = "#00c853";       // green goal
const playerColor = "#ff1744";     // red player
const bgColor = "#fff7f0";         // light maze background

function Cell(r, c) {
  this.r = r;
  this.c = c;
  this.visited = false;
  this.walls = { top: true, right: true, bottom: true, left: true };
}

function generateMaze() {
  maze = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => new Cell(r, c))
  );

  let stack = [];
  let current = maze[0][0];
  current.visited = true;
  stack.push(current);

  while (stack.length > 0) {
    current = stack.pop();
    const neighbors = getUnvisitedNeighbors(current);
    if (neighbors.length > 0) {
      stack.push(current);
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      removeWalls(current, next);
      next.visited = true;
      stack.push(next);
    }
  }

  player = { r: 0, c: 0 };
  drawMaze();
}

function getUnvisitedNeighbors(cell) {
  const { r, c } = cell;
  const neighbors = [];
  if (r > 0 && !maze[r - 1][c].visited) neighbors.push(maze[r - 1][c]);
  if (c < cols - 1 && !maze[r][c + 1].visited) neighbors.push(maze[r][c + 1]);
  if (r < rows - 1 && !maze[r + 1][c].visited) neighbors.push(maze[r + 1][c]);
  if (c > 0 && !maze[r][c - 1].visited) neighbors.push(maze[r][c - 1]);
  return neighbors;
}

function removeWalls(a, b) {
  if (a.r === b.r) {
    if (a.c > b.c) { a.walls.left = false; b.walls.right = false; }
    else { a.walls.right = false; b.walls.left = false; }
  } else if (a.c === b.c) {
    if (a.r > b.r) { a.walls.top = false; b.walls.bottom = false; }
    else { a.walls.bottom = false; b.walls.top = false; }
  }
}

function drawMaze() {
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = wallColor;
  ctx.lineWidth = 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = maze[r][c];
      const x = c * cellSize, y = r * cellSize;
      if (cell.walls.top) drawWall(x, y, x + cellSize, y);
      if (cell.walls.right) drawWall(x + cellSize, y, x + cellSize, y + cellSize);
      if (cell.walls.bottom) drawWall(x, y + cellSize, x + cellSize, y + cellSize);
      if (cell.walls.left) drawWall(x, y, x, y + cellSize);
    }
  }

  ctx.fillStyle = goalColor;
  ctx.fillRect(goal.c * cellSize + 4, goal.r * cellSize + 4, cellSize - 8, cellSize - 8);

  ctx.fillStyle = playerColor;
  ctx.beginPath();
  ctx.arc(
    player.c * cellSize + cellSize / 2,
    player.r * cellSize + cellSize / 2,
    cellSize / 3,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function drawWall(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function movePlayer(dr, dc) {
  const cell = maze[player.r][player.c];
  if (dr === -1 && !cell.walls.top) player.r--;
  if (dr === 1 && !cell.walls.bottom) player.r++;
  if (dc === -1 && !cell.walls.left) player.c--;
  if (dc === 1 && !cell.walls.right) player.c++;

  drawMaze();
  if (player.r === goal.r && player.c === goal.c) {
    setTimeout(() => alert(" You've reached the goal!"), 50);
  }
}

// --- Device Choice ---
function setDevice(type) {
  deviceType = type;
  document.getElementById("deviceChoice").style.display = "none";
  document.getElementById("instruction").textContent =
    type === "laptop" ? "Use Arrow Keys or WASD to move" : "Swipe on the maze to move";

  if (type === "laptop") {
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp" || e.key === "w") movePlayer(-1, 0);
      if (e.key === "ArrowDown" || e.key === "s") movePlayer(1, 0);
      if (e.key === "ArrowLeft" || e.key === "a") movePlayer(0, -1);
      if (e.key === "ArrowRight" || e.key === "d") movePlayer(0, 1);
    });
  }

  if (type === "phone") {
    let touchStartX = 0, touchStartY = 0;
    canvas.addEventListener("touchstart", (e) => {
      const t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
    });
    canvas.addEventListener("touchend", (e) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) movePlayer(0, 1);
        if (dx < -30) movePlayer(0, -1);
      } else {
        if (dy > 30) movePlayer(1, 0);
        if (dy < -30) movePlayer(-1, 0);
      }
    });
  }

  generateMaze();
}
