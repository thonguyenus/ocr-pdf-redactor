import type { OcrField } from "../types";

export async function recognizeWithGcv(
  canvas: HTMLCanvasElement
): Promise<OcrField[]> {
  const apiKey = "";
  if (!apiKey) {
    throw new Error("Missing VITE_GCV_API_KEY");
  }
  const pageIndex = 0;
  const dataUrl = canvas.toDataURL("image/png");
  const content = dataUrl.split(",")[1];
  const body = {
    requests: [
      {
        image: { content },
        features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
        imageContext: { languageHints: ["en"] },
      },
    ],
  };
  const resp = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(
      apiKey
    )}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!resp.ok) throw new Error(`GCV HTTP ${resp.status}`);
  const json = await resp.json();
  const res = json.responses?.[0];
  const annotation = res?.fullTextAnnotation;
  const out: OcrField[] = [];
  if (!annotation?.pages) return out;
  for (const p of annotation.pages as any[]) {
    for (const block of p.blocks ?? []) {
      for (const para of block.paragraphs ?? []) {
        const words = para.words ?? [];
        const text = words
          .map((w: any) =>
            (w.symbols ?? []).map((s: any) => s.text || "").join("")
          )
          .join(" ")
          .trim();
        if (!text) continue;
        const poly = para.boundingBox?.vertices ?? [];
        const xs = poly.map((v: any) => v.x || 0);
        const ys = poly.map((v: any) => v.y || 0);
        const x0 = Math.min(...xs),
          x1 = Math.max(...xs);
        const y0 = Math.min(...ys),
          y1 = Math.max(...ys);
        out.push({
          id: `${pageIndex}-${x0}-${y0}-${x1}-${y1}-${Math.random()
            .toString(36)
            .slice(2)}`,
          label: `Page ${pageIndex + 1}`,
          value: text,
          pageIndex,
          bbox: { x0, y0, x1, y1 },
        });
      }
    }
  }
  return out;
}
