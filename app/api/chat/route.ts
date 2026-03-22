import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { DECIDIR_SYSTEM_PROMPT } from "@/lib/prompts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// In-memory rate limiting per IP
const DAILY_LIMIT = 50;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getRateLimit(ip: string): { allowed: boolean; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now >= entry.resetAt) {
    // New day or first request
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0);
    rateLimitMap.set(ip, { count: 1, resetAt: tomorrow.getTime() });
    return { allowed: true, resetAt: tomorrow.getTime() };
  }

  if (entry.count >= DAILY_LIMIT) {
    return { allowed: false, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, resetAt: entry.resetAt };
}

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now >= entry.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 60 * 60 * 1000);

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const { allowed, resetAt } = getRateLimit(ip);

  if (!allowed) {
    const resetDate = new Date(resetAt);
    const hours = resetDate.getHours().toString().padStart(2, "0");
    const minutes = resetDate.getMinutes().toString().padStart(2, "0");

    return NextResponse.json(
      {
        error: "rate_limit",
        message: `Has alcanzado el límite de mensajes por hoy. Podrás enviar más mensajes mañana a las ${hours}:${minutes}.`,
      },
      { status: 429 }
    );
  }

  const { messages, canvasContent } = await req.json();

  // Build canvas text
  const canvasText = Object.entries(
    canvasContent as Record<string, string>
  )
    .map(([title, content]) => `${title}: ${content || "«vacío»"}`)
    .join("\n");

  // Prepare messages for Claude
  const preparedMessages = [...messages];

  // Append canvas state to the last user message
  if (preparedMessages.length > 0) {
    const lastIndex = preparedMessages.length - 1;
    if (preparedMessages[lastIndex].role === "user") {
      preparedMessages[lastIndex] = {
        ...preparedMessages[lastIndex],
        content:
          preparedMessages[lastIndex].content +
          "\n\n---\n[ESTADO ACTUAL DEL LIENZO]\n" +
          canvasText,
      };
    }
  }

  // Count user messages for progress awareness
  const userMessageCount = preparedMessages.filter(
    (m: { role: string }) => m.role === "user"
  ).length;

  // Count filled canvas sections
  const filledSections = Object.values(
    canvasContent as Record<string, string>
  ).filter((v) => v && v.trim().length > 0).length;
  const totalSections = Object.keys(canvasContent as Record<string, string>).length;

  // Build dynamic system prompt with progress context
  const progressContext = `\n\n[CONTEXTO DE PROGRESO — No menciones estos datos al usuario]\nMensajes del usuario en esta sesión: ${userMessageCount}\nSecciones del lienzo con contenido: ${filledSections} de ${totalSections}`;

  // Limit context if too many messages
  let messagesToSend = preparedMessages;
  if (messagesToSend.length > 30) {
    messagesToSend = [messagesToSend[0], ...messagesToSend.slice(-19)];
  }

  try {
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      temperature: 0.7,
      system: DECIDIR_SYSTEM_PROMPT + progressContext,
      messages: messagesToSend,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch {
    return new Response("Error al procesar el mensaje.", { status: 500 });
  }
}
