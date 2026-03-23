"use client";

import { useRouter } from "next/navigation";
import { getActiveSession, saveSession, completeSession } from "@/lib/storage";
import { Session } from "@/types";
import { useState } from "react";
import ActiveSessionDialog from "@/components/ActiveSessionDialog";

export default function Home() {
  const router = useRouter();
  const [showActiveDialog, setShowActiveDialog] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const createNewSession = () => {
    const newSession: Session = {
      id: crypto.randomUUID(),
      mode: "decidir",
      title: "Nueva decisión",
      status: "active",
      canvasContent: {},
      messages: [
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "¿Con qué parte necesitas ayuda? Puedo ayudarte a pensar sobre cualquier sección del lienzo.",
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    saveSession(newSession);
    router.push(`/session?id=${newSession.id}`);
  };

  const handleStart = () => {
    const active = getActiveSession();
    if (active) {
      setActiveSessionId(active.id);
      setShowActiveDialog(true);
    } else {
      createNewSession();
    }
  };

  const handleContinueActive = () => {
    setShowActiveDialog(false);
    if (activeSessionId) {
      router.push(`/session?id=${activeSessionId}`);
    }
  };

  const handleStartNew = () => {
    setShowActiveDialog(false);
    if (activeSessionId) {
      completeSession(activeSessionId);
    }
    createNewSession();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="animate-fade-in-up text-center">
        <h1
          className="text-[28px] font-semibold text-[var(--text-primary)]"
          style={{ letterSpacing: "-0.5px" }}
        >
          Syntropy
        </h1>
        <p className="mt-[8px] text-[15px] italic text-[var(--text-secondary)]">
          Piensa por ti mismo
        </p>
      </div>

      <div className="animate-fade-in-up mt-[40px] text-center" style={{ animationDelay: "100ms" }}>
        <p className="text-[20px] font-medium text-[var(--text-primary)]">
          ¿Qué decisión necesitas pensar?
        </p>
        <button
          onClick={handleStart}
          className="mt-[20px] cursor-pointer rounded-[12px] bg-[var(--btn-primary)] px-[36px] py-[14px] text-[15px] font-medium text-white transition-opacity hover:opacity-90"
        >
          Empezar
        </button>
      </div>

      <ActiveSessionDialog
        isOpen={showActiveDialog}
        onContinue={handleContinueActive}
        onStartNew={handleStartNew}
      />
    </div>
  );
}
