import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 5-dimension critique of a generated creative — runs the image through
// gemini-2.5-flash (multimodal text+vision) with a structured rubric.
// Cheap text model, fast turnaround, returns a JSON the UI can render
// as score cards + actionable lists.

// gemini-3-pro-preview handles multimodal (image + text) and gives
// more nuanced critique than 2.5 flash.
const MODEL = "gemini-3-pro-preview";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

type Body = {
  /** Generated image as a data URL or raw base64. */
  imageBase64: string;
  imageMime?: string;
  /** Briefing context to compare the image against. */
  briefing: {
    niche?: string;
    mode?: string;
    creativeNote?: string;
    headline?: string;
    subheadline?: string;
    cta?: string;
    hasSubject?: boolean;
  };
};

type Critique = {
  scores: {
    identity: number;
    realism: number;
    hierarchy: number;
    typography: number;
    brief: number;
  };
  keep: string[];
  fix: string[];
  quickWins: string[];
  verdict: string;
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

  const base64 = body.imageBase64.startsWith("data:")
    ? body.imageBase64.split(",")[1] ?? ""
    : body.imageBase64;
  const mime = body.imageMime ?? "image/png";

  const prompt = buildCritiquePrompt(body.briefing);

  const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: mime, data: base64 } },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            scores: {
              type: "object",
              properties: {
                identity: { type: "number" },
                realism: { type: "number" },
                hierarchy: { type: "number" },
                typography: { type: "number" },
                brief: { type: "number" },
              },
              required: ["identity", "realism", "hierarchy", "typography", "brief"],
            },
            keep: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 4 },
            fix: { type: "array", items: { type: "string" }, minItems: 0, maxItems: 4 },
            quickWins: {
              type: "array",
              items: { type: "string" },
              minItems: 0,
              maxItems: 4,
            },
            verdict: { type: "string" },
          },
          required: ["scores", "keep", "fix", "quickWins", "verdict"],
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
  let parsed: Critique;
  try {
    parsed = JSON.parse(text) as Critique;
  } catch {
    return NextResponse.json(
      { error: "Gemini did not return valid JSON" },
      { status: 502 }
    );
  }

  return NextResponse.json(parsed);
}

function buildCritiquePrompt(b: Body["briefing"]): string {
  const lines: string[] = [
    "Você é diretor de arte sênior avaliando um anúncio recém-gerado por IA.",
    "Avalie a imagem anexada nas 5 dimensões abaixo (escala 0-10) em PT-BR.",
    "Seja honesto e específico — não premie por gentileza.",
    "",
    "Dimensões:",
    "1. identity (0-10): se há foto de sujeito anexada anteriormente, o rosto/produto na imagem mantém identidade fiel? Sem alterar fisionomia, idade, características distintivas? (Se não houver sujeito definido, dê 10.)",
    "2. realism (0-10): parece foto real ou tem AI tells (mão extra, dedos derretidos, pele plástica, olhos estranhos, jóias impossíveis, simetria artificial)?",
    "3. hierarchy (0-10): a leitura visual está clara? Headline lê primeiro? CTA reconhecível como botão? Há respiro?",
    "4. typography (0-10): texto está nítido, sem letras deformadas, sem palavras inventadas/garbled, com spelling correto?",
    "5. brief (0-10): a imagem cumpre o briefing — nicho, mood, paleta, copy explícita?",
    "",
    "Briefing original:",
    `- Nicho: ${b?.niche || "não especificado"}`,
    `- Modo: ${b?.mode || "editorial"}`,
    `- Direção criativa: ${b?.creativeNote || "—"}`,
    `- Headline esperado: "${b?.headline || ""}"`,
    `- Subheadline esperado: "${b?.subheadline || ""}"`,
    `- CTA esperado: "${b?.cta || ""}"`,
    `- Tem foto de sujeito? ${b?.hasSubject ? "sim" : "não"}`,
    "",
    "Devolva JSON:",
    "- scores: { identity, realism, hierarchy, typography, brief } cada um 0-10 inteiro.",
    "- keep: 1-4 bullets do que está funcionando bem (frases curtas, PT-BR).",
    "- fix: 0-4 bullets P0/P1 do que precisa consertar (frases curtas e acionáveis).",
    "- quickWins: 0-4 bullets de tweaks rápidos que dariam impacto desproporcional.",
    "- verdict: 1 frase resumida (máx 18 palavras).",
  ];
  return lines.join("\n");
}
