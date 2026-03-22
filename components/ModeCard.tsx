"use client";

interface ModeCardProps {
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  active: boolean;
  onClick: () => void;
}

export default function ModeCard({
  name,
  subtitle,
  icon,
  color,
  active,
  onClick,
}: ModeCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        borderColor: active ? color : "var(--border-light)",
        opacity: active ? 1 : 0.55,
      }}
      className="relative cursor-pointer rounded-[16px] border-[1.5px] bg-[var(--bg-surface)] px-[22px] py-[28px] text-left transition-all duration-150 ease-in-out hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = active
          ? "translateY(-2px)"
          : "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {!active && (
        <span
          className="absolute right-[12px] top-[12px] rounded-[20px] bg-[var(--bg-page)] px-[10px] py-[3px] text-[10px] font-medium text-[var(--text-muted)]"
        >
          Próximamente
        </span>
      )}
      <div
        style={{ color }}
        className="mb-[14px] text-[22px]"
      >
        {icon}
      </div>
      <div className="mb-[4px] text-[16px] font-semibold text-[var(--text-primary)]">
        {name}
      </div>
      <div className="text-[13px] font-normal leading-[1.4] text-[var(--text-secondary)]">
        {subtitle}
      </div>
    </button>
  );
}
