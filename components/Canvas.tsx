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
      <div className="flex items-center justify-between px-[36px] pb-[20px] pt-[32px]">
        <div className="flex items-center gap-[8px]">
          <span className="block h-[8px] w-[8px] rounded-full bg-[var(--accent-green)]" />
          <span className="text-[13px] font-medium text-[var(--text-secondary)]">
            Decidir
          </span>
        </div>
        <div className="flex items-center gap-[12px]">
          <ExportButton
            title={sessionTitle}
            sections={sections}
          />
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

      <div className="mx-[24px] mb-[24px] rounded-[12px] bg-white px-[32px] py-[32px] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        {sections.map((section, index) => (
          <div key={section.id} className={index < sections.length - 1 ? "mb-[28px]" : ""}>
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
  );
}
