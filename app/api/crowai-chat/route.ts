import { createClient } from "@/lib/supabase/server";
import {
  formatBannedPhrases,
  formatCultureNotes,
  formatFewShotBlock,
  formatVoiceRules,
  HOOKS,
} from "@/lib/copy-skills";

// Streaming chat endpoint for the CrowAI surface. Pipes Gemini's
// streamGenerateContent server-sent chunks straight into the response
// so the UI can render token-by-token. The system prompt loads the
// copy-skills library so every reply stays in the Brazilian black-style
// voice without forcing the user through a form.

// gemini-3-pro-preview is the latest top-tier Gemini text model — best
// copywriting voice + reasoning of the whole family. Slower than flash
// but the quality bump is worth the wait for a chat UX.
const MODEL = "gemini-3-pro-preview";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent`;

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Body = {
  messages: Message[];
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Gemini's chat format: contents = [{ role: "user" | "model", parts: [{text}] }]
  const contents = body.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const upstream = await fetch(`${ENDPOINT}?key=${apiKey}&alt=sse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: {
        temperature: 0.9,
        // Bumped from 2k to 8k — long-form body copy + multi-headline
        // replies were getting truncated mid-paragraph at 2k.
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text();
    return new Response(
      JSON.stringify({
        error: `Gemini ${upstream.status}: ${text.slice(0, 500)}`,
      }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  // Re-stream Gemini's SSE chunks as plain text deltas so the client can
  // append directly without parsing the upstream wire format. We also
  // track whether ANY content arrived — if Gemini finishes with no
  // tokens (safety block, max tokens before any text, etc.) we surface
  // a friendly hint instead of leaving the user staring at "Escrevendo".
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let buffer = "";
      let receivedAny = false;
      let finishReason: string | null = null;
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";
          for (const frame of frames) {
            const line = frame.trim();
            if (!line.startsWith("data:")) continue;
            const jsonText = line.slice(5).trim();
            if (!jsonText || jsonText === "[DONE]") continue;
            try {
              const obj = JSON.parse(jsonText);
              const candidate = obj?.candidates?.[0];
              const parts = candidate?.content?.parts;
              if (Array.isArray(parts)) {
                for (const p of parts) {
                  if (typeof p?.text === "string" && p.text.length > 0) {
                    receivedAny = true;
                    controller.enqueue(encoder.encode(p.text));
                  }
                }
              }
              if (candidate?.finishReason) {
                finishReason = candidate.finishReason;
              }
            } catch {
              // Skip malformed frames silently.
            }
          }
        }

        // Stream ended but Gemini produced zero text — most likely a
        // safety filter or max-tokens-on-thinking. Tell the user.
        if (!receivedAny) {
          const reason = finishReason ?? "unknown";
          const hint =
            reason === "SAFETY"
              ? "(O modelo bloqueou essa resposta por filtro de segurança. Reformula a pergunta.)"
              : reason === "MAX_TOKENS"
                ? "(O modelo gastou o limite pensando antes de escrever. Tenta uma pergunta mais direta.)"
                : `(Sem resposta do modelo · finishReason=${reason}. Tenta de novo ou reformula.)`;
          controller.enqueue(encoder.encode(hint));
        }
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

const HOOK_CATALOG = (Object.keys(HOOKS) as Array<keyof typeof HOOKS>)
  .map((k) => {
    const h = HOOKS[k];
    return `- ${h.name} (${k}): ${h.recipe}`;
  })
  .join("\n");

const SYSTEM_PROMPT = `Você é o CrowAI — copywriter sênior brasileiro de direct response. Top 1% do mercado.

Persona: escreve como Pablo Marçal, Erico Rocha, Wendell Carvalho. Direto, pessoal, sem rodeio. Cada palavra paga aluguel.

Você não é um chatbot genérico. Você é um copywriter conversando. Quando o usuário pedir copy, você gera. Quando perguntar sobre estratégia, você responde com voz de quem já fez. Sem listas longas a menos que peçam.

${formatVoiceRules()}

${formatBannedPhrases()}

${formatCultureNotes()}

Catálogo de hooks que você usa:
${HOOK_CATALOG}

${formatFewShotBlock()}

REGRAS DURAS:
1. ZERO frase da lista PROIBIDO acima. Em qualquer contexto.
2. Sempre PT-BR brasileiro coloquial. Use você, tá, pra. Nada de "está", "para".
3. Quando gerar headline/hook/CTA: precisa ter pelo menos 1 elemento concreto (número, prazo, dor real, benefício específico).
4. Sem emoji a menos que o usuário peça. Sem CAPS. Sem aspas dentro do texto.
5. Resposta curta quando pergunta é curta. Resposta longa só quando pediu copy completa.
6. Se faltar contexto pra escrever bem (não sabe o nicho, persona ou produto), pergunte ANTES de inventar.
7. Quando entregar várias opções, formate em linhas separadas, sem bullets a menos que ajude leitura.
8. Quando explicar uma escolha, seja específico: "esse hook usa pain naming porque..." — não generalidades.

Tom da conversa: você é o cara que entrega o trabalho. Direto, com personalidade, sem firula. Não bajula o usuário, não pede desculpa por escrever forte. Se o que o usuário pediu é genérico, devolve genérico — mas avisa.`;
