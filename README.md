# Paint-by-Numbers Generator

A web-based tool that transforms images into animated "Paint-by-Numbers" style videos. This application uses sophisticated image processing, color quantization, and computer vision techniques to segment images and animate their reconstruction.

## 🚀 Key Features

- **Image Downscaling & Pre-processing**: Optimized for performance while maintaining visual fidelity.
- **Dominant Color Extraction**: Custom k-means++ quantization optimized for a clean, 6-color palette.
- **Smart Segmentation**: Automatically identifies distinct regions based on color and proximity, merging tiny areas for visual clarity.
- **Edge Detection**: Precisely maps the "lines" for the paint-by-numbers effect.
- **Animation Engine**: Reconstructs the image region-by-region in a visually satisfying animation, ending with a clean "final" frame that matches the original photo.
- **MP4 Video Export**: Integrated with **FFmpeg.wasm** to encode the animation directly in the browser.

## 🛠 Tech Stack

- **Frontend**: React 19 + Vite
- **Processing**: Vanilla JavaScript (ES6+) with Web Workers for heavy lifting.
- **Video Encoding**: [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) (v0.11.x)
- **Styling**: Modern CSS with a focus on responsive design.

## ⚠️ Important: Cross-Origin Isolation

This project requires **SharedArrayBuffer** for FFmpeg multi-threading, which necessitates a "Cross-Origin Isolated" environment. The `vite.config.js` is pre-configured to serve the required headers:

```javascript
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: cross-origin
```

**Note:** If you are testing locally, ensure you are using a modern browser (Chrome, Firefox, or Edge) and accessing the site via `localhost` or `127.0.0.1`.

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/howieh123/PaintByNumbers.git
   cd PaintByNumbers
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

- `src/engine/`: Core logic for image processing and animation.
  - `quantizer.js`: Palette generation and color mapping.
  - `segmenter.js`: Region identification and edge detection.
  - `animator.js`: Canvas recording and animation scheduling.
- `public/assets/`: Local copies of FFmpeg.wasm and its core dependencies for offline/isolated use.

## 📄 License

This project is licensed under the ISC License.
