import { GlobalWorkerOptions } from 'pdfjs-dist';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker';

export function setupPdfJsWorker() {
  GlobalWorkerOptions.workerPort = new pdfWorker();
}


