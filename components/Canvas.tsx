"use client";

import { CanvasSection as CanvasSectionType } from "@/types";
import CanvasSection from "./CanvasSection";
import ExportButton from "./ExportButton";

interface CanvasProps {
  sections: CanvasSectionType[];
  onSectionValueChange: (id: string, value: string) => void;
  onSectionTitleChange: (id: string, title: string) => void;
  onToggle?: () => void;
  sessionTitle?: string;
}

export default function Canvas({
  sections,
  onSectionValueChange,
  onSectionTitleChange,
  onToggle,
  sessionTitle = "Sesión",
}: CanvasProps) {
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
          {sections.map((section, index) => (
            <div
              key={section.id}
              className={index < sections.length - 1 ? "mb-[28px]" : ""}
            >
              <CanvasSection
                section={section}
                isLast={index === sections.length - 1}
                onValueChange={onSectionValueChange}
                onTitleChange={onSectionTitleChange}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
