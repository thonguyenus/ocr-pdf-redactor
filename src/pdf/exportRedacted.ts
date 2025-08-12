import { PDFDocument, rgb } from 'pdf-lib';
import type { OcrField } from '../types';

export async function exportRedactedPdf(originalFile: File, canvases: HTMLCanvasElement[], selectedFields: OcrField[]): Promise<Blob> {
  const pdfBytes = await originalFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const fieldsByPage = new Map<number, OcrField[]>();
  for (const f of selectedFields) {
    if (!f.bbox) continue;
    const arr = fieldsByPage.get(f.pageIndex) ?? [];
    arr.push(f);
    fieldsByPage.set(f.pageIndex, arr);
  }
  for (let pageIndex = 0; pageIndex < pdfDoc.getPageCount(); pageIndex += 1) {
    const page = pdfDoc.getPage(pageIndex);
    const canvas = canvases[pageIndex];
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();
    const scaleX = pageWidth / canvas.width;
    const scaleY = pageHeight / canvas.height;
    const fields = fieldsByPage.get(pageIndex) ?? [];
    for (const field of fields) {
      const { x0, y0, x1, y1 } = field.bbox!;
      const pdfX = x0 * scaleX;
      const pdfW = (x1 - x0) * scaleX;
      const pdfH = (y1 - y0) * scaleY;
      const pdfY = pageHeight - y1 * scaleY;
      page.drawRectangle({ x: pdfX, y: pdfY, width: pdfW, height: pdfH, color: rgb(0, 0, 0) });
    }
  }
  const out = await pdfDoc.save();
  return new Blob([out], { type: 'application/pdf' });
}


