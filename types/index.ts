export interface Mode {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  active: boolean;
}

export interface CanvasSection {
  id: string;
  title: string;
  placeholder: string;
  value: string;
  isCustom?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  createdAt?: string;
}

export interface Session {
  id: string;
  mode: string;
  title: string;
  status: "active" | "completed";
  canvasContent: Record<string, string>;
  messages: ChatMessage[];
  createdAt: string;
  completedAt: string | null;
}
