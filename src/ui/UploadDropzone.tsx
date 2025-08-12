import React, { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';

const DropArea = styled.div<{ $drag?: boolean }>`
  border: 2px dashed ${({ theme }) => (theme as any).colors.primary};
  border-radius: 12px;
  background: ${({ theme }) => (theme as any).colors.panelBg};
  color: ${({ theme }) => (theme as any).colors.text};
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease;
  ${(p) => p.$drag ? `background: #FFF1F2; border-color: ${(p.theme as any).colors.primary};` : ''}
`;

const Hint = styled.div`
  color: ${({ theme }) => (theme as any).colors.muted};
  font-size: 12px;
  margin-top: 6px;
`;

const HiddenInput = styled.input`
  display: none;
`;

export type UploadDropzoneProps = {
  onSelect: (file: File) => void;
  fileName?: string | null;
};

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onSelect, fileName }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Vui lòng chọn file PDF');
        return;
      }
      onSelect(file);
    }
  }, [onSelect]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Vui lòng thả file PDF');
        return;
      }
      onSelect(file);
    }
  }, [onSelect]);

  return (
    <>
      <DropArea
        $drag={isDragging}
        onClick={openPicker}
        onDragOver={onDragOver}
        onDragEnter={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div><strong>Drag & drop</strong> a PDF here, or <strong>click to choose</strong>.</div>
        <Hint>Only scanned PDFs (images) are supported. {fileName ? `Selected: ${fileName}` : ''}</Hint>
      </DropArea>
      <HiddenInput ref={inputRef} type="file" accept="application/pdf" onChange={onInputChange} />
    </>
  );
};


