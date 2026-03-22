import { Session } from "@/types";

const STORAGE_KEY = "syntropy_sessions";

export function getSessions(): Session[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data) as Session[];
  } catch {
    return [];
  }
}

export function getSession(id: string): Session | null {
  const sessions = getSessions();
  return sessions.find((s) => s.id === id) ?? null;
}

export function saveSession(session: Session): void {
  const sessions = getSessions();
  const index = sessions.findIndex((s) => s.id === session.id);
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.push(session);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function getActiveSession(): Session | null {
  const sessions = getSessions();
  return sessions.find((s) => s.status === "active") ?? null;
}

export function completeSession(id: string): void {
  const sessions = getSessions();
  const index = sessions.findIndex((s) => s.id === id);
  if (index >= 0) {
    sessions[index].status = "completed";
    sessions[index].completedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }
}

export function deleteSession(id: string): void {
  const sessions = getSessions().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function renameSession(id: string, title: string): void {
  const sessions = getSessions();
  const index = sessions.findIndex((s) => s.id === id);
  if (index >= 0) {
    sessions[index].title = title;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }
}
