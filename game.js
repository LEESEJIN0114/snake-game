const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const box = 20;
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

let snake = [{ x: 200, y: 200 }];
let dx = 0, dy = 0;
let nextDx = 0, nextDy = 0;
let snakeMoveRemaining = 0;
let snakeSpeed = 150;
let moveTimer = 0;

let food = { x: 100, y: 100 };
let foodSpeed = 120;
let foodMoveAccumulator = 0;
let foodDir = 1;

let lastTime = 0;
let running = true;

const snakeImg = new Image();
snakeImg.src = "snake.png";

const foodImg = new Image();
foodImg.src = "food.png";

// 🎵 배경 음악
const backgroundMusic = new Audio("bgm.mp3");
backgroundMusic.loop = true;
let musicStarted = false;

//⌨️ 키보드 입력 처리 및 음악 재생 트리거
document.addEventListener("keydown", e => {
  if (!musicStarted) {
    backgroundMusic.play().catch(err => {
      console.warn("음악 재생 실패:", err);
    });
    musicStarted = true;
  }

  switch (e.keyCode) {
    case 37: if (dx !== box) { nextDx = -box; nextDy = 0; } break;
    case 38: if (dy !== box) { nextDx = 0; nextDy = -box; } break;
    case 39: if (dx !== -box) { nextDx = box; nextDy = 0; } break;
    case 40: if (dy !== -box) { nextDx = 0; nextDy = box; } break;
  }
});

document.addEventListener("keyup", e => {
  if ([37, 38, 39, 40].includes(e.keyCode)) {
    nextDx = 0;
    nextDy = 0;
  }
});

function moveSnakeOnce() {
  if (nextDx === 0 && nextDy === 0) {
    dx = 0;
    dy = 0;
    return;
  }

  dx = nextDx;
  dy = nextDy;

  const newHead = {
    x: snake[0].x + dx,
    y: snake[0].y + dy
  };

  if (
    newHead.x < 0 || newHead.x >= canvasWidth ||
    newHead.y < 0 || newHead.y >= canvasHeight
  ) {
    alert("벽에 부딪혀 게임 오버!");
    running = false;
    return;
  }

  snake.unshift(newHead);

  if (snakeMoveRemaining > 0) {
    snakeMoveRemaining--;
  } else {
    snake.pop();
  }

  const head = snake[0];
  const tail = snake[snake.length - 1];

  if ((head.x === food.x && head.y === food.y) ||
      (tail.x === food.x && tail.y === food.y)) {
    alert("잡았다!");

    playBackgroundMusic();

    const newLength = snake.length + 1;
    snake = [{ x: 200, y: 200 }];
    snakeMoveRemaining = newLength - 1;
    dx = dy = nextDx = nextDy = 0;

    placeFood();
    foodSpeed = Math.max(foodSpeed / 1.2, 60);
    snakeSpeed = foodSpeed / 2;
  }
}

function playBackgroundMusic() {
  if (!musicStarted) {
    backgroundMusic.play().catch(err => {
      console.warn("재생 실패:", err);
    });
    musicStarted = true;
  }
}

function moveFood(deltaTime) {
  foodMoveAccumulator += deltaTime;
  if (foodMoveAccumulator >= foodSpeed) {
    food.x += box * foodDir;
    if (food.x <= 0 || food.x >= canvasWidth - box) {
      foodDir *= -1;
    }
    foodMoveAccumulator = 0;
  }
}

function placeFood() {
  let valid = false;
  while (!valid) {
    food.x = Math.floor(Math.random() * (canvasWidth / box)) * box;
    food.y = Math.floor(Math.random() * (canvasHeight / box)) * box;
    valid = !snake.some(part => part.x === food.x && part.y === food.y);
  }
}

function gameLoop(timestamp) {
  if (!running) return;
  if (!lastTime) lastTime = timestamp;

  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  moveTimer += deltaTime;

  if (moveTimer >= snakeSpeed) {
    moveSnakeOnce();
    moveTimer = 0;
  }

  moveFood(deltaTime);

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.drawImage(foodImg, food.x, food.y, box, box);
  for (let part of snake) {
    ctx.drawImage(snakeImg, part.x, part.y, box, box);
  }

  requestAnimationFrame(gameLoop);
}

snakeImg.onload = () => {
  foodImg.onload = () => {
    requestAnimationFrame(gameLoop);
  };
};
