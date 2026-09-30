# Balloon World (Balloon Shooter) 🎈💥

> **Play it live on GitHub Pages:**  
> 👉 [https://amitjoshi2724.github.io/balloon-world/](https://amitjoshi2724.github.io/balloon-world/)

---

## 📖 Overview

A faithful, pixel-perfect web port of the classic **Balloon Shooter** arcade game written in Java Swing (`ProgrammingExercise16_25.java`).

The original visual aesthetics, window chrome (`ProgrammingExercise16_25`), gun aiming mechanics, balloon physics, bullet trajectories, retro typography, and leaderboard dialog have been accurately rebuilt using **HTML5**, **CSS3**, and **Vanilla JavaScript**.

---

## 🎮 How to Play

1. **Start:** Read the instructions on the start screen and click **Start**.
2. **Aim:**
   - **Mouse:** Hover your mouse across the canvas — the red crosshair (`Aimer`) follows your cursor, and the gun rotates to track it!
   - **Keyboard:** Press <kbd>←</kbd> and <kbd>→</kbd> arrow keys to manually rotate the gun barrel left and right.
3. **Shoot:**
   - Press <kbd>Space</kbd> or <kbd>↑</kbd> arrow key, or **Left-Click** anywhere on the canvas to shoot bullets.
4. **Balloons & Scoring:**
   - Colorful balloons float up from the bottom of the screen.
   - Pop them with your bullets to increase your **Count** (score).
   - If a balloon floats past the top of the screen unpopped, you get a **Miss**.
   - If you miss **3 balloons**, the game is over!
5. **Pause & Play:**
   - Press <kbd>P</kbd> or click the **Pause** / **Play** buttons at the bottom.
6. **Leaderboard:**
   - When Game Over occurs, click **Leaderboard/Submit Score** to record your name and see your ranking on the high scores table!

---

## ✨ Features & Faithfulness

- **100% Identical Visuals:** Recreates the exact Swing window layout, fonts, and controls.
- **Dual Aiming & Firing Modes:** Seamless support for both keyboard arrows and mouse aiming.
- **Audio Synthesizer:** Built-in retro Web Audio sound effects for gun shots, balloon pops, and game over chimes (no external audio assets required).
- **Persistent High Scores:** LocalStorage-powered leaderboard preserving high scores.
- **Mobile Friendly:** Fully responsive desktop frame that scales smoothly on smaller screens and mobile devices.

---

## 🛠️ Original Java Source

The original Java Swing source file is preserved in this repository:
- [`ProgrammingExercise16_25.java`](ProgrammingExercise16_25.java)
