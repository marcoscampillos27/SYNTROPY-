"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CanvasSection as CanvasSectionType,
  ChatMessage,
  Session,
} from "@/types";
import { decidirTemplate } from "@/lib/canvas-templates";
import {
  getSession,
  saveSession,
} from "@/lib/storage";
import Sidebar from "@/components/Sidebar";
import Canvas from "@/components/Canvas";
import Chat from "@/components/Chat";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

function SessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("id");

  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"canvas" | "chat">("canvas");
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Guardado");
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [canvasOpen, setCanvasOpen] = useState(true);
  const [canvasPercent, setCanvasPercent] = useState(55);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  const [sections, setSections] = useState<CanvasSectionType[]>(
    decidirTemplate.map((t) => ({ ...t, value: "" }))
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Keep refs for saving on session switch
  const currentSessionRef = useRef(currentSession);
  const sectionsRef = useRef(sections);
  const messagesRef = useRef(messages);
  currentSessionRef.current = currentSession;
  sectionsRef.current = sections;
  messagesRef.current = messages;

  // Load session from localStorage
  useEffect(() => {
    // Save previous session immediately before loading new one
    // Only if it still exists in storage (wasn't deleted)
    if (currentSessionRef.current) {
      const prevId = currentSessionRef.current.id;
      const stillExists = getSession(prevId);
      if (stillExists) {
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        const canvasContent: Record<string, string> = {};
        sectionsRef.current.forEach((s) => { canvasContent[s.id] = s.value; });
        const firstSection = sectionsRef.current.find((s) => s.id === "1");
        let title = getSession(currentSessionRef.current.id)?.title ?? currentSessionRef.current.title;
        if (firstSection && firstSection.value.trim()) {
          title = firstSection.value.trim().length > 40
            ? firstSection.value.trim().substring(0, 40) + "..."
            : firstSection.value.trim();
        }
        saveSession({ ...currentSessionRef.current, title, canvasContent, messages: messagesRef.current });
      }
    }

    if (!sessionId) {
      router.push("/");
      return;
    }
    const session = getSession(sessionId);
    if (!session) {
      router.push("/");
      return;
    }
    setCurrentSession(session);
    setMessages(session.messages);

    const loadedSections: CanvasSectionType[] = decidirTemplate.map((t) => ({
      ...t,
      value: session.canvasContent[t.id] ?? "",
    }));

    const templateIds = new Set(decidirTemplate.map((t) => t.id));
    Object.entries(session.canvasContent).forEach(([key, value]) => {
      if (!templateIds.has(key)) {
        loadedSections.push({
          id: key,
          title: key,
          placeholder: "",
          value: value,
          isCustom: true,
        });
      }
    });

    setSections(loadedSections);
  }, [sessionId, router]);

  // Drag resize handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const offsetFromRight = rect.right - e.clientX;
      const percent = (offsetFromRight / rect.width) * 100;
      // Clamp between 25% and 75%
      setCanvasPercent(Math.min(75, Math.max(25, percent)));
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const startDrag = () => {
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const buildCanvasContentForAPI = useCallback((): Record<string, string> => {
    const content: Record<string, string> = {};
    sections.forEach((s) => {
      content[s.title] = s.value;
    });
    return content;
  }, [sections]);

  const persistSession = useCallback(
    (updatedMessages?: ChatMessage[], updatedSections?: CanvasSectionType[]) => {
      if (!currentSession) return;
      const secs = updatedSections ?? sections;
      const canvasContent: Record<string, string> = {};
      secs.forEach((s) => {
        canvasContent[s.id] = s.value;
      });

      const firstSection = secs.find((s) => s.id === "1");
      let title = currentSession.title;
      if (firstSection && firstSection.value.trim()) {
        title =
          firstSection.value.trim().length > 40
            ? firstSection.value.trim().substring(0, 40) + "..."
            : firstSection.value.trim();
      }

      const updated: Session = {
        ...currentSession,
        title,
        canvasContent,
        messages: updatedMessages ?? messages,
      };
      saveSession(updated);
      setCurrentSession(updated);
    },
    [currentSession, sections, messages]
  );

  const debouncedSaveCanvas = useCallback(
    (updatedSections: CanvasSectionType[]) => {
      setSaveStatus("Guardando...");
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        persistSession(undefined, updatedSections);
        setSaveStatus("Guardado");
      }, 3000);
    },
    [persistSession]
  );

  const handleSectionValueChange = (id: string, value: string) => {
    const updated = sections.map((s) =>
      s.id === id ? { ...s, value } : s
    );
    setSections(updated);
    debouncedSaveCanvas(updated);
  };

  const handleSectionTitleChange = (id: string, title: string) => {
    const updated = sections.map((s) =>
      s.id === id ? { ...s, title } : s
    );
    setSections(updated);
    debouncedSaveCanvas(updated);
  };

  const handleSendMessage = useCallback(
    async (content: string) => {
      const userMessage: ChatMessage = {
        id: String(Date.now()),
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      persistSession(updatedMessages);
      setIsLoading(true);

      const apiMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            canvasContent: buildCanvasContentForAPI(),
          }),
        });

        if (response.status === 429) {
          const data = await response.json();
          throw new Error(data.message || "Has alcanzado el límite de mensajes por hoy.");
        }

        if (!response.ok || !response.body) {
          throw new Error("API error");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantText = "";
        const assistantId = String(Date.now() + 1);

        const assistantMsg: ChatMessage = {
          id: assistantId,
          role: "assistant",
          content: "",
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setIsLoading(false);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantText += decoder.decode(value, { stream: true });

          const displayText = assistantText
            .replace("[FIN_SESION]", "")
            .trim();

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: displayText } : m
            )
          );
        }

        const finalDisplayText = assistantText
          .replace("[FIN_SESION]", "")
          .trim();
        const finalMessages = [
          ...updatedMessages,
          { ...assistantMsg, content: finalDisplayText },
        ];
        setMessages(finalMessages);
        persistSession(finalMessages);
      } catch (err) {
        setIsLoading(false);
        const errorMsg: ChatMessage = {
          id: String(Date.now() + 1),
          role: "assistant",
          content:
            err instanceof Error && err.message !== "API error"
              ? err.message
              : "No he podido procesar tu mensaje. Inténtalo de nuevo.",
          createdAt: new Date().toISOString(),
        };
        const errorMessages = [...updatedMessages, errorMsg];
        setMessages(errorMessages);
        persistSession(errorMessages);
      }
    },
    [messages, persistSession, buildCanvasContentForAPI]
  );

  const handleNewSession = (deletedSessionId?: string) => {
    // Cancel any pending debounced save
    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    // Save current session immediately before switching (but not if it was just deleted)
    if (currentSession && currentSession.id !== deletedSessionId) {
      const canvasContent: Record<string, string> = {};
      sections.forEach((s) => { canvasContent[s.id] = s.value; });
      const firstSection = sections.find((s) => s.id === "1");
      // Use localStorage title (may have been renamed via sidebar) as fallback
      let title = getSession(currentSession.id)?.title ?? currentSession.title;
      if (firstSection && firstSection.value.trim()) {
        title = firstSection.value.trim().length > 40
          ? firstSection.value.trim().substring(0, 40) + "..."
          : firstSection.value.trim();
      }
      saveSession({ ...currentSession, title, canvasContent, messages });
    }

    const initialMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "¿Qué decisión necesitas tomar? Escríbela aquí o en la primera sección del lienzo — cuanto más concreta, mejor. Yo no te daré respuestas, pero te haré las preguntas que necesitas para llegar a la tuya.",
      createdAt: new Date().toISOString(),
    };

    const newSession: Session = {
      id: crypto.randomUUID(),
      mode: "decidir",
      title: "Nueva decisión",
      status: "active",
      canvasContent: {},
      messages: [initialMessage],
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    saveSession(newSession);

    // Reset all state in-place
    setCurrentSession(newSession);
    setMessages([initialMessage]);
    setSections(decidirTemplate.map((t) => ({ ...t, value: "" })));
    setSaveStatus("Guardado");
    setIsLoading(false);

    // Update URL without reload
    window.history.pushState(null, "", `/session?id=${newSession.id}`);
  };

  if (!currentSession) {
    return null;
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div className="flex h-screen flex-col">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile
          currentSessionId={sessionId}
          onNewSession={handleNewSession}
        />

        <div className="flex items-center border-b border-[var(--border-light)] bg-[var(--bg-surface)]">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
            title="Abrir menú"
            className="cursor-pointer border-none bg-transparent px-[16px] py-[12px] text-[20px] text-[var(--text-secondary)]"
          >
            ☰
          </button>
          <div className="flex flex-1">
            <button
              onClick={() => setActiveTab("canvas")}
              className="flex-1 cursor-pointer border-none bg-transparent px-[16px] py-[12px] text-[14px] transition-colors duration-150"
              style={{
                fontWeight: activeTab === "canvas" ? 500 : 400,
                color:
                  activeTab === "canvas"
                    ? "var(--text-primary)"
                    : "var(--text-muted)",
                borderBottom:
                  activeTab === "canvas"
                    ? "2px solid var(--accent-green)"
                    : "2px solid transparent",
              }}
            >
              Lienzo
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className="flex-1 cursor-pointer border-none bg-transparent px-[16px] py-[12px] text-[14px] transition-colors duration-150"
              style={{
                fontWeight: activeTab === "chat" ? 500 : 400,
                color:
                  activeTab === "chat"
                    ? "var(--text-primary)"
                    : "var(--text-muted)",
                borderBottom:
                  activeTab === "chat"
                    ? "2px solid var(--accent-green)"
                    : "2px solid transparent",
              }}
            >
              Chat
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === "canvas" ? (
            <Canvas
              sections={sections}
              onSectionValueChange={handleSectionValueChange}
              onSectionTitleChange={handleSectionTitleChange}

              sessionTitle={currentSession.title}
            />
          ) : (
            <Chat
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}

            />
          )}
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="flex h-screen">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={false}
        currentSessionId={sessionId}
        onNewSession={handleNewSession}
      />

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
          title="Abrir menú"
          className="absolute left-[8px] top-[8px] z-10 flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-[8px] border border-[var(--border-light)] bg-[var(--bg-sidebar)] text-[var(--text-secondary)] transition-colors duration-150 hover:text-[var(--text-primary)]"
        >
          ☰
        </button>
      )}

      <div className="flex flex-1 overflow-hidden" ref={containerRef}>
        {/* Chat (left/center) */}
        <div className="relative flex-1 overflow-hidden">
          {!canvasOpen && (
            <button
              onClick={() => setCanvasOpen(true)}
              className="absolute right-[12px] top-[18px] z-10 flex cursor-pointer items-center gap-[6px] rounded-[8px] border border-[var(--border-light)] bg-[var(--bg-canvas)] px-[10px] py-[6px] text-[12px] font-medium text-[var(--text-secondary)] transition-colors duration-150 hover:bg-[var(--bg-sidebar)]"
            >
              Lienzo
            </button>
          )}
          <Chat
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            sidebarOpen={sidebarOpen}
          />
        </div>

        {/* Canvas (right) */}
        {canvasOpen && (
          <>
            {/* Drag handle */}
            <div
              onMouseDown={startDrag}
              className="flex w-[6px] shrink-0 cursor-col-resize items-center justify-center bg-[var(--border-light)] transition-colors duration-150 hover:bg-[var(--border)]"
            >
              <div className="h-[32px] w-[2px] rounded-full bg-[var(--text-faint)] opacity-40" />
            </div>

            <div
              className="overflow-hidden"
              style={{ width: `${canvasPercent}%` }}
            >
              <Canvas
                sections={sections}
                onSectionValueChange={handleSectionValueChange}
                onSectionTitleChange={handleSectionTitleChange}
  
                onToggle={() => setCanvasOpen(false)}
                sessionTitle={currentSession.title}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense>
      <SessionContent />
    </Suspense>
  );
}
