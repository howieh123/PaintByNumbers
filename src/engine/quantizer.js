export function getDominantColors(pixelData, k = 4) {
  const pixels = [];
  for (let i = 0; i < pixelData.data.length; i += 4) {
    pixels.push([pixelData.data[i], pixelData.data[i + 1], pixelData.data[i + 2]]);
  }

  // k-means++ initialization for centroids
  let centroids = [pixels[Math.floor(Math.random() * pixels.length)]];
  for (let i = 1; i < k; i++) {
    const distances = pixels.map(p => {
      let minDist = Infinity;
      for (const c of centroids) {
        const d = distSq(p, c);
        if (d < minDist) minDist = d;
      }
      return minDist;
    });

    const sum = distances.reduce((a, b) => a + b, 0);
    let r = Math.random() * sum;
    for (let j = 0; j < distances.length; j++) {
      r -= distances[j];
      if (r <= 0) {
        centroids.push(pixels[j]);
        break;
      }
    }
  }

  // Iterative refinement
  for (let iter = 0; iter < 10; iter++) {
    const groups = Array.from({ length: k }, () => []);
    for (const p of pixels) {
      let minDist = Infinity;
      let minIdx = 0;
      for (let i = 0; i < k; i++) {
        const d = distSq(p, centroids[i]);
        if (d < minDist) {
          minDist = d;
          minIdx = i;
        }
      }
      groups[minIdx].push(p);
    }

    const nextCentroids = groups.map((g, i) => {
      if (g.length === 0) return centroids[i];
      const sum = g.reduce((a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], [0, 0, 0]);
      return [Math.round(sum[0] / g.length), Math.round(sum[1] / g.length), Math.round(sum[2] / g.length)];
    });

    if (JSON.stringify(centroids) === JSON.stringify(nextCentroids)) break;
    centroids = nextCentroids;
  }

  return centroids;
}

export function applyPalette(pixelData, palette) {
  const result = new Uint8ClampedArray(pixelData.data.length);
  for (let i = 0; i < pixelData.data.length; i += 4) {
    const p = [pixelData.data[i], pixelData.data[i + 1], pixelData.data[i + 2]];
    let minDist = Infinity;
    let minIdx = 0;
    for (let j = 0; j < palette.length; j++) {
      const d = distSq(p, palette[j]);
      if (d < minDist) {
        minDist = d;
        minIdx = j;
      }
    }
    result[i] = palette[minIdx][0];
    result[i + 1] = palette[minIdx][1];
    result[i + 2] = palette[minIdx][2];
    result[i + 3] = 255; // opaque
  }
  return result;
}

function distSq(a, b) {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
}
