import React, { useCallback, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { FiUpload, FiFileText } from "react-icons/fi";

const pulseBorder = keyframes`
  0% { border-color: #d97706; }
  50% { border-color: #facc15; }
  100% { border-color: #d97706; }
`;

const DropArea = styled.div<{ $drag?: boolean }>`
  border: 2px dashed ${({ theme }) => (theme as any).colors.primary};
  border-radius: 12px;
  background: ${({ theme }) => (theme as any).colors.panelBg};
  color: ${({ theme }) => (theme as any).colors.text};
  padding: 28px 20px;
  text-align: center;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease,
    transform 100ms ease;
  ${(p) =>
    p.$drag
      ? `
    background: rgba(255, 241, 242, 0.6);
    animation: ${pulseBorder} 1.2s ease-in-out infinite;
    transform: scale(1.02);
  `
      : ""}
`;

const Hint = styled.div`
  color: ${({ theme }) => (theme as any).colors.muted};
  font-size: 12px;
  margin-top: 6px;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  margin-top: 6px;
  color: red;
  font-size: 12px;
`;

const HiddenInput = styled.input`
  display: none;
`;

export type UploadDropzoneProps = {
  onSelect: (file: File) => void;
  fileName?: string | null;
};

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onSelect,
  fileName,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const openPicker = useCallback(() => {
    setError("");
    inputRef.current?.click();
  }, []);

  const handleFile = useCallback(
    (file?: File) => {
      if (!file) return;
      if (file.type !== "application/pdf") {
        setError("Vui lòng chọn file PDF hợp lệ.");
        return;
      }
      setError("");
      onSelect(file);
    },
    [onSelect]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFile(e.target.files?.[0]);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFile(e.dataTransfer.files?.[0]);
    },
    [handleFile]
  );

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
        {fileName ? (
          <FileInfo>
            <FiFileText size={20} color="#d97706" />
            {fileName}
          </FileInfo>
        ) : (
          <>
            <FiUpload size={28} color="#d97706" />
            <div>
              <strong>Drag & drop</strong> a PDF here, or{" "}
              <strong>click to choose</strong>.
            </div>
            <Hint>Only scanned PDFs (images) are supported.</Hint>
          </>
        )}
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </DropArea>
      <HiddenInput
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={onInputChange}
      />
    </>
  );
};
