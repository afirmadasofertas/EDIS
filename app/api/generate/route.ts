import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  DIMENSIONS,
  FRAMING,
  GENDER,
  LIGHTING,
  MODE,
  POSITION,
  QUANTITY,
  SYSTEM_DIRECTIVE,
  TEXT_ALIGNMENT,
  TEXT_VERTICAL,
  VISUAL_STYLE,
} from "@/app/(dashboard)/editor/_prompt-templates";
import type {
  Alignment,
  Dimensions,
  Framing,
  Gender,
  Lighting,
  Mode,
  Position,
  Quantity,
  VerticalAlignment,
  VisualStyle,
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
    quantity?: Quantity;
    gender?: Gender;
    framing?: Framing;
    position?: Position;
  };
  composition?: { text_alignment?: Alignment; text_vertical?: VerticalAlignment };
  style?: {
    visual_style?: VisualStyle;
    color_palette?: string[];
    lighting?: Lighting;
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

function buildPrompt(p: ApiPayload): string {
  const lines: string[] = [SYSTEM_DIRECTIVE];

  // Mode preset goes right after the system directive — it's the loudest
  // signal after the core rules.
  if (p.mode) lines.push(MODE[p.mode]);

  if (p.niche) lines.push(`Brand / niche context: ${p.niche}.`);

  const subj = p.subject ?? {};
  if (subj.quantity) lines.push(QUANTITY[subj.quantity]);
  if (subj.gender && GENDER[subj.gender]) lines.push(GENDER[subj.gender]);
  if (subj.framing) lines.push(FRAMING[subj.framing]);
  if (subj.position) lines.push(POSITION[subj.position]);

  const style = p.style ?? {};
  if (style.visual_style) lines.push(VISUAL_STYLE[style.visual_style]);
  if (style.lighting) lines.push(LIGHTING[style.lighting]);

  if (Array.isArray(style.color_palette) && style.color_palette.length) {
    lines.push(
      `Color palette to dominate the composition: ${style.color_palette.join(", ")}.`
    );
  }
  if (style.dimensions) lines.push(DIMENSIONS[style.dimensions]);

  const copy = p.copy ?? {};
  const copyParts: string[] = [];
  if (copy.headline) copyParts.push(`headline "${copy.headline}"`);
  if (copy.subheadline) copyParts.push(`subheadline "${copy.subheadline}"`);
  if (copy.cta) copyParts.push(`CTA button "${copy.cta}"`);
  if (copyParts.length) {
    const hAlign = p.composition?.text_alignment;
    const vAlign = p.composition?.text_vertical;
    const placement = [
      hAlign ? TEXT_ALIGNMENT[hAlign] : null,
      vAlign ? TEXT_VERTICAL[vAlign] : null,
    ]
      .filter(Boolean)
      .join(" ");
    lines.push(
      `Render legible typography: ${copyParts.join(", ")}.${placement ? " " + placement : ""} ` +
        `Font family "${style.font_family ?? "modern sans-serif"}". Spell every word exactly as written. ` +
        `These are the ONLY words allowed in the image — do not invent, add or paraphrase any other text.`
    );
  } else {
    // No copy supplied → forbid any rendered text. Without this the model
    // happily hallucinates a headline from the niche / creative note.
    lines.push(
      "RENDER ZERO TEXT in the image. No headline, no subheadline, no CTA, no captions, no logos, no signage, no labels, no watermarks, no numbers, no letters of any kind. The image must contain only the photographed subject and background — no typography whatsoever."
    );
  }

  if (p.references?.length) {
    lines.push(
      "Use the attached reference images strictly as inspiration for tone, lighting and composition — never for content or identity."
    );
  }
  const photosCount = subj.photos_count ?? 0;
  if (photosCount > 0) {
    lines.push(
      photosCount === 1
        ? "Use the attached subject photo as the literal subject in the final image, preserving every physical detail."
        : `Use the ${photosCount} attached subject photos together as the literal subject in the final image. The photos show the same subject from different angles or moments — preserve every physical detail consistently across the composition.`
    );
  }

  // User free-form direction (optional). Goes last so it can refine anything
  // above without overriding the SYSTEM_DIRECTIVE.
  if (p.creative_note?.trim()) {
    lines.push(
      `Additional creative direction from the user (use as soft guidance, never break the photorealism / identity-preservation rules above): ${p.creative_note.trim()}`
    );
  }

  return lines.join(" ");
}
