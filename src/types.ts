export type BBox = { x0: number; y0: number; x1: number; y1: number };

export type OcrField = {
  id: string;
  label: string;
  value: string;
  pageIndex: number;
  bbox: BBox | null;
};


