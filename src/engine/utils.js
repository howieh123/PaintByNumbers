import { getDominantColors, applyPalette } from './quantizer';

export function downscaleImage(image, maxDim = 400) {
  const canvas = document.createElement('canvas');
  let width = image.width;
  let height = image.height;

  if (width > height) {
    if (width > maxDim) {
      height *= maxDim / width;
      width = maxDim;
    }
  } else {
    if (height > maxDim) {
      width *= maxDim / height;
      height = maxDim;
    }
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, width, height);
  return canvas;
}

export function getPixelData(canvas) {
  const ctx = canvas.getContext('2d');
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

export function processImage(image, maxDim = 1200, colorCount = 6) {
  const canvas = downscaleImage(image, maxDim);
  const pixelData = getPixelData(canvas);
  const palette = getDominantColors(pixelData, colorCount);
  const quantizedData = applyPalette(pixelData, palette);
  
  return {
    canvas,
    palette,
    quantizedData,
    width: canvas.width,
    height: canvas.height
  };
}
