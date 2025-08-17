import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const Viewer = styled.div`
  position: relative;
  height: 100%;
  overflow: auto;
  background: ${({ theme }) => (theme as any).colors.viewerBg};
  border: 1px solid ${({ theme }) => (theme as any).colors.border};
  border-radius: 12px;
  padding: 16px;
`;

const CanvasWrap = styled.div`
  position: relative;
  margin: 0 auto 24px;
  width: fit-content;
`;

const Overlay = styled.canvas`
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: auto;
  touch-action: none;
`;

export type PdfViewerProps = {
  canvases: HTMLCanvasElement[];
  overlayRefs: React.MutableRefObject<HTMLCanvasElement[]>;
  hasPdf: boolean;
  onCanvasClick?: (pageIndex: number, x: number, y: number) => void;
};

export const PdfViewer: React.FC<PdfViewerProps> = ({ canvases, overlayRefs, hasPdf, onCanvasClick }) => {
  const hostRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    canvases.forEach((canvas, i) => {
      const host = hostRefs.current[i];
      if (!host) return;
      host.innerHTML = '';
      host.appendChild(canvas);
    });
  }, [canvases]);
  return (
    <Viewer>
      {!hasPdf && <div style={{ padding: 24, color: '#64748b' }}>Tải lên 1 file PDF scan để xem trước tại đây.</div>}
      {canvases.map((c, i) => (
        <CanvasWrap key={i}>
          <div ref={ref => { hostRefs.current[i] = ref; }} style={{ position: 'relative' }} />
          <Overlay
            width={c.width}
            height={c.height}
            ref={ref => { if (ref) overlayRefs.current[i] = ref; }}
            onPointerDown={(ev) => {
              ev.preventDefault();
              if (!onCanvasClick) return;
              const target = ev.currentTarget as HTMLCanvasElement;
              const rect = target.getBoundingClientRect();
              const scaleX = target.width / rect.width;
              const scaleY = target.height / rect.height;
              const x = (ev.clientX - rect.left) * scaleX;
              const y = (ev.clientY - rect.top) * scaleY;
              onCanvasClick(i, x, y);
            }}
            style={{ cursor: 'crosshair' }}
          />
        </CanvasWrap>
      ))}
    </Viewer>
  );
};


