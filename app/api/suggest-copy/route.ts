import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  formatBannedPhrases,
  formatCultureNotes,
  formatFewShotBlock,
  formatHookGuide,
  formatVoiceRules,
  suggestHookForNiche,
} from "@/lib/copy-skills";

// Lightweight text-only Gemini call for copy suggestions. Cheap + fast,
// independent of the image generation model. Uses the Brazilian black-
// style copywriting skills library so suggestions don't read as AI.

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
  const mode = b.mode ?? "editorial";
  const note = b.creativeNote?.trim();
  const hook = suggestHookForNiche(niche, mode);

  const modeContext =
    mode === "campaign"
      ? "Campanha brasileira de SaaS / infoproduto / ecommerce — direct response, alta conversão, scroll-stop. Tom: persuasivo, urgência real, dor antes do benefício, números concretos. NÃO é institucional, NÃO é editorial polido."
      : "Editorial premium — magazine, sofisticado. Tom mais reservado mas ainda direto. Sem clichê corporativo, sem cara de IA.";

  return [
    "Você é copywriter sênior brasileiro de direct response. Top 1% do mercado.",
    "Escreve como Pablo Marçal, Erico Rocha, Wendell Carvalho — direto, pessoal, sem rodeio.",
    "",
    `Contexto de modo: ${modeContext}`,
    `Nicho do anúncio: ${niche}.`,
    note ? `Direção criativa adicional: ${note}.` : "",
    "",
    formatVoiceRules(),
    "",
    formatBannedPhrases(),
    "",
    formatCultureNotes(),
    "",
    formatHookGuide(hook),
    "",
    formatFewShotBlock(),
    "",
    "Gere 3 opções para CADA campo abaixo, todas em PT-BR brasileiro coloquial:",
    "",
    "- headlines: 3 opções de headline curta (máx 8 palavras), scroll-stop. Use 3 ângulos diferentes entre elas (curiosidade / dor / prova).",
    "- subheadlines: 3 opções (máx 14 palavras) que aprofundem o headline com benefício concreto + número/prazo quando possível.",
    "- ctas: 3 opções de CTA curto (máx 4 palavras), verbo de compromisso ('Garantir vaga', 'Quero entrar', 'Vou começar').",
    "",
    "REGRAS DURAS:",
    "1. ZERO frase da lista PROIBIDO acima.",
    "2. Cada headline tem que ter pelo menos 1 elemento concreto: número, prazo, benefício específico, ou pain point real.",
    "3. Sem emoji. Sem CAPS. Sem aspas dentro do texto.",
    "4. Voz: você fala com UMA pessoa, não com 'pessoal' ou 'galera'.",
    "5. Se não conseguir gerar uma headline boa sem inventar fato, prefira a mais conservadora.",
    "",
    "Devolva APENAS um JSON válido com chaves headlines, subheadlines, ctas (cada um array de 3 strings).",
  ]
    .filter(Boolean)
    .join("\n");
}
