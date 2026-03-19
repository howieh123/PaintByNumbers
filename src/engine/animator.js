export function startAnimation(canvas, regions, edges, palette, onFrame, onComplete) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const regionCenters = regions.map(r => findVisualCenter(r, width, height));

  // Offscreen canvas for cumulative caching
  const offCanvas = document.createElement('canvas');
  offCanvas.width = width;
  offCanvas.height = height;
  const offCtx = offCanvas.getContext('2d');
  offCtx.fillStyle = '#fff';
  offCtx.fillRect(0, 0, width, height);

  const phases = [
    { name: 'outline', duration: 2000 },
    ...palette.map((_, i) => ({ name: 'fill', colorIdx: i, duration: 2000 })),
    { name: 'final', duration: 2000 }
  ];

  let startTime = null;
  let currentPhaseIdx = 0;

  function frame(timestamp) {
    if (!startTime) startTime = timestamp;
    let elapsed = timestamp - startTime;

    // Use a while loop to ensure we don't skip phases if frames are dropped
    while (currentPhaseIdx < phases.length) {
      const phase = phases[currentPhaseIdx];
      let phaseElapsed = elapsed;
      for (let i = 0; i < currentPhaseIdx; i++) {
        phaseElapsed -= phases[i].duration;
      }

      if (phaseElapsed < phase.duration) {
        // We're still in this phase
        renderFrame(phase, phaseElapsed);
        onFrame();
        requestAnimationFrame(frame);
        return;
      }

      // Phase complete: update the cumulative background
      if (phase.name === 'fill') {
        fillColorRegions(offCtx, regions, phase.colorIdx, palette, width, height, 1.0);
      }
      currentPhaseIdx++;
    }

    // Animation finished
    onComplete();
  }

  function renderFrame(phase, phaseElapsed) {
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(offCanvas, 0, 0);

    if (phase.name === 'fill') {
      const progress = phaseElapsed / phase.duration;
      fillColorRegions(ctx, regions, phase.colorIdx, palette, width, height, progress);
    }

    drawOutlines(ctx, edges, width, height);
    drawNumbers(ctx, regions, regionCenters);
  }

  requestAnimationFrame(frame);
}

function drawOutlines(ctx, edges, width, height) {
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  // Using a sparse loop for better performance at high resolution
  for (let i = 0; i < edges.length; i++) {
    if (edges[i]) {
      const x = i % width;
      const y = Math.floor(i / width);
      ctx.moveTo(x, y);
      ctx.lineTo(x + 1, y + 1);
    }
  }
  ctx.stroke();
}

function drawNumbers(ctx, regions, centers) {
  ctx.fillStyle = '#999';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  regions.forEach((region, i) => {
    // Only draw numbers for substantial regions
    if (region.pixels.length > 200) {
      const center = centers[i];
      ctx.fillText(region.colorIndex + 1, center.x, center.y);
    }
  });
}

function fillColorRegions(ctx, regions, colorIdx, palette, width, height, progress) {
  const color = palette[colorIdx];
  const targetRegions = regions.filter(r => r.colorIndex === colorIdx);
  if (targetRegions.length === 0) return;

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  targetRegions.forEach(region => {
    const pixelsToFill = Math.floor(region.pixels.length * progress);
    for (let i = 0; i < pixelsToFill; i++) {
      const p = region.pixels[i];
      const offset = p * 4;
      data[offset] = color[0];
      data[offset + 1] = color[1];
      data[offset + 2] = color[2];
      data[offset + 3] = 255;
    }
  });

  ctx.putImageData(imgData, 0, 0);
}

function findVisualCenter(region, width, height) {
  let sumX = 0, sumY = 0;
  for (const p of region.pixels) {
    sumX += p % width;
    sumY += Math.floor(p / width);
  }
  return { x: sumX / region.pixels.length, y: sumY / region.pixels.length };
}

export async function recordCanvas(canvas, triggerComplete) {
  return new Promise((resolve) => {
    const stream = canvas.captureStream(30);
    const mimeTypes = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=h264', 'video/webm'];
    const mimeType = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm';

    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8000000 });
    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      resolve({ blob, mimeType });
    };

    recorder.start();
    triggerComplete(() => recorder.stop());
  });
}
