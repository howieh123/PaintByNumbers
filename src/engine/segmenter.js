export function segmentImage(pixelData, width, height, palette) {
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

      let minX = x, maxX = x, minY = y, maxY = y;

      while (queue.length > 0) {
        const [cx, cy] = queue.shift();
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

      // Keep all regions to ensure no "holes" in the painting
      regions.push({ colorIndex: colorIdx, pixels, bounds: { minX, minY, maxX, maxY } });
    }
  }

  return regions;
}

function getColorIndex(pixelData, idx, palette) {
  const r = pixelData[idx * 4];
  const g = pixelData[idx * 4 + 1];
  const b = pixelData[idx * 4 + 2];
  for (let i = 0; i < palette.length; i++) {
    if (palette[i][0] === r && palette[i][1] === g && palette[i][2] === b) return i;
  }
  return 0;
}

export function findEdges(pixelData, width, height) {
  const edges = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const r = pixelData[idx * 4];
      const g = pixelData[idx * 4 + 1];
      const b = pixelData[idx * 4 + 2];

      for (const [dx, dy] of [[0, 1], [1, 0]]) {
        const nx = x + dx;
        const ny = y + dy;
        const nidx = ny * width + nx;

        if (nx < width && ny < height) {
          const nr = pixelData[nidx * 4];
          const ng = pixelData[nidx * 4 + 1];
          const nb = pixelData[nidx * 4 + 2];

          if (r !== nr || g !== ng || b !== nb) {
            edges[idx] = 1;
          }
        }
      }
    }
  }
  return edges;
}

export function findRegionCenters(regions, width, height) {
  return regions.map(region => {
    let sumX = 0, sumY = 0;
    for (const p of region.pixels) {
      sumX += p % width;
      sumY += Math.floor(p / width);
    }
    return {
      x: Math.round(sumX / region.pixels.length),
      y: Math.round(sumY / region.pixels.length)
    };
  });
}
