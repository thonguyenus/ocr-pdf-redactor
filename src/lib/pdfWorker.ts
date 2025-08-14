import { GlobalWorkerOptions } from "pdfjs-dist";

// Tạo sẵn Worker
const pdfWorker = new Worker(
  new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url),
  { type: "module" } // với ESM thì cần type module
);

export function setupPdfJsWorker() {
  GlobalWorkerOptions.workerPort = pdfWorker;
}
