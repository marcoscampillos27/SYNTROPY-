"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveSession } from "@/lib/storage";
import { Session, ChatMessage } from "@/types";

export default function NewSessionPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  const handleStart = () => {
    if (text.trim().length < 10) return;

    const initialMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "Ya tienes el punto de partida en el lienzo. Empieza a rellenar lo que tengas claro. Si te atascas en alguna parte, cuéntamelo.",
      createdAt: new Date().toISOString(),
    };

    const titleText = text.trim().length > 40
      ? text.trim().substring(0, 40) + "..."
      : text.trim();

    const newSession: Session = {
      id: crypto.randomUUID(),
      mode: "decidir",
      title: titleText,
      status: "active",
      canvasContent: { "1": text.trim() },
      messages: [initialMessage],
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    saveSession(newSession);
    router.push(`/session?id=${newSession.id}`);
  };

  const isValid = text.trim().length >= 10;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-page)] px-[24px]">
      <div className="w-full max-w-[560px]">
        <h1 className="text-center text-[22px] font-medium text-[var(--text-primary)]">
          ¿Qué decisión llevas días sin tomar?
        </h1>
        <p className="mt-[10px] text-center text-[14px] text-[var(--text-muted)]">
          No tiene que estar perfecta. Escríbela como te salga.
        </p>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            autoResize();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && isValid) {
              e.preventDefault();
              handleStart();
            }
          }}
          placeholder="Ej: No sé si debería dejar mi trabajo para montar algo por mi cuenta..."
          rows={3}
          className="mt-[32px] w-full resize-none rounded-[12px] border border-[var(--border-light)] bg-[var(--bg-surface)] px-[16px] py-[16px] text-[16px] leading-[1.7] text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none transition-colors duration-150 focus:border-[var(--border)]"
        />

        <div className="mt-[20px] flex justify-center">
          <button
            onClick={handleStart}
            disabled={!isValid}
            className="cursor-pointer rounded-[12px] bg-[var(--btn-primary)] px-[32px] py-[14px] text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-40"
          >
            Empezar a pensar
          </button>
        </div>
      </div>
    </div>
  );
}
