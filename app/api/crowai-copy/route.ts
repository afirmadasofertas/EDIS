import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  formatBannedPhrases,
  formatFewShotBlock,
  formatHookGuide,
  formatVoiceRules,
  HOOKS,
  type HookType,
} from "@/lib/copy-skills";

// Richer copy generator for the CrowAI surface. Returns multi-angle
// hooks + 3 long-form headlines + body copy + CTAs in one shot. Uses the
// same Brazilian black-style skills library as /api/suggest-copy.

const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

type Body = {
  niche: string;
  product: string;
  audience?: string;
  goal?: string;
  tone?: "hard-sell" | "informativo" | "humor" | "premium";
};

type CrowAIResponse = {
  hooks: { angle: string; line: string }[];
  headlines: string[];
  bodyCopy: string;
  ctas: string[];
  oneLiner: string;
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

  if (!body.niche?.trim() || !body.product?.trim()) {
    return NextResponse.json(
      { error: "Niche e product são obrigatórios" },
      { status: 400 }
    );
  }

  const prompt = buildCrowAIPrompt(body);

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
            hooks: {
              type: "array",
              minItems: 5,
              maxItems: 5,
              items: {
                type: "object",
                properties: {
                  angle: { type: "string" },
                  line: { type: "string" },
                },
                required: ["angle", "line"],
              },
            },
            headlines: {
              type: "array",
              items: { type: "string" },
              minItems: 3,
              maxItems: 3,
            },
            bodyCopy: { type: "string" },
            ctas: {
              type: "array",
              items: { type: "string" },
              minItems: 5,
              maxItems: 5,
            },
            oneLiner: { type: "string" },
          },
          required: ["hooks", "headlines", "bodyCopy", "ctas", "oneLiner"],
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
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  let parsed: CrowAIResponse;
  try {
    parsed = JSON.parse(text) as CrowAIResponse;
  } catch {
    return NextResponse.json(
      { error: "Gemini did not return valid JSON" },
      { status: 502 }
    );
  }

  return NextResponse.json(parsed);
}

function buildCrowAIPrompt(b: Body): string {
  const tone =
    b.tone === "hard-sell"
      ? "Hard-sell direto. Pressão real, escassez verificável, urgência. Tom de quem quer fechar agora."
      : b.tone === "informativo"
        ? "Informativo / educacional. Constrói autoridade primeiro, vende depois."
        : b.tone === "humor"
          ? "Com humor brasileiro. Auto-deboche, observação afiada, sem palhaçada."
          : b.tone === "premium"
            ? "Premium / sofisticado. Menos volume, mais peso. Frase curta cortante."
            : "Direct response equilibrado.";

  const audience = b.audience?.trim()
    ? `Persona-alvo: ${b.audience.trim()}.`
    : "Persona-alvo: descubra pelo nicho.";

  const goal = b.goal?.trim()
    ? `Objetivo da copy: ${b.goal.trim()}.`
    : "Objetivo: conversão (compra ou cadastro).";

  const allHooks = (Object.keys(HOOKS) as HookType[])
    .map((k) => formatHookGuide(k))
    .join("\n\n");

  return [
    "Você é copywriter sênior brasileiro de direct response. Top 1% do mercado.",
    "Escreve como Pablo Marçal, Erico Rocha, Wendell Carvalho — direto, pessoal, sem rodeio.",
    "Cada palavra paga aluguel.",
    "",
    `Nicho: ${b.niche.trim()}.`,
    `Produto / serviço: ${b.product.trim()}.`,
    audience,
    goal,
    `Tom: ${tone}`,
    "",
    formatVoiceRules(),
    "",
    formatBannedPhrases(),
    "",
    "Catálogo de hooks disponíveis (use 5 ângulos diferentes na resposta):",
    allHooks,
    "",
    formatFewShotBlock(),
    "",
    "Gere os campos abaixo em PT-BR brasileiro coloquial:",
    "",
    "- hooks: 5 hooks DIFERENTES, cada um com `angle` (qual padrão usou: curiosity / callout / pain / proof / authority / contrarian) e `line` (o hook em si, máx 14 palavras).",
    "- headlines: 3 headlines completas (máx 10 palavras cada) prontas pra anúncio.",
    "- bodyCopy: 1 corpo de anúncio em estrutura PAS (Problem → Agitate → Solve), 80–140 palavras, parágrafos curtos, frases curtas, voz pessoal.",
    "- ctas: 5 CTAs curtos (2–4 palavras), verbo de compromisso real.",
    "- oneLiner: 1 frase única que poderia substituir todo o anúncio se tivesse só 1 chance.",
    "",
    "REGRAS DURAS:",
    "1. ZERO frase da lista PROIBIDO.",
    "2. Cada hook DIFERE em ângulo do anterior — não repita curiosity 5x.",
    "3. Pelo menos 2 elementos concretos (número, prazo, benefício específico, dor real) em cada hook e headline.",
    "4. Sem emoji. Sem CAPS. Sem aspas dentro do texto. Sem reticências dramáticas.",
    "5. Se faltar contexto, prefira o conservador antes de inventar fato.",
    "",
    "Devolva APENAS o JSON com hooks, headlines, bodyCopy, ctas, oneLiner.",
  ].join("\n");
}
