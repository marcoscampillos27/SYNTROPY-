"use client";

import { CanvasSection } from "@/types";

interface ProcessSummaryProps {
  sections: CanvasSection[];
  sessionDate: string;
  onClose: () => void;
}

export default function ProcessSummary({
  sections,
  sessionDate,
  onClose,
}: ProcessSummaryProps) {
  const filledSections = sections.filter((s) => s.value.trim().length > 0);
  const mainSections = filledSections.filter((s) => s.id !== "11");
  const decisionSection = filledSections.find((s) => s.id === "11");

  const formattedDate = new Date(sessionDate).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-[24px]"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Modal */}
      <div
        className="relative max-h-[80vh] w-full max-w-[600px] overflow-y-auto rounded-[18px] bg-[var(--bg-surface)] px-[40px] py-[40px]"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Cerrar resumen"
          className="absolute right-[20px] top-[20px] flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[6px] border-none bg-transparent text-[16px] text-[var(--text-muted)] transition-colors duration-150 hover:text-[var(--text-secondary)]"
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-[20px] font-semibold text-[var(--text-primary)]">
          Tu proceso de decisión
        </h2>
        <p className="mt-[4px] text-[13px] text-[var(--text-muted)]">
          {formattedDate}
        </p>

        {/* Content */}
        <div className="mt-[32px]">
          {mainSections.map((section, index) => (
            <div key={section.id}>
              {index > 0 && (
                <div className="my-[24px] h-px bg-[var(--border-light)]" />
              )}
              <p
                className="mb-[8px] text-[11px] font-semibold uppercase text-[var(--text-muted)]"
                style={{ letterSpacing: "0.8px" }}
              >
                {section.title}
              </p>
              <p className="mb-[24px] whitespace-pre-wrap text-[15px] font-normal leading-[1.65] text-[var(--text-primary)]">
                {section.value}
              </p>
            </div>
          ))}
        </div>

        {/* Decision section — highlighted */}
        {decisionSection ? (
          <div className="mt-[8px] rounded-[12px] bg-[var(--bg-canvas)] px-[20px] py-[20px]">
            <p
              className="mb-[8px] text-[11px] font-semibold uppercase text-[var(--accent-green)]"
              style={{ letterSpacing: "0.8px" }}
            >
              MI DECISIÓN
            </p>
            <p className="whitespace-pre-wrap text-[16px] font-medium leading-[1.65] text-[var(--text-primary)]">
              {decisionSection.value}
            </p>
          </div>
        ) : (
          <p className="mt-[8px] text-center text-[13px] italic text-[var(--text-muted)]">
            Aún no has escrito tu decisión. Tómate tu tiempo.
          </p>
        )}

        {/* Button */}
        <div className="mt-[32px] flex justify-center">
          <button
            onClick={onClose}
            className="cursor-pointer rounded-[10px] bg-[var(--btn-primary)] px-[28px] py-[12px] text-[14px] font-medium text-white transition-opacity duration-150 hover:opacity-90"
          >
            Seguir pensando
          </button>
        </div>
      </div>
    </div>
  );
}
