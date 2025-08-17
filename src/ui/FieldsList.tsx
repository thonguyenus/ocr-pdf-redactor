import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import type { OcrField } from '../types';

const FieldItem = styled.div<{ selected?: boolean; active?: boolean }>`
  border: 1px solid ${p => (p.selected ? (p.theme as any).colors.primary : (p.theme as any).colors.border)};
  border-radius: 10px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: ${p => (p.active ? 'rgba(34,197,94,0.10)' : (p.theme as any).colors.panelBg)};
  box-shadow: ${p => (p.active ? '0 0 0 2px rgba(34,197,94,0.35) inset, 0 2px 8px rgba(34,197,94,0.2)' : 'none')};
  transition: box-shadow 200ms ease, background 200ms ease;
`;

const Label = styled.div`
  font-size: 12px;
  color: ${({ theme }) => (theme as any).colors.muted};
`;

const Value = styled.div`
  font-size: 14px;
  color: ${({ theme }) => (theme as any).colors.text};
  word-break: break-word;
`;

const OutlineButton = styled.button`
  background: ${({ theme }) => (theme as any).colors.panelBg};
  color: ${({ theme }) => (theme as any).colors.text};
  border: 1px solid ${({ theme }) => (theme as any).colors.border};
  border-radius: 8px;
  padding: 8px 10px;
  font-weight: 600;
  cursor: pointer;
`;

const Button = styled(OutlineButton)`
  background: ${({ theme }) => (theme as any).colors.primary};
  color: #ffffff;
  border: none;
`;

export type FieldsListProps = {
  fields: OcrField[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onCopy: (text: string) => void;
  activeId?: string | null;
};

export const FieldsList: React.FC<FieldsListProps> = ({ fields, selectedIds, onToggle, onCopy, activeId }) => {
  const listRef = useRef<HTMLDivElement | null>(null);
  const idToRef = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!activeId) return;
    const el = idToRef.current[activeId];
    const container = listRef.current;
    if (el && container) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeId]);

  return (
    <div ref={listRef} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 500, overflow: 'auto' }}>
      {fields.length === 0 && <div>No results yet. Upload a PDF and run OCR.</div>}
      {fields.map(f => (
        <FieldItem
          key={f.id}
          ref={ref => { idToRef.current[f.id] = ref; }}
          selected={selectedIds.has(f.id)}
          active={activeId === f.id}
        >
          <Label>{f.label} • Box {f.bbox ? `${Math.round(f.bbox.x0)},${Math.round(f.bbox.y0)}-${Math.round(f.bbox.x1)},${Math.round(f.bbox.y1)}` : 'N/A'}</Label>
          <Value>{f.value}</Value>
          <div style={{ display: 'flex', gap: 8 }}>
            <OutlineButton onClick={() => onCopy(f.value)}>Copy</OutlineButton>
            <Button onClick={() => onToggle(f.id)}>
              {selectedIds.has(f.id) ? 'Bỏ chọn' : 'Chọn để che'}
            </Button>
          </div>
        </FieldItem>
      ))}
    </div>
  );
};


