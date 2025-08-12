import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { setupPdfJsWorker } from '../lib/pdfWorker';
import { usePdfRenderer } from '../pdf/usePdfRenderer';
import { preprocessForOcr } from '../lib/image';
import { recognizeWithTesseract } from '../ocr/tesseract';
import { recognizeWithGcv } from '../ocr/gcv';
import { exportRedactedPdf } from '../pdf/exportRedacted';
import type { OcrField } from '../types';

const GlobalStyle = createGlobalStyle`
  * { box-sizing: border-box; }
  html, body, #root { height: 100%; margin: 0; }
  body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, Apple Color Emoji, Segoe UI Emoji; color: ${({ theme }) => (theme as any).colors.text}; background: ${({ theme }) => (theme as any).colors.bg}; }
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 16px;
  height: 100%;
  padding: 16px;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Panel = styled.div`
  background: ${({ theme }) => (theme as any).colors.panelBg};
  border: 1px solid ${({ theme }) => (theme as any).colors.border};
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
`;

const FileInput = styled.input`
  width: 100%;
`;

const ProgressWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => (theme as any).colors.border};
  border-radius: 999px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${p => Math.max(0, Math.min(100, p.$pct)).toFixed(1)}%;
  background: ${({ theme }) => (theme as any).colors.primary};
  transition: width 160ms ease;
`;

import { Controls } from './Controls';
import { FieldsList } from './FieldsList';
import { PdfViewer } from './PdfViewer';
import { UploadDropzone } from './UploadDropzone';

