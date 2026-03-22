"use client";

interface ActiveSessionDialogProps {
  isOpen: boolean;
  onContinue: () => void;
  onStartNew: () => void;
}

export default function ActiveSessionDialog({
  isOpen,
  onContinue,
  onStartNew,
}: ActiveSessionDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onContinue}
    >
      <div className="animate-fade-in absolute inset-0 bg-black/25" />
      <div
        className="animate-scale-in relative mx-4 w-full max-w-[360px] rounded-[18px] bg-[var(--bg-surface)] px-[32px] py-[36px] shadow-[0_20px_60px_rgba(0,0,0,0.1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-[12px] text-[16px] font-semibold text-[var(--text-primary)]">
          Sesión abierta
        </h2>
        <p className="mb-[24px] text-[14px] leading-[1.6] text-[var(--text-secondary)]">
          Ya tienes una sesión abierta. ¿Quieres cerrarla y empezar una nueva?
        </p>
        <div className="flex gap-[10px]">
          <button
            onClick={onContinue}
            className="cursor-pointer rounded-[10px] border border-[var(--border)] bg-[var(--bg-page)] px-[20px] py-[10px] text-[13px] font-medium text-[var(--text-secondary)] transition-all duration-150 hover:bg-[var(--bg-sidebar)]"
          >
            Continuar sesión abierta
          </button>
          <button
            onClick={onStartNew}
            className="cursor-pointer rounded-[10px] border-none bg-[var(--btn-primary)] px-[20px] py-[10px] text-[13px] font-medium text-white transition-all duration-150 hover:bg-[var(--btn-primary-hover)]"
          >
            Empezar nueva
          </button>
        </div>
      </div>
    </div>
  );
}
