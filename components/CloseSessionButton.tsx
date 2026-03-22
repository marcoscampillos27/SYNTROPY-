"use client";

interface CloseSessionButtonProps {
  onClick: () => void;
}

export default function CloseSessionButton({
  onClick,
}: CloseSessionButtonProps) {
  return (
    <div className="px-[24px] pb-[8px]">
      <button
        onClick={onClick}
        className="w-full cursor-pointer rounded-[10px] border border-[var(--border)] bg-[var(--bg-page)] px-[20px] py-[10px] text-center text-[13px] font-medium text-[var(--text-secondary)] transition-all duration-150 hover:bg-[var(--bg-sidebar)]"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
