import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  DIMENSIONS,
  FRAMING,
  MODE,
  POSITION,
  SYSTEM_DIRECTIVE,
  TEXT_ALIGNMENT,
  TEXT_VERTICAL,
} from "@/app/(dashboard)/editor/_prompt-templates";
import type {
  Alignment,
  Dimensions,
  Framing,
  Mode,
  Position,
  VerticalAlignment,
} from "@/app/(dashboard)/editor/_types";

// Nano Banana = Gemini 2.5 Flash Image. Server-only — never ships the key
// (or any prompt internals) to the browser.

// Nano Banana Pro — the upgraded image model with much stronger identity
// preservation and photorealism than the standard 2.5 flash variant.
const MODEL = "gemini-3-pro-image-preview";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

type ImagePart = { base64: string; mimeType: string | null };
type ReferencePart = ImagePart & { note: string };

type ApiPayload = {
  mode?: Mode;
  niche?: string;
  creative_note?: string;
  subject?: {
    photos_count?: number;
    framing?: Framing;
    position?: Position;
  };
  composition?: { text_alignment?: Alignment; text_vertical?: VerticalAlignment };
  style?: {
    color_palette?: string[];
    dimensions?: Dimensions;
    font_family?: string;
  };
  copy?: { headline?: string; subheadline?: string; cta?: string };
  references?: { note?: string }[];
};

type RequestBody = {
  payload: ApiPayload;
  subjectImages: ImagePart[];
  referenceImages: ReferencePart[];
};

