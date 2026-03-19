# Photo to Paint-by-Numbers Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based tool that converts photos into a 4-color paint-by-numbers animation and exports it as an MP4.

**Architecture:** A React frontend for the UI, a Vanilla JS core for image processing (k-means quantization and region segmentation), and a Canvas-based animation loop captured by the MediaRecorder API.

**Tech Stack:** React, Vite, Vanilla JS (Canvas API), CSS.

---

### Task 1: Project Scaffolding

**Files:**
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/App.css`

- [ ] **Step 1: Create vite.config.js**
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

- [ ] **Step 2: Create index.html**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Paint-by-Numbers Generator</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create src/main.jsx**
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 4: Create basic src/App.jsx**
```javascript
import React, { useState } from 'react';

function App() {
  return (
    <div className="app-container">
      <header>
        <h1>Paint-by-Numbers</h1>
      </header>
      <main>
        <div className="upload-section">
          <input type="file" accept="image/*" />
          <p>Upload a photo to start</p>
        </div>
      </main>
    </div>
  );
}

export default App;
```

- [ ] **Step 5: Commit scaffolding**
```bash
git add .
git commit -m "chore: initial project scaffolding with vite and react"
```

---

### Task 2: Core Image Processing - Quantization (k-means)

**Files:**
- Create: `src/engine/quantizer.js`
- Create: `src/engine/utils.js`

- [ ] **Step 1: Implement image downscaling in utils.js**
```javascript
export function downscaleImage(canvas, maxDim = 400) {
  // Resizes a canvas if its dimensions exceed maxDim while preserving aspect ratio.
  // Returns: New downscaled canvas.
}
```

- [ ] **Step 2: Implement k-means quantizer in quantizer.js**
```javascript
export function getDominantColors(pixelData, k = 4) {
  // Implementation of k-means clustering with k-means++ initialization
  // Returns: Array of 4 [R, G, B] arrays.
}

export function applyPalette(pixelData, palette) {
  // Maps each pixel to the closest color in the palette.
}
```

- [ ] **Step 3: Commit quantizer**
```bash
git add src/engine/quantizer.js src/engine/utils.js
git commit -m "feat: implement image downscaling and k-means quantization"
```

---

### Task 3: Region Segmentation & Edge Detection

**Files:**
- Create: `src/engine/segmenter.js`

- [ ] **Step 1: Implement region detection in segmenter.js**
```javascript
export function segmentImage(quantizedData, width, height) {
  // 1. Uses flood-fill to find connected regions.
  // 2. Filters out "noise" regions (e.g., < 20 pixels) by reassigning to nearest neighbor.
  // Returns: Array of regions { colorIndex, pixels: [], bounds: {minX, minY, maxX, maxY} }.
}
```

- [ ] **Step 2: Implement edge/outline detection**
```javascript
export function findEdges(quantizedData, width, height) {
  // Pixel-neighbor checking to find boundary pixels between different colors.
  // Returns: Uint8Array (mask) where 1 indicates an edge pixel.
}
```

- [ ] **Step 3: Implement region center calculation**
```javascript
export function findRegionCenters(regions) {
  // Calculates visual center (using a "pole of inaccessibility" or max-inscribed-circle proxy)
  // to ensure numbers (1-4) stay inside non-convex regions.
}
```

- [ ] **Step 4: Commit segmenter**
```bash
git add src/engine/segmenter.js
git commit -m "feat: implement segmentation with noise filtering and region numbering"
```

---

### Task 4: Animation & Video Export

**Files:**
- Create: `src/engine/animator.js`

- [ ] **Step 1: Implement timed animation phases in animator.js**
```javascript
// Phase 1: Show numbered outlines (3s)
// Phase 2-5: Fill Colors 1-4 (4s each)
// Phase 6: Final result (3s)
export function startAnimation(canvas, regions, edges, palette, onFrame, onComplete) {
  // Uses requestAnimationFrame for the loop.
  // Calls onFrame for each captured frame and onComplete when done.
}
```

- [ ] **Step 2: Integrate MediaRecorder with dynamic synchronization**
```javascript
export function recordCanvas(canvas, onComplete) {
  // Starts MediaRecorder(canvas.captureStream()).
  // Listens for 'ondataavailable' and stops when requested.
  // Returns a promise that resolves with the final Blob (WebM/MP4).
}
```

- [ ] **Step 3: Commit animator**
```bash
git add src/engine/animator.js
git commit -m "feat: implement timed animation phases and synchronized video recording"
```

---

### Task 5: UI Integration & Styling

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.css`

- [ ] **Step 1: Build the processing pipeline in App.jsx**
- [ ] **Step 2: Add progress indicators and preview canvas**
- [ ] **Step 3: Add "Download MP4" functionality**
- [ ] **Step 4: Polish styles for "Creative Tool" aesthetic**

- [ ] **Step 5: Final Commit**
```bash
git add .
git commit -m "feat: final UI integration and styling"
```
