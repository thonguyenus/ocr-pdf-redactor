export function preprocessForOcr(src: HTMLCanvasElement): HTMLCanvasElement {
  const width = src.width;
  const height = src.height;
  const out = document.createElement('canvas');
  out.width = width;
  out.height = height;
  const srcCtx = src.getContext('2d', { willReadFrequently: true } as CanvasRenderingContext2DSettings) as CanvasRenderingContext2D | null;
  const dstCtx = out.getContext('2d') as CanvasRenderingContext2D | null;
  if (!srcCtx || !dstCtx) return src;
  const img = srcCtx.getImageData(0, 0, width, height);
  const data = img.data;
  let min = 255;
  let max = 0;
  for (let p = 0; p < data.length; p += 4) {
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    const y = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    if (y < min) min = y;
    if (y > max) max = y;
    data[p] = data[p + 1] = data[p + 2] = y;
  }
  const range = Math.max(1, max - min);
  for (let p = 0; p < data.length; p += 4) {
    const y = data[p];
    const y2 = Math.max(0, Math.min(255, Math.round(((y - min) / range) * 255)));
    data[p] = data[p + 1] = data[p + 2] = y2;
  }
  dstCtx.putImageData(img, 0, 0);
  return out;
}


