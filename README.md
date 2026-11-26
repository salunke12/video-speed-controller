# Video Speed Controller

A lightweight Chrome extension (Manifest V3) for controlling HTML5 video playback speed, with quick presets and keyboard shortcuts for fine adjustments.

## Features

- **Quick presets:** 1x, 1.25x, 1.5x, 1.75x, 2x, 2.25x, 2.5x, 2.75x, 3x
- **Fine control:** change speed in 0.05x steps using the popup buttons
- **Hotkeys:** press `<` to slow down and `>` to speed up (0.05x per press), with no need to open the extension
- **On-page indicator:** a small overlay shows the current speed when it changes
- **Remembers your speed** across pages
- Works with videos inside iframes and in fullscreen

## Installation

1. Clone or download this repository:
   ```bash
   git clone https://github.com/<your-username>/video-speed-controller.git
   ```
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the project folder.
5. Reload any tabs that already have a video open.

## Usage

| Action | How |
| --- | --- |
| Set a preset speed | Click the toolbar icon, then choose a speed |
| Increase by 0.05x | Press `>` (`Shift` + `.`) or click `>` in the popup |
| Decrease by 0.05x | Press `<` (`Shift` + `,`) or click `<` in the popup |

Hotkeys are ignored while typing in text fields. Speed is limited to 0.1x–16x.

## Project structure

```
video-speed-controller/
├── manifest.json     # Extension config (Manifest V3)
├── content.js        # Hotkeys, speed logic, on-page overlay
├── popup.html        # Popup markup
├── popup.css         # Popup styles
├── popup.js          # Popup logic
└── icons/            # Extension icons (16, 32, 48, 128 px)
```

## Limitations

- Chrome does not allow extensions on `chrome://` pages or the Chrome Web Store.
- For local video files (`file://`), enable **Allow access to file URLs** in the extension's details page.
- On sites that reset playback speed on their own, the extension reapplies your speed when a new video loads.

## Tech

JavaScript (vanilla), Chrome Extensions API (Manifest V3), `chrome.storage`, content scripts.

