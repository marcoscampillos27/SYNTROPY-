"use client";

import { useState, useRef, useEffect } from "react";
import { Session } from "@/types";

interface SessionItemProps {
  session: Session;
  isActive: boolean;
  onClick: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

const modeColors: Record<string, string> = {
  decidir: "var(--accent-green)",
  entender: "var(--accent-blue)",
  resolver: "var(--accent-orange)",
  procesar: "var(--accent-violet)",
  proyectar: "var(--accent-cyan)",
  generar: "var(--accent-pink)",
};

export default function SessionItem({
  session,
  isActive,
  onClick,
  onDelete,
  onRename,
}: SessionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleRenameSubmit = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== session.title) {
      onRename(session.id, trimmed);
    } else {
      setEditTitle(session.title);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-[6px] rounded-[8px] bg-[var(--bg-page)] px-[12px] py-[6px]">
        <span
          className="block h-[7px] w-[7px] shrink-0 rounded-full"
          style={{
            backgroundColor: modeColors[session.mode] ?? "var(--accent-green)",
          }}
        />
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRenameSubmit();
            if (e.key === "Escape") {
              setEditTitle(session.title);
              setIsEditing(false);
            }
          }}
          onBlur={handleRenameSubmit}
          className="min-w-0 flex-1 border-none bg-transparent text-[13px] font-medium text-[var(--text-primary)] outline-none"
        />
      </div>
    );
  }

  return (
    <div
      className="group relative flex w-full items-center gap-[10px] rounded-[8px] px-[12px] py-[10px] transition-colors duration-150 hover:bg-[var(--bg-page)]"
      style={{
        backgroundColor: isActive ? "var(--bg-page)" : "transparent",
      }}
    >
      <button
        onClick={onClick}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-[10px] border-none bg-transparent p-0 text-left"
      >
        <span
          className="block h-[7px] w-[7px] shrink-0 rounded-full"
          style={{
            backgroundColor: modeColors[session.mode] ?? "var(--accent-green)",
          }}
        />
        <span
          className="truncate text-[13px]"
          style={{
            fontWeight: isActive ? 500 : 400,
            color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
          }}
        >
          {session.title}
        </span>
      </button>

      {/* Action buttons — visible on hover */}
      <div className="flex shrink-0 items-center gap-[2px] opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setEditTitle(session.title);
            setIsEditing(true);
          }}
          title="Renombrar"
          aria-label="Renombrar sesión"
          className="flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-[4px] border-none bg-transparent text-[11px] text-[var(--text-faint)] transition-colors duration-150 hover:bg-[var(--bg-sidebar)] hover:text-[var(--text-secondary)]"
        >
          ✎
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowConfirmDelete(true);
          }}
          title="Eliminar"
          aria-label="Eliminar sesión"
          className="flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-[4px] border-none bg-transparent text-[11px] text-[var(--text-faint)] transition-colors duration-150 hover:bg-[var(--bg-sidebar)] hover:text-[var(--text-secondary)]"
        >
          ✕
        </button>
      </div>

      {/* Delete confirmation */}
      {showConfirmDelete && (
        <div className="absolute left-0 right-0 top-0 z-10 flex items-center gap-[6px] rounded-[8px] bg-[var(--bg-surface)] px-[12px] py-[8px] shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
          <span className="flex-1 text-[12px] text-[var(--text-secondary)]">
            ¿Eliminar?
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(session.id);
              setShowConfirmDelete(false);
            }}
            className="cursor-pointer rounded-[6px] border-none bg-[var(--btn-primary)] px-[10px] py-[4px] text-[11px] font-medium text-white transition-all duration-150 hover:bg-[var(--btn-primary-hover)]"
          >
            Sí
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirmDelete(false);
            }}
            className="cursor-pointer rounded-[6px] border border-[var(--border)] bg-transparent px-[10px] py-[4px] text-[11px] text-[var(--text-secondary)] transition-all duration-150 hover:bg-[var(--bg-page)]"
          >
            No
          </button>
        </div>
      )}
    </div>
  );
}
