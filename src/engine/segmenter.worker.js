// src/engine/segmenter.worker.js

self.onmessage = (e) => {
  const { quantizedData, width, height, palette } = e.data;
  const regions = segmentImage(quantizedData, width, height, palette);
  // Post the result back to the main thread
  self.postMessage(regions);
};

function segmentImage(pixelData, width, height, palette) {
  const visited = new Uint8Array(width * height);
  const regions = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (visited[idx]) continue;

      const colorIdx = getColorIndex(pixelData, idx, palette);
      const pixels = [];
      const queue = [[x, y]];
      visited[idx] = 1;
      let head = 0; // Use a pointer for an efficient queue

      let minX = x, maxX = x, minY = y, maxY = y;

      while (head < queue.length) {
        const [cx, cy] = queue[head++]; // O(1) queue operation
        pixels.push(cy * width + cx);
        minX = Math.min(minX, cx);
        maxX = Math.max(maxX, cx);
        minY = Math.min(minY, cy);
        maxY = Math.max(maxY, cy);

        for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
          const nx = cx + dx;
          const ny = cy + dy;
          const nidx = ny * width + nx;

          if (nx >= 0 && nx < width && ny >= 0 && ny < height && !visited[nidx]) {
            if (getColorIndex(pixelData, nidx, palette) === colorIdx) {
              visited[nidx] = 1;
              queue.push([nx, ny]);
            }
          }
        }
      }

      regions.push({ colorIndex: colorIdx, pixels, bounds: { minX, minY, maxX, maxY } });
    }
  }

  return regions;
}

function getColorIndex(pixelData, idx, palette) {
    const r = pixelData[idx * 4];
    const g = pixelData[idx * 4 + 1];
    const b = pixelData[idx * 4 + 2];
    
    // Find closest color in palette to handle subtle quantization differences
    let minDis = Infinity;
    let closestIndex = 0;
    for (let i = 0; i < palette.length; i++) {
        const pr = palette[i][0];
        const pg = palette[i][1];
        const pb = palette[i][2];
        const dis = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
        if (dis < minDis) {
            minDis = dis;
            closestIndex = i;
        }
    }
    return closestIndex;
}
