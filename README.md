# Balloon World 🎈✨

> **Play it live on GitHub Pages:**  
> 👉 [https://amitjoshi2724.github.io/balloon-world/](https://amitjoshi2724.github.io/balloon-world/)

---

## 📖 Overview

A faithful, modern arcade web recreation of **Balloon World**.

Built using clean **HTML5**, **CSS3**, and **Vanilla JavaScript**, featuring an arcade main menu, floating balloon physics, smooth mouse and keyboard aiming, synthesized retro sound effects, and persistent high scores.

---

## 🎮 How to Play

1. **Main Menu:** Check your mission briefing, controls, and high scores, then click **Play Balloon World**.
2. **Aim:**
   - **Mouse:** Move your cursor across the canvas — the red crosshair tracks your target and the cannon dynamically rotates to aim.
   - **Keyboard:** Press <kbd>←</kbd> and <kbd>→</kbd> (or <kbd>A</kbd> / <kbd>D</kbd>) to smoothly rotate the cannon barrel. Single taps provide cushioned 1.5° precision nudges.
3. **Fire:**
   - Press <kbd>Space</kbd>, <kbd>↑</kbd>, <kbd>W</kbd>, or **Left-Click** anywhere on the canvas to launch darts.
4. **Balloons & Rules:**
   - Vibrant balloons float up into the sky. Pop them before they float off-screen to raise your score.
   - If you let **3 balloons** escape, the game ends!
5. **Sound Setting:**
   - Sound is **OFF** by default. Toggle sound on/off anytime using the button on the main menu, in the in-game control bar, or by pressing <kbd>M</kbd>.
6. **Pause & Resume:**
   - Press <kbd>P</kbd> or click the **Pause** / **Play** buttons in the control bar.
7. **Main Menu & Leaderboard:**
   - At any time, click **Main Menu** to return to the home screen.
   - When Game Over is reached, record your name on the **High Scores Leaderboard**!

---

## 📲 Install as an App & Play Offline (Mac, iOS & Android)

**Balloon World** is built as a full **Progressive Web App (PWA)** powered by a dedicated **Service Worker (`sw.js`)** and Web App Manifest (`manifest.json`). 

Once installed to your desktop or smartphone:
- ✈️ **100% Offline Playable:** All game logic, balloon physics, procedural Web Audio synthesizers, and arcade assets are pre-cached directly to persistent device storage via the **Cache Storage API**. You can play in Airplane Mode with zero Wi-Fi or cellular data anytime, anywhere.
- 🖥️ **Native Standalone Window:** Launches in its own dedicated window without browser address bars, URL fields, or tabs.
- 🔄 **Zero-Hassle Background Updates:** When you connect to Wi-Fi, the Service Worker automatically fetches and updates any new changes pushed to GitHub.

### 🍎 Mac (macOS Desktop App)

You can install **Balloon World** directly as a native macOS desktop application with its own dedicated window, Dock icon, and full offline support:

#### Method A: Safari (macOS Sonoma / Sequoia or newer)
1. Open **[https://amitjoshi2724.github.io/balloon-world/](https://amitjoshi2724.github.io/balloon-world/)** in **Safari**.
2. In the top menu bar, click **File** > **Add to Dock...** (or click the **Share** button in the Safari toolbar and select **Add to Dock**).
3. Name it **Balloon World** and click **Add**.
4. The game is saved to your `Applications` folder and pinned to your **macOS Dock**.
5. Launch it like any native Mac app—it runs in its own window without browser tabs or address bars, supports full keyboard controls, and is 100% playable offline!

#### Method B: Google Chrome, Brave, or Microsoft Edge
1. Open **[https://amitjoshi2724.github.io/balloon-world/](https://amitjoshi2724.github.io/balloon-world/)** in **Chrome**, **Brave**, or **Edge**.
2. Click the **Install Balloon World** icon in the right side of the address/URL bar (or go to **Settings (⋮)** > **Save and share** > **Install Balloon World...**).
3. Click **Install**.
4. The game opens in its own standalone desktop window and is added to your Mac's **Launchpad**, **Spotlight**, and `~/Applications/Chrome Apps` folder.

### 🍏 iPhone & iPad (iOS Safari)
1. Open **[https://amitjoshi2724.github.io/balloon-world/](https://amitjoshi2724.github.io/balloon-world/)** in **Safari**.
2. Tap the **Share** button at the bottom of the screen (the square with an arrow pointing upward).
3. Scroll down the share sheet and tap **"Add to Home Screen"**.
4. Tap **Add** in the top-right corner. A dedicated Balloon World icon will appear on your home screen.
5. Tap the new icon once while online to let the Service Worker cache all assets—after that, it is permanently playable offline!

### 🤖 Android (Google Chrome)
1. Open **[https://amitjoshi2724.github.io/balloon-world/](https://amitjoshi2724.github.io/balloon-world/)** in **Google Chrome**.
2. Tap the **three-dots menu (⋮)** in the top-right corner.
3. Tap **"Install app"** (or **"Add to Home screen"**).
4. Tap **Install** on the prompt. The game will install directly to your home screen and app drawer as an offline-ready arcade app.

---

## ✨ Features

- **Arcade Main Menu:** Floating balloon animations, drifting cloudscapes, intuitive controls guide, featured retro favicon emblem, and instant high score access.
- **Precision Aiming Math:** Smooth trigonometric tracking clamped strictly upward between 185° and 355° to prevent inverted or downward aiming.
- **Calibrated Turning Physics:** Constant 50°/second rotation rate with exponential smoothing and cushioned 1.5° single-tap nudging.
- **Audio Synthesizer & Sound Toggle:** Built-in retro Web Audio sound effects for shots, popping balloons, and game over melodies, with sound off by default and toggleable anytime.
- **Clean Leaderboard:** Real player scores persisted in LocalStorage (zero fake/dummy entries).
- **Responsive Layout:** Beautiful retro desktop window frame that scales seamlessly across all display sizes.
