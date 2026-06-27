# 🦕 DinoLand Café — Sidework Board

A simple web app for assigning and tracking sidework for servers at DinoLand Café.

## Features

- **Live clock** — shows current time and date in Myrtle Beach, SC (Eastern Time)
- **Board view** — color-coded cards for each server showing their assignment
- **Admin panel**:
  - Add / remove servers
  - Assign sidework (Section 1–4, Silverware with amount, Salad Bar, Waitstation, No Sidework)
  - Edit or clear individual assignments
  - Reset all assignments or everything
- **Persistent** — assignments saved in browser `localStorage`

## Sidework Options

| Option | Color |
|---|---|
| Section 1 | Amber |
| Section 2 | Blue |
| Section 3 | Green |
| Section 4 | Purple |
| Silverware (+ amount) | Orange |
| Salad Bar | Teal |
| Waitstation | Violet |
| No Sidework | Gray |

## Usage

Just open `index.html` in any browser — no server or install needed.

Or host it on GitHub Pages for shared access across devices:

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to `main` branch, `/ (root)`
4. Access at `https://yourusername.github.io/dinoland-sidework/`

## Stack

Pure HTML + CSS + JS. No frameworks, no dependencies. Works offline.