export async function POST(req: Request) {
  // Auth gate — only logged-in users can burn API credits.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500 }
    );
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch (err) {
    return NextResponse.json(
      { error: `Invalid JSON body: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  const prompt = buildPrompt(body.payload);

  type Part =
    | { text: string }
    | { inlineData: { mimeType: string; data: string } };
  const parts: Part[] = [{ text: prompt }];

  for (const photo of body.subjectImages ?? []) {
    if (!photo.base64) continue;
    parts.push({
      inlineData: {
        mimeType: photo.mimeType || "image/jpeg",
        data: photo.base64,
      },
    });
  }

  for (const ref of body.referenceImages ?? []) {
    if (!ref.base64) continue;
    if (ref.note) parts.push({ text: `Inspiration reference (use for mood/composition only, not for content): ${ref.note}` });
    parts.push({
      inlineData: {
        mimeType: ref.mimeType || "image/jpeg",
        data: ref.base64,
      },
    });
  }

  const geminiBody = {
    contents: [{ parts }],
    generationConfig: { responseModalities: ["IMAGE"] },
  };

  const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(geminiBody),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: `Gemini API ${res.status}: ${text.slice(0, 500)}` },
      { status: 502 }
    );
  }

  const data = await res.json();
  type Candidate = {
    content?: { parts?: { inlineData?: { mimeType?: string; data?: string } }[] };
  };
  const candidates = data?.candidates as Candidate[] | undefined;
  const imagePart = candidates?.[0]?.content?.parts?.find((p) => p.inlineData);

  if (!imagePart?.inlineData?.data) {
    return NextResponse.json(
      { error: "Gemini did not return an image" },
      { status: 502 }
    );
  }

  const mime = imagePart.inlineData.mimeType || "image/png";
  const dataUrl = `data:${mime};base64,${imagePart.inlineData.data}`;

  return NextResponse.json({ imageUrl: dataUrl });
}

// Prompt structure follows Google's Nano Banana guide formula:
//   [References] + [Relationship instruction] + [New scenario]
// Blocks are joined with double newlines so the model parses them as
// distinct sections, in roughly the order the guide recommends:
//   System rules → Mode → Reference relationship → Subject → Scene →
//   Look (style/lighting/palette) → Aspect → References → Typography.
function buildPrompt(p: ApiPayload): string {
  const blocks: string[] = [SYSTEM_DIRECTIVE];

  if (p.mode) blocks.push(MODE[p.mode]);

  // Reference relationship — Google calls this out as the single biggest
  // multimodal lever. Tell the model EXACTLY how the attached photo
  // relates to the requested output.
  const subj = p.subject ?? {};
  const photosCount = subj.photos_count ?? 0;
  if (photosCount > 0) {
    blocks.push(
      photosCount === 1
        ? "Using the attached subject photo as ground truth, render the same person in the new scene described below — identical face, identical features. Only the surrounding scene, lighting and styling change."
        : `Using the ${photosCount} attached subject photos as ground truth (different angles or moments of the same person), render that exact person in the new scene described below. Match every facial feature consistently across the composition; only the surrounding scene, lighting and styling change.`
    );
  }

  // Subject framing + position — quantity / gender intentionally omitted:
  // the model already sees them in the attached photo, and forcing the
  // user to pick can fight what the photo actually shows.
  const subjectBits: string[] = [];
  if (subj.framing) subjectBits.push(FRAMING[subj.framing]);
  if (subj.position) subjectBits.push(POSITION[subj.position]);
  if (subjectBits.length) blocks.push(subjectBits.join(" "));

  // Scene / niche / creative direction.
  const sceneBits: string[] = [];
  if (p.niche) sceneBits.push(`Brand context: ${p.niche}.`);
  if (p.creative_note?.trim()) {
    sceneBits.push(`Scene direction: ${p.creative_note.trim()}.`);
  }
  if (sceneBits.length) blocks.push(sceneBits.join(" "));

  // Look: style + lighting + palette + aspect.
  const style = p.style ?? {};
  const lookBits: string[] = [];
  if (Array.isArray(style.color_palette) && style.color_palette.length) {
    lookBits.push(
      `Color palette dominating the frame: ${style.color_palette.join(", ")}.`
    );
  }
  if (style.dimensions) lookBits.push(DIMENSIONS[style.dimensions]);
  if (lookBits.length) blocks.push(lookBits.join(" "));

  // Inspiration references — explicit relationship statement.
  if (p.references?.length) {
    blocks.push(
      "The other attached images are inspiration references for tone, lighting and composition only — never for identity or content."
    );
  }

  // Typography — per-line styling, Google's recommended structured form.
  blocks.push(buildTypographyBlock(p));

  return blocks.join("\n\n");
}

function buildTypographyBlock(p: ApiPayload): string {
  const copy = p.copy ?? {};
  // Empty / missing font means "automatic" — let the model pick one that
  // fits the mode and niche instead of locking to a specific family.
  const explicitFont = p.style?.font_family?.trim();

  type Line = { role: string; text: string; weight: string; scale: string };
  const lines: Line[] = [];
  if (copy.headline) {
    lines.push({
      role: "primary headline",
      text: copy.headline,
      weight: "bold",
      scale: "large, dominant scale",
    });
  }
  if (copy.subheadline) {
    lines.push({
      role: "subheadline",
      text: copy.subheadline,
      weight: "medium-weight",
      scale: "smaller secondary scale",
    });
  }
  if (copy.cta) {
    lines.push({
      role: "CTA button label",
      text: copy.cta,
      weight: "bold",
      scale: "compact, inside a rounded pill button",
    });
  }

  // No copy → forbid any text. Without this Gemini hallucinates a headline
  // from the niche / creative note.
  if (lines.length === 0) {
    return "Render zero text in the image — no headlines, captions, logos, signage, labels, watermarks, numbers or letters of any kind. The frame contains only the photographed subject and scene.";
  }

  const fontPhrase = explicitFont
    ? `"${explicitFont}" font`
    : "a font that fits the mode and niche";
  const rendered = lines
    .map(
      (l) =>
        `Render the ${l.role} "${l.text}" in a ${l.weight} ${fontPhrase}, ${l.scale}.`
    )
    .join(" ");

  const hAlign = p.composition?.text_alignment;
  const vAlign = p.composition?.text_vertical;
  const placement = [
    hAlign ? TEXT_ALIGNMENT[hAlign] : null,
    vAlign ? TEXT_VERTICAL[vAlign] : null,
  ]
    .filter(Boolean)
    .join(" ");

  return [
    "Render typography with the following exact styling:",
    rendered,
    placement,
    "Spell every word exactly as written. These are the only words that may appear in the image.",
  ]
    .filter(Boolean)
    .join(" ");
}
