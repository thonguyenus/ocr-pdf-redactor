import { useEffect, useRef, useState } from 'react';
import { getDocument, PDFDocumentProxy } from 'pdfjs-dist';

export function usePdfRenderer(pdfFile: File | null) {
  const [pdfProxy, setPdfProxy] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [canvases, setCanvases] = useState<HTMLCanvasElement[]>([]);
  const [isRendering, setIsRendering] = useState(false);
  const [renderDone, setRenderDone] = useState(0);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!pdfFile) return;
      setPdfProxy(null);
      setCanvases([]);
      setIsRendering(true);
      setRenderDone(0);
      setRenderError(null);
      try {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const loadingTask = getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        setPdfProxy(pdf);
        setNumPages(pdf.numPages);
        setRenderDone(0);
        const newCanvases: HTMLCanvasElement[] = [];
        for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
          const page = await pdf.getPage(pageIndex);
          const viewport = page.getViewport({ scale: 1.0 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) continue;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const renderContext = { canvasContext: context, viewport } as any;
          await page.render(renderContext).promise;
          newCanvases.push(canvas);
          setRenderDone(prev => prev + 1);
        }
        if (!cancelled) setCanvases(newCanvases);
      } catch (e) {
        console.error('PDF render error', e);
        if (!cancelled) setRenderError('Không thể đọc/hiển thị PDF. Vui lòng thử lại file khác.');
      } finally {
        if (!cancelled) setIsRendering(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [pdfFile]);

  return { pdfProxy, numPages, canvases, isRendering, renderDone, renderError };
}