export const App: React.FC = () => {
  useEffect(() => { setupPdfJsWorker(); }, []);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const { pdfProxy, numPages, canvases, isRendering, renderDone, renderError } = usePdfRenderer(pdfFile);
  const overlayRefs = useRef<HTMLCanvasElement[]>([]);
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [ocrFields, setOcrFields] = useState<OcrField[]>([]);
  const [selectedFieldIds, setSelectedFieldIds] = useState<Set<string>>(new Set());
  const [ocrEngine, setOcrEngine] = useState<'tesseract' | 'gcv'>('tesseract');
  

  // Handle file upload
  const onFileChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0] ?? null;
    if (!file) return;
    setPdfFile(file);
  }, []);

  // reset overlays on new file
  useEffect(() => { overlayRefs.current = []; }, [pdfFile]);

  // Run OCR on all rendered canvases, one page at a time
  const runOcrTesseract = useCallback(async () => {
    if (!pdfProxy) return;
    let tries = 0; while (canvases.length === 0 && tries < 200) { await new Promise(r => setTimeout(r, 50)); tries += 1; }
    if (!canvases.length) { alert('PDF is not fully rendered yet. Please try again shortly.'); return; }
    setIsOcrRunning(true);
    try {
      const fields: OcrField[] = [];
      for (let i = 0; i < canvases.length; i += 1) {
        const pre = preprocessForOcr(canvases[i]);
        const pageFields = await recognizeWithTesseract(pre);
        pageFields.forEach(f => { f.pageIndex = i; });
        fields.push(...pageFields);
      }
      if (fields.length > 0) {
        console.groupCollapsed('[OCR] Extracted fields');
        console.table(fields.map(f => ({ page: f.pageIndex + 1, x0: Math.round(f.bbox?.x0 ?? 0), y0: Math.round(f.bbox?.y0 ?? 0), x1: Math.round(f.bbox?.x1 ?? 0), y1: Math.round(f.bbox?.y1 ?? 0), text: f.value })));
        console.groupEnd();
      } else { console.warn('[OCR] No fields found'); }
      setOcrFields(fields);
    } catch (e) {
      console.error(e); alert('OCR failed. See console for details.');
    } finally { setIsOcrRunning(false); }
  }, [pdfProxy, canvases]);

  // Google Cloud Vision OCR
  const runOcrGcv = useCallback(async () => {
    if (!pdfProxy) return;
    let tries = 0; while (canvases.length === 0 && tries < 200) { await new Promise(r => setTimeout(r, 50)); tries += 1; }
    if (!canvases.length) { alert('PDF is not fully rendered yet. Please try again shortly.'); return; }
    setIsOcrRunning(true);
    try {
      const fields: OcrField[] = [];
      for (let i = 0; i < canvases.length; i += 1) {
        const pre = preprocessForOcr(canvases[i]);
        const pageFields = await recognizeWithGcv(pre);
        pageFields.forEach(f => { f.pageIndex = i; });
        fields.push(...pageFields);
      }
      console.groupCollapsed('[OCR:GCV] Extracted fields');
      console.table(fields.map(f => ({ page: f.pageIndex + 1, x0: Math.round(f.bbox?.x0 ?? 0), y0: Math.round(f.bbox?.y0 ?? 0), x1: Math.round(f.bbox?.x1 ?? 0), y1: Math.round(f.bbox?.y1 ?? 0), text: f.value })));
      console.groupEnd();
      setOcrFields(fields);
    } catch (e) { console.error('GCV OCR failed', e); alert('Google Vision OCR failed. Please check your API key and access.'); }
    finally { setIsOcrRunning(false); }
  }, [pdfProxy, canvases]);

  const runOcr = useCallback(async () => {
    if (ocrEngine === 'tesseract') return runOcrTesseract();
    return runOcrGcv();
  }, [ocrEngine, runOcrGcv, runOcrTesseract]);

  // Draw overlays for selected fields
  useEffect(() => {
    const overlays = overlayRefs.current;
    if (!overlays || overlays.length === 0) return;
    // clear all overlays
    overlays.forEach(overlay => {
      if (!overlay) return;
      const ctx = overlay.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, overlay.width, overlay.height);
    });
    // draw fields
    for (const field of ocrFields) {
      if (!field.bbox) continue;
      const overlay = overlays[field.pageIndex];
      const ctx = overlay?.getContext('2d');
      if (!overlay || !ctx) continue;
      const isSelected = selectedFieldIds.has(field.id);
      ctx.strokeStyle = isSelected ? '#ef4444' : 'rgba(37,99,235,0.8)';
      ctx.lineWidth = isSelected ? 3 : 1;
      const { x0, y0, x1, y1 } = field.bbox;
      const width = x1 - x0;
      const height = y1 - y0;
      ctx.strokeRect(x0, y0, width, height);
      if (isSelected) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(x0, y0, width, height);
      }
    }
  }, [ocrFields, selectedFieldIds]);

  const onToggleSelect = useCallback((id: string) => {
    setSelectedFieldIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error(e);
      alert('Copy failed');
    }
  }, []);

  // Auto-detect box feature removed by request

  // (Curated fields removed by request)

  const onExport = useCallback(async () => {
    if (!pdfFile || canvases.length === 0) return;
    const selected = ocrFields.filter(f => selectedFieldIds.has(f.id) && f.bbox);
    if (selected.length === 0) { alert('No fields selected to redact.'); return; }
    const blob = await exportRedactedPdf(pdfFile, canvases, selected);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `redacted-${pdfFile.name}`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [pdfFile, canvases, ocrFields, selectedFieldIds]);

  const canRunOcr = !!pdfProxy && !isOcrRunning;
  const hasPdf = !!pdfProxy;

  return (
    <>
      <GlobalStyle />
      <Container>
        <Sidebar>
          <Panel>
            <h3>Upload scanned PDF</h3>
            <UploadDropzone onSelect={(f) => { setPdfFile(f); setOcrFields([]); setSelectedFieldIds(new Set()); }} fileName={pdfFile?.name ?? null} />
            <Controls
              canRunOcr={canRunOcr}
              isOcrRunning={isOcrRunning}
              ocrEngine={ocrEngine}
              setOcrEngine={v => setOcrEngine(v)}
              onRunOcr={() => (ocrEngine === 'tesseract' ? runOcrTesseract() : runOcrGcv())}
              onExport={onExport}
              canExport={!!pdfFile && selectedFieldIds.size > 0}
            />
            {isRendering && (
              <ProgressWrap>
                <div style={{ fontSize: 12, color: '#475569' }}>Rendering PDF: {renderDone}/{numPages}</div>
                <ProgressBar>
                  <ProgressFill $pct={numPages ? (renderDone / numPages) * 100 : 0} />
                </ProgressBar>
              </ProgressWrap>
            )}
          </Panel>

          <Panel>
            <h3>Recognized fields</h3>
            <FieldsList fields={ocrFields} selectedIds={selectedFieldIds} onToggle={onToggleSelect} onCopy={copyToClipboard} />
            {renderError && (<div style={{ color: '#b91c1c', fontSize: 12, marginTop: 8 }}>{renderError}</div>)}
          </Panel>
        </Sidebar>

        <PdfViewer canvases={canvases} overlayRefs={overlayRefs} hasPdf={hasPdf} />
      </Container>
    </>
  );
};


