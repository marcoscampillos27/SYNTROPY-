"use client";

interface FakeDoorDialogProps {
  modeName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function FakeDoorDialog({
  modeName,
  isOpen,
  onClose,
}: FakeDoorDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="animate-fade-in absolute inset-0 bg-black/25" />
      <div
        className="animate-scale-in relative mx-4 w-full max-w-[360px] rounded-[18px] bg-[var(--bg-surface)] px-[32px] py-[36px] shadow-[0_20px_60px_rgba(0,0,0,0.1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-[12px] text-[16px] font-semibold text-[var(--text-primary)]">
          {modeName}
        </h2>
        <p className="mb-[24px] text-[14px] leading-[1.6] text-[var(--text-secondary)]">
          Este modo estará disponible pronto. Tu interés nos ayuda a decidir
          cuál construir primero.
        </p>
        <button
          onClick={onClose}
          className="cursor-pointer rounded-[10px] bg-[var(--btn-primary)] px-[28px] py-[10px] text-[13px] font-medium text-white transition-all duration-150 ease-in-out hover:bg-[var(--btn-primary-hover)]"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
