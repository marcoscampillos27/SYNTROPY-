"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { modes } from "@/lib/modes";
import { getActiveSession, saveSession, completeSession } from "@/lib/storage";
import { Session } from "@/types";
import ModeCard from "@/components/ModeCard";
import FakeDoorDialog from "@/components/FakeDoorDialog";
import ActiveSessionDialog from "@/components/ActiveSessionDialog";

export default function Home() {
  const router = useRouter();
  const [dialogMode, setDialogMode] = useState<string | null>(null);
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
            "Describe con tus propias palabras la decisión que necesitas tomar — aquí en el chat o directamente en el lienzo. Yo te acompañaré con preguntas.",
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    saveSession(newSession);
    router.push(`/session?id=${newSession.id}`);
  };

  const handleModeClick = (mode: (typeof modes)[number]) => {
    if (mode.active) {
      const active = getActiveSession();
      if (active) {
        setActiveSessionId(active.id);
        setShowActiveDialog(true);
      } else {
        createNewSession();
      }
    } else {
      console.log("fake_door_click:", mode.id);
      setDialogMode(mode.name);
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
      <div className="animate-fade-in-up mb-10 text-center">
        <h1
          className="text-[28px] font-semibold text-[var(--text-primary)]"
          style={{ letterSpacing: "-0.5px" }}
        >
          Syntropy
        </h1>
        <p className="mt-[8px] text-[15px] font-normal text-[var(--text-secondary)]">
          ¿Qué necesitas pensar hoy?
        </p>
      </div>

      <div className="grid w-full max-w-[660px] grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {modes.map((mode, index) => (
          <div
            key={mode.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <ModeCard
              name={mode.name}
              subtitle={mode.subtitle}
              icon={mode.icon}
              color={mode.color}
              active={mode.active}
              onClick={() => handleModeClick(mode)}
            />
          </div>
        ))}
      </div>

      <FakeDoorDialog
        modeName={dialogMode ?? ""}
        isOpen={dialogMode !== null}
        onClose={() => setDialogMode(null)}
      />

      <ActiveSessionDialog
        isOpen={showActiveDialog}
        onContinue={handleContinueActive}
        onStartNew={handleStartNew}
      />
    </div>
  );
}
