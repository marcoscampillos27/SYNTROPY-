"use client";

import { useCallback, useRef } from "react";
import { CanvasSection as CanvasSectionType } from "@/types";

interface CanvasSectionProps {
  section: CanvasSectionType;
  isLast: boolean;
  onValueChange: (id: string, value: string) => void;
  onTitleChange?: (id: string, title: string) => void;
}

export default function CanvasSection({
  section,
  isLast,
  onValueChange,
  onTitleChange,
}: CanvasSectionProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, []);

  return (
    <div>
      {section.isCustom ? (
        <input
          type="text"
          value={section.title}
          onChange={(e) => onTitleChange?.(section.id, e.target.value)}
          className="mb-[8px] w-full border-none bg-transparent text-[14px] font-semibold text-[var(--text-primary)] outline-none"
        />
      ) : (
        <h3 className="mb-[8px] text-[14px] font-semibold text-[var(--text-primary)]">
          {section.title}
        </h3>
      )}
      <textarea
        ref={textareaRef}
        value={section.value}
        placeholder={section.placeholder}
        onChange={(e) => {
          onValueChange(section.id, e.target.value);
          autoResize();
        }}
        rows={1}
        className="w-full resize-none border-none bg-transparent p-[4px_0] text-[16px] font-normal leading-[1.75] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
      />
      {!isLast && (
        <div className="mt-[20px] h-px bg-[var(--border-light)]" />
      )}
    </div>
  );
}
