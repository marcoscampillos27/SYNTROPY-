"use client";

import { useEffect, useRef } from "react";
import { ChatMessage as ChatMessageType } from "@/types";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

interface ChatProps {
  messages: ChatMessageType[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  sidebarOpen?: boolean;
  onClose?: () => void;
}

export default function Chat({
  messages,
  onSendMessage,
  isLoading,
  onClose,
}: ChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex h-full flex-col bg-[var(--bg-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--border-light)] px-[20px] pb-[14px] pt-[18px]">
        <span className="text-[13px] font-medium text-[var(--text-muted)]">
          Chat socrático
        </span>
        {onClose && (
          <button
            onClick={onClose}
            title="Cerrar chat"
            aria-label="Cerrar chat"
            className="flex h-[24px] w-[24px] cursor-pointer items-center justify-center rounded-[6px] border-none bg-transparent text-[14px] text-[var(--text-faint)] transition-colors duration-150 hover:bg-[var(--bg-sidebar)] hover:text-[var(--text-secondary)]"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-[14px] overflow-y-auto px-[20px] py-[20px]">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="animate-fade-in flex items-center gap-[3px] px-[4px] py-[8px] text-[18px] text-[var(--text-faint)]">
            <span className="animate-dot-1">·</span>
            <span className="animate-dot-2">·</span>
            <span className="animate-dot-3">·</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={onSendMessage} disabled={isLoading} />
    </div>
  );
}
