"use client";

import { Session } from "@/types";
import { decidirTemplate } from "@/lib/canvas-templates";

interface SessionArtifactProps {
  session: Session;
  onViewFull: () => void;
  onNewSession: () => void;
}

export default function SessionArtifact({
  session,
  onViewFull,
  onNewSession,
}: SessionArtifactProps) {
  // Get sections with content, in template order
  const filledSections = decidirTemplate
    .map((t) => ({
      id: t.id,
      title: t.title,
      content: session.canvasContent[t.id] ?? "",
    }))
    .filter((s) => s.content.trim().length > 0);

  // Separate "Mi decisión" (id: 11) from the rest
  const mainSections = filledSections.filter((s) => s.id !== "11");
  const decisionSection = filledSections.find((s) => s.id === "11");

  const sessionDate = new Date(session.createdAt).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-[24px]">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onViewFull} />

      {/* Artifact card */}
      <div
        className="relative max-h-[85vh] w-full max-w-[600px] overflow-y-auto rounded-[16px] bg-[var(--bg-surface)] px-[40px] py-[40px]"
        style={{
          boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
        }}
      >
        {/* Header */}
        <h2 className="text-[20px] font-semibold text-[var(--text-primary)]">
          Tu decisión
        </h2>
        <p className="mt-[4px] text-[13px] text-[var(--text-muted)]">
          {sessionDate}
        </p>

        {/* Sections */}
        <div className="mt-[28px]">
          {mainSections.map((section, index) => (
            <div key={section.id}>
              {index > 0 && (
                <div className="my-[20px] h-px bg-[var(--border-light)]" />
              )}
              <p
                className="text-[12px] font-medium uppercase text-[var(--text-muted)]"
                style={{ letterSpacing: "0.5px" }}
              >
                {section.title}
              </p>
              <p className="mt-[8px] whitespace-pre-wrap text-[15px] leading-[1.6] text-[var(--text-primary)]">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Decision section — highlighted */}
        {decisionSection && (
          <div className="mt-[28px] rounded-[12px] bg-[var(--bg-canvas)] px-[20px] py-[20px]">
            <p
              className="text-[12px] font-semibold uppercase text-[var(--accent-green)]"
              style={{ letterSpacing: "0.5px" }}
            >
              MI DECISIÓN
            </p>
            <p className="mt-[8px] whitespace-pre-wrap text-[16px] font-medium leading-[1.6] text-[var(--text-primary)]">
              {decisionSection.content}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-[32px] flex gap-[12px]">
          <button
            onClick={onViewFull}
            className="flex-1 cursor-pointer rounded-[12px] border border-[var(--border)] bg-transparent px-[20px] py-[12px] text-[14px] font-medium text-[var(--text-secondary)] transition-colors duration-150 hover:bg-[var(--bg-page)]"
          >
            Ver sesión completa
          </button>
          <button
            onClick={onNewSession}
            className="flex-1 cursor-pointer rounded-[12px] bg-[var(--btn-primary)] px-[20px] py-[12px] text-[14px] font-medium text-white transition-opacity duration-150 hover:opacity-90"
          >
            Nueva sesión
          </button>
        </div>
      </div>
    </div>
  );
}
