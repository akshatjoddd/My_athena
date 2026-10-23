# myAthena Test App

A small Electron + React desktop assessment prototype.

## Features

- Camera permission request and live preview (no recording or upload)
- Electron fullscreen button
- Fixed sample questions shown after fullscreen is entered, followed by a Start Test button
- Multiple-choice answers, question navigation, local scoring
- `Command + Q` on macOS (or `Ctrl + Q` on Windows/Linux) remains the standard quit shortcut
- No login, server, database, or authentication

## Requirements

- Node.js 20 or newer
- npm
- macOS, Windows, or Linux desktop

## Run locally

```bash
npm install
npm run dev
```

## Build the web assets

```bash
npm run build
```

## Package a desktop app

```bash
npm run dist
```

Run packaging on the operating system you intend to package for, or configure a proper cross-build environment. The generated installer will be in `dist/` or `release/` depending on the electron-builder version/configuration.

## Change the fixed questions

Edit the `QUESTIONS` array near the top of `src/App.jsx`. Each question has:
- `id`
- `topic`
- `question`
- `options`
- `answer` (zero-based option index used for the demo score)

## Important notes

- Camera permission must be granted by the user and by the operating system.
- On macOS, if camera access is blocked, open **System Settings → Privacy & Security → Camera** and allow the app/terminal as appropriate.
- The fullscreen flow is intended to keep the test focused, not to provide secure kiosk lockdown. Users may still be able to leave through operating-system controls or system-level shortcuts.
- This demo does not record or transmit video. It only shows a live local preview.
- The question set and answer key are sample content. Replace them with your actual questions.
