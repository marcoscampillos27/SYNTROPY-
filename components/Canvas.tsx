"use client";

import { useState, useEffect, useRef } from "react";
import { CanvasSection as CanvasSectionType } from "@/types";
import CanvasSection from "./CanvasSection";
import ExportButton from "./ExportButton";
import ProcessSummary from "./ProcessSummary";

interface CanvasProps {
  sections: CanvasSectionType[];
  onSectionValueChange: (id: string, value: string) => void;
  onSectionTitleChange: (id: string, title: string) => void;
  onToggle?: () => void;
  sessionTitle?: string;
  sessionDate?: string;
}

function calcInitialVisible(sections: CanvasSectionType[]): number {
  let count = 0;
  for (const s of sections) {
    if (s.value.trim().length > 0) {
      count++;
    } else {
      break;
    }
  }
  return Math.max(Math.min(count + 1, sections.length), 2);
}

export default function Canvas({
  sections,
  onSectionValueChange,
  onSectionTitleChange,
  onToggle,
  sessionTitle = "Sesión",
  sessionDate = new Date().toISOString(),
}: CanvasProps) {
  const [visibleCount, setVisibleCount] = useState(() =>
    calcInitialVisible(sections)
  );
  const [showSummary, setShowSummary] = useState(false);
  const prevVisibleCount = useRef(visibleCount);

  const sessionKey = sections.map((s) => s.id).join(",");
  const prevSessionKey = useRef(sessionKey);
  useEffect(() => {
    if (prevSessionKey.current !== sessionKey) {
      prevSessionKey.current = sessionKey;
      const newCount = calcInitialVisible(sections);
      setVisibleCount(newCount);
      prevVisibleCount.current = newCount;
    }
  }, [sessionKey, sections]);

  useEffect(() => {
    if (visibleCount >= sections.length) return;
    const lastVisible = sections[visibleCount - 1];
    if (lastVisible && lastVisible.value.trim().length > 0) {
      setVisibleCount((prev) => Math.min(prev + 1, sections.length));
    }
  }, [sections, visibleCount]);

  const isNewlyVisible = (index: number) => {
    return index >= prevVisibleCount.current && index < visibleCount;
  };

  useEffect(() => {
    prevVisibleCount.current = visibleCount;
  });

  const visibleSections = sections.slice(0, visibleCount);
  const allVisible = visibleCount >= sections.length;

  // Show "Ver mi proceso" only when at least 2 sections have content
  const filledCount = sections.filter((s) => s.value.trim().length > 0).length;
  const showProcessButton = filledCount >= 2;

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[var(--bg-page)]">
      {/* Header */}
      <div className="flex items-center justify-between px-[36px] pb-[12px] pt-[24px]">
        <div className="flex items-center gap-[8px]">
          <span className="block h-[8px] w-[8px] rounded-full bg-[var(--accent-green)]" />
          <span className="text-[13px] font-medium text-[var(--text-secondary)]">
            Decidir
          </span>
        </div>
        <div className="flex items-center gap-[12px]">
          {showProcessButton && (
            <button
              onClick={() => setShowSummary(true)}
              className="cursor-pointer rounded-[8px] border border-[var(--border-light)] bg-transparent px-[14px] py-[6px] text-[12px] font-medium text-[var(--text-secondary)] transition-colors duration-150 hover:bg-[var(--bg-page)]"
            >
              Ver mi proceso
            </button>
          )}
          <ExportButton title={sessionTitle} sections={sections} />
          {onToggle && (
            <button
              onClick={onToggle}
              title="Ocultar lienzo"
              aria-label="Ocultar lienzo"
              className="flex h-[24px] w-[24px] cursor-pointer items-center justify-center rounded-[6px] border-none bg-transparent text-[14px] text-[var(--text-faint)] transition-colors duration-150 hover:bg-[var(--bg-sidebar)] hover:text-[var(--text-secondary)]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Paper sheet */}
      <div className="mx-auto mb-[32px] w-full max-w-[720px] px-[24px]">
        <div
          className="rounded-[8px] bg-white px-[40px] py-[36px]"
          style={{
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)",
          }}
        >
          {visibleSections.map((section, index) => (
            <div
              key={section.id}
              className={`${index < visibleSections.length - 1 ? "mb-[28px]" : ""} ${isNewlyVisible(index) ? "animate-section-appear" : ""}`}
            >
              <CanvasSection
                section={section}
                isLast={index === visibleSections.length - 1 && !allVisible}
                onValueChange={onSectionValueChange}
                onTitleChange={onSectionTitleChange}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Process summary modal */}
      {showSummary && (
        <ProcessSummary
          sections={sections}
          sessionDate={sessionDate}
          onClose={() => setShowSummary(false)}
        />
      )}
    </div>
  );
}
