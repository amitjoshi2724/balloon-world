/**
 * Balloon World
 * Faithful HTML5/JavaScript port of the classic Java Swing arcade game
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const startScreen = document.getElementById("start-screen");
  const gameScreen = document.getElementById("game-screen");
  const startBtn = document.getElementById("start-btn");
  const menuLeaderboardBtn = document.getElementById("menu-leaderboard-btn");
  const returnMenuBtn = document.getElementById("return-menu-btn");

  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");

  const leaderboardBtn = document.getElementById("leaderboard-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const playBtn = document.getElementById("play-btn");
  const restartBtn = document.getElementById("restart-btn");

  const leaderboardOverlay = document.getElementById("leaderboard-overlay");
  const leaderboardClose = document.getElementById("leaderboard-close");
  const leaderboardOkBtn = document.getElementById("leaderboard-ok-btn");
  const submitSection = document.getElementById("submit-section");
  const playerNameInput = document.getElementById("player-name-input");
  const submitScoreBtn = document.getElementById("submit-score-btn");
  const scoresList = document.getElementById("scores-list");

  // Web Audio Context for synthesized retro SFX
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playShotSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  }

  function playPopSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.09);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {}
  }

  function playGameOverSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [330, 293, 261, 220].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now + i * 0.18);
        gain.gain.setValueAtTime(0.18, now + i * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.01, now + (i + 1) * 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.18);
        osc.stop(now + (i + 1) * 0.18);
      });
    } catch (e) {}
  }

  // Game Constants matching Java Gun & BalloonMaker
  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 400;
  const CENTER_X = CANVAS_WIDTH / 2; // 300
  const GUN_BASE_Y = CANVAS_HEIGHT;  // 400
  const GUN_HEIGHT = CANVAS_HEIGHT / 10; // 40
  const GUN_STROKE = 8;
  const MAX_MISSES = 3; // matching instructions ("If you miss three balloons the game is over")

  // Smooth continuous rotation speed matching Spaceship-Flight (~210 deg/sec)
  const ROTATION_SPEED = 3.5; 

  // Game State
  let active = false;
  let paused = false;
  let isGameOver = false;
  let count = 0;
  let misses = 0;
  let gunAngle = 270.0; // degrees (270 = straight up)
  let bullets = [];
  let balloons = [];
  let mouseActive = false;
  let mouseX = 0;
  let mouseY = 0;
  let balloonTimer = null;
  let animationFrameId = null;

  // Continuous keyboard input tracking
  const keys = {
    left: false,
    right: false
  };

  // Helper to remove focus from buttons so space/arrow keys are not trapped
  function blurActiveElement() {
    if (document.activeElement && document.activeElement.blur && document.activeElement !== document.body) {
      document.activeElement.blur();
    }
  }

  // Gun Math
  function getGunTip() {
    const rad = (gunAngle * Math.PI) / 180.0;
    return {
      x: CENTER_X + GUN_HEIGHT * Math.cos(rad),
      y: GUN_BASE_Y + GUN_HEIGHT * Math.sin(rad)
    };
  }

  function turnLeft() {
    if (!active || paused || isGameOver) return;
    gunAngle = Math.max(185.0, gunAngle - ROTATION_SPEED);
    mouseActive = false;
  }

  function turnRight() {
    if (!active || paused || isGameOver) return;
    gunAngle = Math.min(355.0, gunAngle + ROTATION_SPEED);
    mouseActive = false;
  }

  function aimAt(x, y) {
    if (!active || paused || isGameOver) return;
    mouseActive = true;
    mouseX = Math.max(0, Math.min(CANVAS_WIDTH, x));
    mouseY = Math.max(0, Math.min(CANVAS_HEIGHT, y));

    const dx = mouseX - CENTER_X;
    // Force dy to be strictly negative so the gun barrel always points UP into the playfield (non-negative sine)
    const dy = Math.min(-1, mouseY - GUN_BASE_Y);

    const rad = Math.atan2(dy, dx);
    const deg = rad * (180.0 / Math.PI) + 360.0;

    // Clamp strictly between 185 deg and 355 deg (cannot point downward or below horizon)
    gunAngle = Math.max(185.0, Math.min(355.0, deg));
  }

  function fireBullet() {
    if (!active || paused || isGameOver) return;
    const tip = getGunTip();
    const rad = (gunAngle * Math.PI) / 180.0;
    const speed = 5.0;

    bullets.push({
      x: tip.x,
      y: tip.y,
      dx: speed * Math.cos(rad),
      dy: speed * Math.sin(rad),
      radius: 5,
      active: true
    });

    playShotSound();
  }

  // Balloon Spawner
  function spawnBalloon() {
    if (!active || paused || isGameOver) return;

    let x = 200;
    do {
      x = Math.random() * (CANVAS_WIDTH - 7);
    } while (Math.abs(x - CENTER_X) < (CANVAS_HEIGHT / 7));

    const r = Math.floor(Math.random() * 230);
    const g = Math.floor(Math.random() * 230);
    const b = Math.floor(Math.random() * 230);

    balloons.push({
      x: x,
      y: 400,
      radius: 15,
      dy: -0.75,
      color: `rgb(${r}, ${g}, ${b})`,
      popped: false,
      active: true
    });
  }

  // Collision detection: Circle to Circle
  function checkCollision(bullet, balloon) {
    if (!balloon.active || balloon.popped) return false;
    const bx = bullet.x;
    const by = bullet.y;
    const balX = balloon.x + balloon.radius;
    const balY = balloon.y + balloon.radius;
    const distSq = (bx - balX) ** 2 + (by - balY) ** 2;
    const radii = bullet.radius + balloon.radius;

    if (distSq <= radii ** 2) {
      balloon.popped = true;
      balloon.active = false;
      count++;
      playPopSound();
      return true;
    }
    return false;
  }

  // Update Game Physics
  function update() {
    if (!active || paused || isGameOver) return;

    // Smooth continuous cannon turning (matching Spaceship-Flight mechanics)
    if (keys.left) {
      gunAngle = Math.max(185.0, gunAngle - ROTATION_SPEED);
      mouseActive = false;
    }
    if (keys.right) {
      gunAngle = Math.min(355.0, gunAngle + ROTATION_SPEED);
      mouseActive = false;
    }

    // Update Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      if (!b.active) {
        bullets.splice(i, 1);
        continue;
      }

      b.x += b.dx;
      b.y += b.dy;

      // Check bullet collisions with active balloons (bullet pierces through popped balloons)
      for (const bal of balloons) {
        checkCollision(b, bal);
      }

      // Check canvas boundary (bullet leaves screen)
      if (b.x < 0 || b.x > CANVAS_WIDTH || b.y < 0 || b.y > CANVAS_HEIGHT) {
        b.active = false;
        bullets.splice(i, 1);
      }
    }

    // Update Balloons
    for (let i = balloons.length - 1; i >= 0; i--) {
      const bal = balloons[i];
      bal.y += bal.dy;

      // Check if balloon escaped off the top of screen
      if (bal.y + bal.radius * 2 < 0) {
        if (!bal.popped) {
          misses++;
          if (misses >= MAX_MISSES) {
            triggerGameOver();
          }
        }
        balloons.splice(i, 1);
      }
    }
  }

  // Render Frame matching classic arcade canvas
  function render() {
    // Clear canvas with white
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Balloons
    for (const bal of balloons) {
      if (bal.popped) continue;

      const diameter = bal.radius * 2;

      // Draw String
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#000000";
      ctx.moveTo(bal.x + bal.radius, bal.y + diameter);
      ctx.lineTo(bal.x + bal.radius, bal.y + diameter * 3);
      ctx.stroke();

      // Draw Balloon Body
      ctx.beginPath();
      ctx.fillStyle = bal.color;
      ctx.arc(bal.x + bal.radius, bal.y + bal.radius, bal.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Bullets
    ctx.fillStyle = "#000000";
    for (const b of bullets) {
      if (!b.active) continue;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Gun Cannon
    const tip = getGunTip();
    ctx.beginPath();
    ctx.lineWidth = GUN_STROKE;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000000";
    ctx.moveTo(CENTER_X, GUN_BASE_Y);
    ctx.lineTo(tip.x, tip.y);
    ctx.stroke();

    // Draw Mouse Crosshair (Aimer) - only when actively aiming and NOT paused
    if (mouseActive && !isGameOver && !paused && active) {
      const RADIUS = 7;
      ctx.beginPath();
      ctx.fillStyle = "#ff0000";
      ctx.arc(mouseX, mouseY, RADIUS, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#000000";
      ctx.moveTo(mouseX, mouseY - RADIUS);
      ctx.lineTo(mouseX, mouseY + RADIUS);
      ctx.moveTo(mouseX - RADIUS, mouseY);
      ctx.lineTo(mouseX + RADIUS, mouseY);
      ctx.stroke();
    }

    // Draw HUD Scoreboard (Matching classic SansSerif font)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(260, 0, 100, 52);

    ctx.font = "18px Sans-Serif";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "left";
    ctx.fillText("Count: " + count, 270, 20);
    ctx.fillText("Misses: " + misses, 270, 42);

    // Draw Paused Overlay
    if (paused && !isGameOver && active) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.font = "bold 38px Sans-Serif";
      ctx.fillStyle = "#1e293b";
      ctx.textAlign = "center";
      ctx.fillText("PAUSED", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 8);

      ctx.font = "15px Sans-Serif";
      ctx.fillStyle = "#64748b";
      ctx.fillText("Press P or click Play to resume", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 28);
    }

    // Draw Game Over Screen
    if (isGameOver) {
      ctx.font = "80px Sans-Serif";
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.fillText("Game Over", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);

      ctx.font = "20px Sans-Serif";
      ctx.fillText("Final Score: " + count + "  •  Misses: " + misses, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 55);
    }
  }

  // Animation Loop
  function gameLoop() {
    update();
    render();
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // Game Lifecycle
  function startGame() {
    active = true;
    paused = false;
    isGameOver = false;
    count = 0;
    misses = 0;
    bullets = [];
    balloons = [];
    gunAngle = 270.0;
    mouseActive = false;
    keys.left = false;
    keys.right = false;

    pauseBtn.disabled = false;
    playBtn.disabled = true;
    leaderboardBtn.disabled = true;

    blurActiveElement();

    if (balloonTimer) clearInterval(balloonTimer);
    balloonTimer = setInterval(spawnBalloon, 1800);

    // Initial first balloon
    spawnBalloon();
  }

  function pauseGame() {
    if (!active || isGameOver) return;
    paused = true;
    pauseBtn.disabled = true;
    playBtn.disabled = false;
    mouseActive = false;
    keys.left = false;
    keys.right = false;
    blurActiveElement();
    if (balloonTimer) clearInterval(balloonTimer);
  }

  function resumeGame() {
    if (!active || isGameOver) return;
    paused = false;
    pauseBtn.disabled = false;
    playBtn.disabled = true;
    keys.left = false;
    keys.right = false;
    blurActiveElement();
    if (balloonTimer) clearInterval(balloonTimer);
    balloonTimer = setInterval(spawnBalloon, 1800);
  }

  function triggerGameOver() {
    isGameOver = true;
    active = false;
    mouseActive = false;
    keys.left = false;
    keys.right = false;
    if (balloonTimer) clearInterval(balloonTimer);
    pauseBtn.disabled = true;
    playBtn.disabled = true;
    leaderboardBtn.disabled = false;
    blurActiveElement();

    playGameOverSound();
  }

  function returnToMainMenu() {
    active = false;
    paused = false;
    isGameOver = false;
    mouseActive = false;
    keys.left = false;
    keys.right = false;
    if (balloonTimer) clearInterval(balloonTimer);
    bullets = [];
    balloons = [];
    gameScreen.classList.remove("active");
    startScreen.classList.add("active");
    blurActiveElement();
  }

  // Leaderboard Persistence (localStorage) - No Dummy Data
  const STORAGE_KEY = "balloon_world_highscores";

  function getHighScores() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return [];
  }

  function saveHighScores(scores) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    } catch (e) {}
  }

  function openLeaderboard(showSubmit = false) {
    const scores = getHighScores();
    scores.sort((a, b) => b.score - a.score);

    scoresList.innerHTML = "";
    if (scores.length === 0) {
      scoresList.innerHTML = `
        <div style="padding: 24px; text-align: center; color: #64748b; font-size: 13.5px;">
          No high scores recorded yet.<br>Play Balloon World and claim the #1 spot!
        </div>
      `;
    } else {
      scores.slice(0, 10).forEach((entry, idx) => {
        const row = document.createElement("div");
        row.className = "score-row";
        row.innerHTML = `
          <span class="player-name">${idx + 1}. ${escapeHtml(entry.name)}</span>
          <span class="player-score">${entry.score}</span>
        `;
        scoresList.appendChild(row);
      });
    }

    if (showSubmit) {
      submitSection.style.display = "flex";
      playerNameInput.value = "";
      playerNameInput.focus();
    } else {
      submitSection.style.display = "none";
    }

    leaderboardOverlay.classList.add("active");
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // Event Listeners
  startBtn.addEventListener("click", () => {
    blurActiveElement();
    startScreen.classList.remove("active");
    gameScreen.classList.add("active");
    startGame();
    getAudioContext();
  });

  menuLeaderboardBtn.addEventListener("click", () => {
    blurActiveElement();
    openLeaderboard(false);
  });

  returnMenuBtn.addEventListener("click", () => {
    blurActiveElement();
    returnToMainMenu();
  });

  pauseBtn.addEventListener("click", () => {
    blurActiveElement();
    pauseGame();
  });

  playBtn.addEventListener("click", () => {
    blurActiveElement();
    resumeGame();
  });

  restartBtn.addEventListener("click", () => {
    blurActiveElement();
    startGame();
  });

  leaderboardBtn.addEventListener("click", () => {
    blurActiveElement();
    openLeaderboard(isGameOver);
  });

  leaderboardClose.addEventListener("click", () => {
    blurActiveElement();
    leaderboardOverlay.classList.remove("active");
  });

  leaderboardOkBtn.addEventListener("click", () => {
    blurActiveElement();
    leaderboardOverlay.classList.remove("active");
  });

  submitScoreBtn.addEventListener("click", () => {
    const name = playerNameInput.value.trim() || "Player";
    const scores = getHighScores();
    scores.push({ name, score: count });
    scores.sort((a, b) => b.score - a.score);
    saveHighScores(scores);
    submitSection.style.display = "none";
    openLeaderboard(false);
  });

  playerNameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      submitScoreBtn.click();
    }
  });

  // Canvas Mouse Controls - Ignored when paused
  canvas.addEventListener("mousemove", (e) => {
    if (!active || paused || isGameOver) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    aimAt(x, y);
  });

  canvas.addEventListener("mouseleave", () => {
    mouseActive = false;
  });

  canvas.addEventListener("mousedown", (e) => {
    if (!active || paused || isGameOver) return;
    blurActiveElement();
    if (e.button === 0) {
      fireBullet();
    }
  });

  // Keyboard Controls (Smooth continuous turning matching Spaceship-Flight)
  window.addEventListener("keydown", (e) => {
    if (!gameScreen.classList.contains("active")) return;

    if (e.key === "p" || e.key === "P") {
      if (!paused) pauseGame();
      else resumeGame();
      return;
    }

    if (!active || paused || isGameOver) return;

    const isLeft = e.key === "ArrowLeft" || e.code === "ArrowLeft" || e.key === "a" || e.key === "A" || e.code === "KeyA";
    const isRight = e.key === "ArrowRight" || e.code === "ArrowRight" || e.key === "d" || e.key === "D" || e.code === "KeyD";
    const isFire = e.key === "ArrowUp" || e.code === "ArrowUp" || e.key === " " || e.code === "Space" || e.key === "w" || e.key === "W" || e.code === "KeyW";

    if (isLeft) {
      e.preventDefault();
      if (!keys.left) {
        // Immediate step on initial keydown for snappy taps
        gunAngle = Math.max(185.0, gunAngle - ROTATION_SPEED);
      }
      keys.left = true;
      mouseActive = false;
    } else if (isRight) {
      e.preventDefault();
      if (!keys.right) {
        // Immediate step on initial keydown for snappy taps
        gunAngle = Math.min(355.0, gunAngle + ROTATION_SPEED);
      }
      keys.right = true;
      mouseActive = false;
    } else if (isFire) {
      e.preventDefault();
      if (!e.repeat) {
        fireBullet();
      }
    }
  });

  window.addEventListener("keyup", (e) => {
    const isLeft = e.key === "ArrowLeft" || e.code === "ArrowLeft" || e.key === "a" || e.key === "A" || e.code === "KeyA";
    const isRight = e.key === "ArrowRight" || e.code === "ArrowRight" || e.key === "d" || e.code === "KeyD";
    if (isLeft) keys.left = false;
    if (isRight) keys.right = false;
  });

  // Reset keys on window blur
  window.addEventListener("blur", () => {
    keys.left = false;
    keys.right = false;
  });

  // Check query param to auto-start for testing/debugging
  if (new URLSearchParams(window.location.search).get("screen") === "game") {
    startScreen.classList.remove("active");
    gameScreen.classList.add("active");
    startGame();
  }

  // Start Animation Loop
  gameLoop();
});
