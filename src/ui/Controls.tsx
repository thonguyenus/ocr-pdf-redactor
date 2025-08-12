import React from 'react';
import styled from 'styled-components';

const ControlsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  align-items: center;
`;

const Button = styled.button`
  background: ${({ theme }) => (theme as any).colors.primary};
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 8px 10px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 1px 1px rgba(0,0,0,0.06);
  &:disabled { opacity: 0.5; cursor: default; }
  &:hover { background: ${({ theme }) => (theme as any).colors.primaryHover}; }
`;

const OutlineButton = styled(Button)`
  background: ${({ theme }) => (theme as any).colors.panelBg};
  color: ${({ theme }) => (theme as any).colors.text};
  border: 1px solid ${({ theme }) => (theme as any).colors.border};
  &:hover { background: ${({ theme }) => (theme as any).colors.panelBg}; }
`;

const EngineSelect = styled.select`
  flex: 1 1 180px;
  min-width: 180px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => (theme as any).colors.border};
`;

// Removed API key input; using env-based key

export type ControlsProps = {
  canRunOcr: boolean;
  isOcrRunning: boolean;
  ocrEngine: 'tesseract' | 'gcv';
  setOcrEngine: (v: 'tesseract' | 'gcv') => void;
  onRunOcr: () => void;
  onExport: () => void;
  canExport: boolean;
};

export const Controls: React.FC<ControlsProps> = ({ canRunOcr, isOcrRunning, ocrEngine, setOcrEngine, onRunOcr, onExport, canExport }) => {
  return (
    <ControlsRow>
      <Button disabled={!canRunOcr} onClick={onRunOcr}>
        {isOcrRunning ? 'Running OCR…' : 'Run OCR'}
      </Button>
      <EngineSelect
        value={ocrEngine}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setOcrEngine(e.target.value as 'tesseract' | 'gcv')}
      >
        <option value="tesseract">Engine: Tesseract (client)</option>
        <option value="gcv">Engine: Google Cloud Vision (server API)</option>
      </EngineSelect>
      <OutlineButton disabled={!canExport} onClick={onExport}>Download redacted PDF</OutlineButton>
    </ControlsRow>
  );
};


