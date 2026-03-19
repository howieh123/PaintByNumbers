# Design Spec: Photo to Paint-by-Numbers Tool

## 1. Overview
A browser-based creative tool that transforms user-uploaded photos into a simplified 16-color representation and generates an "Instructional" paint-by-numbers animation, exportable as an MP4 video.

### Goal
To provide a simple, privacy-focused way for users to visualize how a photo can be recreated using a limited color palette, suitable for physical painting or digital study.

---

## 2. User Experience
1. **Upload:** User selects a photo (JPG/PNG).
2. **Process:** The tool automatically:
   - Identifies the 16 dominant colors (k-means clustering).
   - Segments the image into regions of those 16 colors.
   - Assigns a number (1-16) to each color.
3. **Review:** User sees a preview of the 16-color image.
4. **Animate:** User clicks "Generate Video".
   - The app plays an animation: starts with a numbered outline "canvas" and reveals each color region one by one.
5. **Download:** User downloads the resulting animation as an MP4.

---

## 3. Technical Architecture

### 3.1 Frontend (React + Vanilla CSS)
- **UI:** A clean, focused interface with a "Dark Mode" aesthetic.
- **State Management:** Simple React `useState`/`useReducer` for the processing pipeline (Idle -> Uploading -> Processing -> Previewing -> Generating -> Done).

### 3.2 Processing Engine (Canvas API)
- **Quantization Layer:**
  - Uses `k-means` clustering on the RGB pixel data to find 4 centroids (dominant colors).
  - Re-maps every pixel in the image to its nearest centroid.
- **Segmentation Layer:**
  - Uses a connected-components or "flood-fill" approach to identify continuous regions of the same color.
  - Generates a "Number Map" where each significant region is marked with its color index.
- **Animation Engine:**
  - Draws a "blank" canvas with thin gray outlines for all identified regions.
  - Places a small, centered number (1-16) in each region.
  - Sequentially reveals all regions of Color 1, then Color 2, etc., using an animated "fill" effect.

### 3.3 Output Layer (MediaRecorder API)
- Captures the stream from the `<canvas>` element during the animation loop.
- Encodes the stream as an MP4 (H.264/VP8/VP9 depending on browser support).
- Provides a Blob URL for the user to download.

---

## 4. Implementation Details

### 4.1 Quantization (k-means)
- Downscale the image before clustering for performance (e.g., max 400px width).
- Initialize centroids using the "k-means++" approach for better stability.

### 4.2 Region Outlining
- Use the Marching Squares algorithm or simple pixel-neighbor checking to find edges between different color regions.
- Render these edges as thin lines on the canvas.

### 4.3 Animation Sequence
- **Phase 1:** Show numbered outlines (3 seconds).
- **Phase 2:** Fill Color 1 regions (4 seconds).
- **Phase 3:** Fill Color 2 regions (4 seconds).
- **Phase 4:** Fill Color 3 regions (4 seconds).
- **Phase 5:** Fill Color 4 regions (4 seconds).
- **Phase 6:** Final result (3 seconds).

---

## 5. Success Criteria
- [ ] Users can upload images up to 5MB.
- [ ] Quantization consistently produces 4 distinct, dominant colors.
- [ ] The animation accurately reflects the quantized image.
- [ ] The resulting MP4 is playable in standard video players (QuickTime, VLC, Chrome).
- [ ] All processing happens client-side (no server uploads).
