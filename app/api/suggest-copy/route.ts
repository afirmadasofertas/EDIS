import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Lightweight text-only Gemini call for copy suggestions. Cheap + fast,
// independent of the image generation model.

const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

type Body = {
  niche?: string;
  mode?: "editorial" | "campaign";
  creativeNote?: string;
};

type Suggestions = {
  headlines: string[];
  subheadlines: string[];
  ctas: string[];
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = buildCopyPrompt(body);

  const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            headlines: {
              type: "array",
              items: { type: "string" },
              minItems: 3,
              maxItems: 3,
            },
            subheadlines: {
              type: "array",
              items: { type: "string" },
              minItems: 3,
              maxItems: 3,
            },
            ctas: {
              type: "array",
              items: { type: "string" },
              minItems: 3,
              maxItems: 3,
            },
          },
          required: ["headlines", "subheadlines", "ctas"],
        },
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: `Gemini API ${res.status}: ${text.slice(0, 500)}` },
      { status: 502 }
    );
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  let parsed: Suggestions;
  try {
    parsed = JSON.parse(text) as Suggestions;
  } catch {
    return NextResponse.json(
      { error: "Gemini did not return valid JSON" },
      { status: 502 }
    );
  }

  return NextResponse.json(parsed);
}

function buildCopyPrompt(b: Body): string {
  const niche = b.niche?.trim() || "produto / serviço genérico";
  const modeLabel =
    b.mode === "campaign"
      ? "campanha brasileira de SaaS / produto (poster cinematográfico, urgência, hook)"
      : "editorial premium (magazine, sofisticado, naturalístico)";
  const note = b.creativeNote?.trim();

  return [
    `Você é copywriter sênior brasileiro especializado em direct response e ads para ${modeLabel}.`,
    `Nicho do anúncio: ${niche}.`,
    note ? `Direção criativa adicional: ${note}.` : "",
    "",
    "Gere 3 opções para CADA campo abaixo, em PT-BR, alinhadas ao nicho e ao estilo:",
    "",
    "- headlines: 3 opções de headline curta (máx 8 palavras), scroll-stop, sem clichê de marketeiro, sem emoji, sem aspas dentro do texto.",
    "- subheadlines: 3 opções de subheadline (máx 14 palavras) que reforce o headline com benefício concreto.",
    "- ctas: 3 opções de CTA curto (máx 4 palavras) tipo botão de ação ('Quero entrar', 'Garantir vaga', 'Comprar agora').",
    "",
    "Diferentes ângulos entre as 3 opções: uma direta, uma com curiosidade, uma com escassez/urgência.",
    "Não invente fatos. Não use 'TRANSFORME SUA VIDA' ou clichês similares. Use linguagem natural brasileira.",
    "",
    "Devolva APENAS um JSON válido com chaves headlines, subheadlines, ctas (cada um array de 3 strings).",
  ]
    .filter(Boolean)
    .join("\n");
}
