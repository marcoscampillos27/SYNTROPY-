"use client";

import { ChatMessage as ChatMessageType } from "@/types";

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className="animate-fade-in-up max-w-[85%] whitespace-pre-wrap px-[16px] py-[12px] text-[14px] leading-[1.65] text-[var(--text-primary)]"
      style={{
        alignSelf: isAssistant ? "flex-start" : "flex-end",
        backgroundColor: isAssistant
          ? "var(--bg-assistant)"
          : "var(--bg-surface)",
        borderRadius: isAssistant
          ? "16px 16px 16px 4px"
          : "16px 16px 4px 16px",
        border: isAssistant ? "none" : "1px solid var(--border)",
      }}
    >
      {message.content}
    </div>
  );
}
