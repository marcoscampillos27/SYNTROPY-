"use client";

import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    resetHeight();
  }, [value]);

  const handleSend = () => {
    if (disabled) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  const hasText = value.trim().length > 0;

  return (
    <div className="border-t border-[var(--border-light)] px-[24px] pb-[20px] pt-[16px]">
      <div className="flex items-end gap-[10px] rounded-[12px] border border-[var(--border-light)] bg-[var(--bg-input)] py-[4px] pl-[16px] pr-[6px]">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Escribe aquí…"
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none border-none bg-transparent py-[10px] text-[14px] leading-[1.5] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none disabled:cursor-not-allowed disabled:opacity-50"
          style={{ maxHeight: "120px" }}
        />
        <button
          onClick={handleSend}
          disabled={disabled}
          aria-label="Enviar mensaje"
          title="Enviar mensaje"
          className="mb-[4px] flex h-[36px] w-[36px] shrink-0 cursor-pointer items-center justify-center rounded-[10px] border-none text-[16px] transition-all duration-150 disabled:cursor-not-allowed"
          style={{
            backgroundColor:
              hasText && !disabled
                ? "var(--btn-primary)"
                : "var(--border-light)",
            color: hasText && !disabled ? "white" : "var(--text-muted)",
          }}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
