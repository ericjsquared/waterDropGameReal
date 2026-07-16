// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let gamePaused = false; // Keeps track of whether the game is paused
let gameState = "ready"; // Tracks whether the game is ready, playing, paused, or finished
let dropMaker; // Will store our timer that creates drops regularly
let countdownTimer; // Will store the timer that counts down the game time
let score = 0; // Stores the player's current score
let timeLeft = 30; // Stores the remaining game time
let gameOverTimeout = null;
const startButton = document.getElementById("start-btn");
const difficultySelect = document.getElementById("difficulty");
const goodDropSound = new Audio("sound/goodDrop.mp3");
const badDropSound = new Audio("sound/badDrop.mp3");
const loseSound = new Audio("sound/lose.mp3");
const winSound = new Audio("sound/win.mp3");

// Wait for button click to start or pause the game
document.getElementById("start-btn").addEventListener("click", toggleGame);

function updateScoreDisplay() {
  document.getElementById("score").textContent = score;
}

function updateTimeDisplay() {
  document.getElementById("time").textContent = timeLeft;
}

function setButtonLabel(label) {
  startButton.textContent = label;
}

function clearGameElements() {
  document.querySelectorAll(".water-drop").forEach((drop) => drop.remove());
}

function createConfetti() {
  const overlay = document.getElementById("game-over");
  const confettiLayer = overlay.querySelector(".confetti-layer");
  confettiLayer.innerHTML = "";

  const colors = ["#FFC907", "#2E9DF7", "#4FCB53", "#F5402C", "#FF902A"];

  for (let i = 0; i < 24; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[i % colors.length];
    piece.style.setProperty("--x-offset", `${(Math.random() - 0.5) * 220}px`);
    piece.style.animationDuration = `${1.6 + Math.random() * 1.2}s`;
    piece.style.animationDelay = `${Math.random() * 0.2}s`;
    confettiLayer.appendChild(piece);
  }
}

function playSound(audio) {
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function showGameOverMessage() {
  const overlay = document.getElementById("game-over");
  document.getElementById("final-score").textContent = score;
  overlay.classList.remove("hidden");
  overlay.classList.remove("game-over-success", "game-over-zero");

  if (score > 5) {
    overlay.classList.add("game-over-success");
    createConfetti();
    playSound(winSound);
  } else if (score === 0) {
    overlay.classList.add("game-over-zero");
    playSound(loseSound);
  }
}

function hideGameOverMessage() {
  const overlay = document.getElementById("game-over");
  overlay.classList.add("hidden");
  overlay.classList.remove("game-over-success", "game-over-zero");
  overlay.querySelector(".confetti-layer").innerHTML = "";
}

function stopGame() {
  gameRunning = false;
  gamePaused = false;
  gameState = "finished";
  clearInterval(dropMaker);
  clearInterval(countdownTimer);
  setButtonLabel("Start Game");

  if (gameOverTimeout) {
    clearTimeout(gameOverTimeout);
  }

  showGameOverMessage();
  gameOverTimeout = setTimeout(() => {
    hideGameOverMessage();
    gameOverTimeout = null;
  }, 3000);
}

function startGame() {
  gameRunning = true;
  gamePaused = false;
  gameState = "playing";
  score = 0;
  timeLeft = 30;
  updateScoreDisplay();
  updateTimeDisplay();
  setButtonLabel("Pause Game");
  if (gameOverTimeout) {
    clearTimeout(gameOverTimeout);
    gameOverTimeout = null;
  }
  hideGameOverMessage();

  clearGameElements();

  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(createDrop, 1000);

  // Count down the game time every second
  countdownTimer = setInterval(() => {
    timeLeft -= 1;
    updateTimeDisplay();

    if (timeLeft <= 0) {
      stopGame();
      clearGameElements();
    }
  }, 1000);
}

function pauseGame() {

  gameRunning = false;
  gamePaused = true;
  gameState = "paused";
  clearInterval(dropMaker);
  clearInterval(countdownTimer);
  setButtonLabel("Resume Game");
}

function resumeGame() {

  gameRunning = true;
  gamePaused = false;
  gameState = "playing";
  setButtonLabel("Pause Game");

  dropMaker = setInterval(createDrop, 1000);
  countdownTimer = setInterval(() => {
    timeLeft -= 1;
    updateTimeDisplay();

    if (timeLeft <= 0) {
      stopGame();
      clearGameElements();
    }
  }, 1000);
}

function toggleGame() {
  if (gameState === "ready" || gameState === "finished") {
    startGame();
  } else if (gameState === "playing") {
    pauseGame();
  } else if (gameState === "paused") {
    resumeGame();
  }
}

function getDropDuration() {
  const difficulty = difficultySelect.value;

  switch (difficulty) {
    case "medium":
      return `${Number((Math.random() * (4 - 3) + 3).toFixed(2))}s`;
    case "hard":
      return `${Number((Math.random() * (3 - 2) + 2).toFixed(2))}s`;
    case "easy":
    default:
      return "4s";
  }
}

function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  drop.className = "water-drop";

  // Make about 30% of drops bad drops
  if (Math.random() < 0.3) {
    drop.classList.add("bad-drop");
  }

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Apply the fall duration based on the selected difficulty
  drop.style.animationDuration = getDropDuration();

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Make each drop clickable and update the score and remove the drop when clicked
  drop.style.cursor = "pointer";
  let resolved = false;

  const finalizeDrop = (wasClicked) => {
    if (resolved) return;
    resolved = true;

    if (wasClicked) {
      if (drop.classList.contains("bad-drop")) {
        score = Math.max(0, score - 1);
        playSound(badDropSound);
      } else {
        score += 1;
        playSound(goodDropSound);
      }
    } else {
      const difficulty = difficultySelect.value;
      if (difficulty === "medium" || difficulty === "hard") {
        if (drop.classList.contains("bad-drop")) {
          score += 1;
        } else {
          score = Math.max(0, score - 1);
        }
      }
    }

    updateScoreDisplay();
    drop.remove();
  };

  drop.addEventListener("click", () => {
    if (!gameRunning || gamePaused) return;
    finalizeDrop(true);
  });

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    finalizeDrop(false);
  });
}
