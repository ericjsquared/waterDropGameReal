// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let gamePaused = false; // Keeps track of whether the game is paused
let gameState = "ready"; // Tracks whether the game is ready, playing, paused, or finished
let dropMaker; // Will store our timer that creates drops regularly
let countdownTimer; // Will store the timer that counts down the game time
let score = 0; // Stores the player's current score
let timeLeft = 30; // Stores the remaining game time
const startButton = document.getElementById("start-btn");

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

function showGameOverMessage() {
  document.getElementById("final-score").textContent = score;
  document.getElementById("game-over").classList.remove("hidden");
}

function hideGameOverMessage() {
  document.getElementById("game-over").classList.add("hidden");
}

function stopGame() {
  gameRunning = false;
  gamePaused = false;
  gameState = "finished";
  clearInterval(dropMaker);
  clearInterval(countdownTimer);
  setButtonLabel("Start Game");

  setTimeout(() => {
    showGameOverMessage();
  }, 3000);
  hideGameOverMessage();
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

  // Make drops fall for 4 seconds
  drop.style.animationDuration = "4s";

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Make each drop clickable and update the score and remove the drop when clicked
  drop.style.cursor = "pointer";
  drop.addEventListener("click", () => {
    if (!gameRunning || gamePaused) return;

    if (drop.classList.contains("bad-drop")) {
      score = Math.max(0, score - 1);
    } else {
      score += 1;
    }

    updateScoreDisplay();
    drop.remove();
  });

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });
}
