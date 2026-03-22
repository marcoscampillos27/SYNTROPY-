"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Session } from "@/types";
import { getSessions, deleteSession, renameSession } from "@/lib/storage";
import SessionItem from "./SessionItem";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  currentSessionId?: string | null;
  onNewSession?: (deletedSessionId?: string) => void;
}

function groupSessionsByDate(
  sessions: Session[]
): { label: string; sessions: Session[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const groups: Record<string, Session[]> = {
    Hoy: [],
    Ayer: [],
    "Esta semana": [],
    "Este mes": [],
    Anteriores: [],
  };

  sessions.forEach((s) => {
    const date = new Date(s.createdAt);
    if (date >= today) {
      groups["Hoy"].push(s);
    } else if (date >= yesterday) {
      groups["Ayer"].push(s);
    } else if (date >= weekAgo) {
      groups["Esta semana"].push(s);
    } else if (date >= monthStart) {
      groups["Este mes"].push(s);
    } else {
      groups["Anteriores"].push(s);
    }
  });

  return Object.entries(groups)
    .filter(([, sessions]) => sessions.length > 0)
    .map(([label, sessions]) => ({ label, sessions }));
}

export default function Sidebar({
  isOpen,
  onClose,
  isMobile,
  currentSessionId,
  onNewSession,
}: SidebarProps) {
  const router = useRouter();
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const sessions = getSessions().sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setAllSessions(sessions);
  }, [currentSessionId]);

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return allSessions;
    const q = searchQuery.toLowerCase();
    return allSessions.filter((s) => s.title.toLowerCase().includes(q));
  }, [allSessions, searchQuery]);

  const sessionGroups = useMemo(
    () => groupSessionsByDate(filteredSessions),
    [filteredSessions]
  );

  const handleSessionClick = (sessionId: string) => {
    if (sessionId === currentSessionId) return;
    router.push(`/session?id=${sessionId}`);
    if (isMobile) onClose();
  };

  const refreshSessions = () => {
    const sessions = getSessions().sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setAllSessions(sessions);
  };

  const handleDelete = (id: string) => {
    deleteSession(id);
    refreshSessions();
    if (id === currentSessionId && onNewSession) {
      onNewSession(id);
    }
  };

  const handleRename = (id: string, title: string) => {
    renameSession(id, title);
    refreshSessions();
  };

  const sidebarContent = (
    <div className="flex h-full w-[240px] flex-col bg-[var(--bg-sidebar)]">
      <div className="flex items-center justify-between px-[12px] pt-[20px]">
        <span
          className="text-[15px] font-semibold text-[var(--text-primary)]"
          style={{ letterSpacing: "-0.3px" }}
        >
          Syntropy
        </span>
        <button
          onClick={onClose}
          aria-label="Cerrar sidebar"
          title="Cerrar sidebar"
          className="cursor-pointer border-none bg-transparent text-[18px] text-[var(--text-muted)] transition-colors duration-150 hover:text-[var(--text-secondary)]"
        >
          ✕
        </button>
      </div>

      <div className="flex gap-[8px] px-[12px] pt-[16px]">
        <button
          onClick={() => {
            if (onNewSession) {
              onNewSession();
            } else {
              router.push("/");
            }
            if (isMobile) onClose();
          }}
          className="flex-1 cursor-pointer rounded-[10px] bg-[var(--btn-primary)] px-[14px] py-[10px] text-center text-[13px] font-medium text-white transition-all duration-150 hover:bg-[var(--btn-primary-hover)]"
        >
          + Nueva sesión
        </button>
        <button
          onClick={() => {
            router.push("/");
            if (isMobile) onClose();
          }}
          className="shrink-0 cursor-pointer rounded-[10px] border border-[var(--border)] bg-transparent px-[12px] py-[10px] text-[12px] font-medium text-[var(--text-secondary)] transition-all duration-150 hover:bg-[var(--bg-page)]"
        >
          Modos
        </button>
      </div>

      {/* Search */}
      <div className="px-[12px] pt-[12px]">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar sesiones..."
          className="w-full rounded-[8px] border border-[var(--border-light)] bg-[var(--bg-canvas)] px-[10px] py-[7px] text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none transition-colors duration-150 focus:border-[var(--border)]"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-[12px] pt-[8px]">
        {sessionGroups.map((group) => (
          <div key={group.label}>
            <div
              className="px-[8px] pb-[6px] pt-[12px] text-[11px] font-medium uppercase text-[var(--text-faint)]"
              style={{ letterSpacing: "0.5px" }}
            >
              {group.label}
            </div>
            {group.sessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                isActive={session.id === currentSessionId}
                onClick={() => handleSessionClick(session.id)}
                onDelete={handleDelete}
                onRename={handleRename}
              />
            ))}
          </div>
        ))}
        {sessionGroups.length === 0 && allSessions.length > 0 && (
          <div className="px-[8px] pt-[20px] text-center text-[12px] text-[var(--text-faint)]">
            Sin resultados para &ldquo;{searchQuery}&rdquo;
          </div>
        )}
        {allSessions.length === 0 && (
          <div className="flex flex-col items-center gap-[8px] px-[8px] pt-[32px] text-center">
            <span className="text-[24px] opacity-30">◇</span>
            <span className="text-[12px] text-[var(--text-faint)]">
              Aún no hay sesiones
            </span>
            <span className="text-[11px] leading-[1.4] text-[var(--text-faint)] opacity-70">
              Pulsa &ldquo;Nueva sesión&rdquo; para empezar
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-40 flex" onClick={onClose}>
        <div className="animate-fade-in absolute inset-0 bg-black/25" />
        <div
          className="animate-slide-in-left relative h-full"
          onClick={(e) => e.stopPropagation()}
        >
          {sidebarContent}
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full shrink-0 overflow-hidden border-r border-[var(--border-light)] transition-all duration-[250ms] ease-in-out"
      style={{ width: isOpen ? 240 : 0 }}
    >
      {sidebarContent}
    </div>
  );
}
