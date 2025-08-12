import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";

const ControlsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  align-items: center;
  height: 120px;
`;

const Button = styled.button`
  background: ${({ theme }) => (theme as any).colors.primary};
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 8px 10px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
  &:hover:not(:disabled) {
    background: ${({ theme }) => (theme as any).colors.primaryHover};
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  }
`;

const OutlineButton = styled(Button)`
  background: ${({ theme }) => (theme as any).colors.panelBg};
  color: ${({ theme }) => (theme as any).colors.text};
  border: 1px solid ${({ theme }) => (theme as any).colors.border};

  &:hover:not(:disabled) {
    background: ${({ theme }) =>
      (theme as any).colors.primaryLight || "#f8f9fa"};
    border-color: ${({ theme }) => (theme as any).colors.primary};
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  flex: 1 1 180px;
  min-width: 180px;
`;

const DropdownButton = styled.button`
  height: 64px;
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => (theme as any).colors.border};
  background: ${({ theme }) => (theme as any).colors.panelBg};
  color: ${({ theme }) => (theme as any).colors.text};
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: ${({ theme }) => (theme as any).colors.primary};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => (theme as any).colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => (theme as any).colors.primary}20;
  }
`;

const DropdownIcon = styled.div<{ isOpen: boolean }>`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  transform: ${({ isOpen }) => (isOpen ? "rotate(180deg)" : "rotate(0deg)")};

  svg {
    width: 12px;
    height: 12px;
    fill: ${({ theme }) => (theme as any).colors.text};
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: ${({ theme }) => (theme as any).colors.panelBg};
  border: 1px solid ${({ theme }) => (theme as any).colors.border};
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  margin-top: 4px;
  overflow: hidden;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
  transform: ${({ isOpen }) =>
    isOpen ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.95)"};
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
`;

const DropdownOption = styled.div<{ isSelected: boolean }>`
  padding: 12px 16px;
  cursor: pointer;
  background: ${({ isSelected, theme }) =>
    isSelected
      ? (theme as any).colors.primaryLight || "#f0f9ff"
      : "transparent"};
  color: ${({ isSelected, theme }) =>
    isSelected ? (theme as any).colors.primary : (theme as any).colors.text};
  font-weight: ${({ isSelected }) => (isSelected ? 600 : 500)};
  transition: all 0.15s ease;
  border-left: 3px solid
    ${({ isSelected, theme }) =>
      isSelected ? (theme as any).colors.primary : "transparent"};

  &:hover {
    background: ${({ theme }) =>
      (theme as any).colors.primaryLight || "#f8f9fa"};
    color: ${({ theme }) => (theme as any).colors.primary};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => (theme as any).colors.border}20;
  }
`;

const EngineLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const EngineTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
`;

const EngineDescription = styled.div`
  font-size: 12px;
  opacity: 0.7;
`;

const engineOptions = [
  {
    value: "tesseract" as const,
    title: "Tesseract",
    description: "Free • Client-side processing",
  },
  {
    value: "gcv" as const,
    title: "Google Cloud Vision",
    description: "Premium • Server API with higher accuracy",
  },
];

export type ControlsProps = {
  canRunOcr: boolean;
  isOcrRunning: boolean;
  ocrEngine: "tesseract" | "gcv";
  setOcrEngine: (v: "tesseract" | "gcv") => void;
  onRunOcr: () => void;
  onExport: () => void;
  canExport: boolean;
};

export const Controls: React.FC<ControlsProps> = ({
  canRunOcr,
  isOcrRunning,
  ocrEngine,
  setOcrEngine,
  onRunOcr,
  onExport,
  canExport,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedEngine = engineOptions.find(
    (option) => option.value === ocrEngine
  );

  const handleEngineSelect = (value: "tesseract" | "gcv") => {
    setOcrEngine(value);
    setIsDropdownOpen(false);
  };

  return (
    <ControlsRow>
      <Button disabled={!canRunOcr} onClick={onRunOcr}>
        {isOcrRunning ? "Running OCR…" : "Run OCR"}
      </Button>

      <DropdownContainer ref={dropdownRef}>
        <DropdownButton
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          type="button"
        >
          <EngineLabel>
            <EngineTitle>{selectedEngine?.title}</EngineTitle>
            <EngineDescription>{selectedEngine?.description}</EngineDescription>
          </EngineLabel>
          <DropdownIcon isOpen={isDropdownOpen}>
            <svg viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </DropdownIcon>
        </DropdownButton>

        <DropdownMenu isOpen={isDropdownOpen}>
          {engineOptions.map((option) => (
            <DropdownOption
              key={option.value}
              isSelected={ocrEngine === option.value}
              onClick={() => handleEngineSelect(option.value)}
            >
              <EngineLabel>
                <EngineTitle>{option.title}</EngineTitle>
                <EngineDescription>{option.description}</EngineDescription>
              </EngineLabel>
            </DropdownOption>
          ))}
        </DropdownMenu>
      </DropdownContainer>

      <OutlineButton disabled={!canExport} onClick={onExport}>
        Download redacted PDF
      </OutlineButton>
    </ControlsRow>
  );
};
