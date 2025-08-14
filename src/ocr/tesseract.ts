import Tesseract from "tesseract.js";
import type { OcrField } from "../types";

export async function recognizeWithTesseract(
  canvas: HTMLCanvasElement
): Promise<OcrField[]> {
  const { data } = await Tesseract.recognize(canvas, "eng", {
    langPath: "https://tessdata.projectnaptha.com/4.0.0",
    tessedit_pageseg_mode: 6,
    preserve_interword_spaces: "1",
    user_defined_dpi: "300",
  } as any);
  const pageIndex = 0;
  const fields: OcrField[] = [];
  const lines = data.lines ?? [];
  for (const line of lines) {
    const text = (line.text || "").trim();
    if (!text) continue;
    const { x0, y0, x1, y1 } = line.bbox as any;
    fields.push({
      id: `${pageIndex}-${x0}-${y0}-${x1}-${y1}-${Math.random()
        .toString(36)
        .slice(2)}`,
      label: `Page ${pageIndex + 1}`,
      value: text,
      pageIndex,
      bbox: { x0, y0, x1, y1 },
    });
  }
  return fields;
}
