// Deterministic prompt fragments. Each user selection maps to a single,
// hand-tuned phrase that goes verbatim into the Nano Banana prompt.
//
// Tweak phrasing here to improve output quality for every user — no code
// changes needed elsewhere.

import type {
  Alignment,
  Dimensions,
  Framing,
  Lighting,
  Mode,
  Position,
  VerticalAlignment,
  VisualStyle,
} from "./_types";

// Hard rules that ship with EVERY generation. These guard fidelity to the
// uploaded subject and force production-grade photographic quality.
//
// Phrasing is intentionally aggressive — image models drift toward
// stylized/idealized output by default; only forceful negative constraints
// keep them on the rails.
// Foundational rules — written in POSITIVE narrative form per Google's
// Nano Banana prompting guide. The guide explicitly recommends describing
// what you want over listing what to avoid; "do not" wording is reserved
// for the few cases where a positive equivalent doesn't exist (e.g. text
// rendering rules).
export const SYSTEM_DIRECTIVE = [
  // Role + output format — sets the photographic register.
  "You are a top-tier campaign photographer producing a single still hero",
  "creative for a high-end brand. The output is a real photograph at 4K",
  "resolution: intentional lighting, real shadows, authentic skin texture,",
  "razor-sharp focus on the subject's eyes, crisp micro-detail across the",
  "frame — visible pores, individual hair strands, fabric weave, accurate",
  "catchlights.",

  // Identity — positive ground-truth framing instead of "do not change X".
  "When a subject photo is attached, treat it as ground truth. The person",
  "in the output is the same individual: identical facial features, skin",
  "tone, age lines, beard pattern, hairline, hair color and texture, jaw,",
  "chin, nose, lips, ears, neck and body proportions. Your job is to",
  "upgrade the lighting, background and composition around them — to",
  "reframe the existing person, not to reimagine who they are.",

  // Product fidelity — same positive framing.
  "When a product photo is attached, treat the product as ground truth:",
  "same shape, same label, same colors, same branding.",

  // Text-rendering rule — this one stays explicit because Gemini's text",
  // model loves to invent copy unless told otherwise.
  "Words appear in the image only when explicitly listed below as headline,",
  "subheadline or CTA. Spell each word exactly as written.",

  // Final pass — anti-AI-slop guard. Common artifacts to watch for.
  "Final pass before output: no extra fingers, no warped text, no plastic",
  "skin, no melted hands, no watermark, no logo placeholders, no",
  "duplicated facial features, no impossible jewelry or cropped accessories.",
].join(" ");

// Top-level "look" preset — biases the model toward editorial photography
// vs Brazilian SaaS-style campaign poster. Stacks on top of the
// SYSTEM_DIRECTIVE (which already permits both flavors).
export const MODE: Record<Mode, string> = {
  editorial:
    "MODE: editorial photography. Treat the frame as a premium magazine cover or fashion editorial. The subject is the unambiguous hero — clean composition, real environment softly out of focus, minimal or zero CGI/graphic embellishment. Lighting is naturalistic but cinematic (window light, softboxes, real practicals). Color grade is restrained, sophisticated, never gaudy. NO floating 3D objects, NO neon glows, NO lightning bolts, NO holograms — keep the frame quiet and confident.",
  campaign:
    "MODE: campaign poster (Brazilian SaaS launch / movie-poster aesthetic). Treat the frame as a hero ad creative built to stop the scroll. Integrate hyper-realistic 3D-rendered thematic elements that explain the offering — floating products, glowing UI cards, holograms, neon signs, gears, lightning bolts and electric arcs, energy particles, sparks, smoke, lens flares, volumetric god rays — themed to the niche. Lighting is theatrical with strong directional key + hard rim, complementary colored back-lights (orange/teal, purple/cyan, magenta/blue), heavy cinematic color grade. Background is dark and dramatic, subject pulled forward by light. Composition feels like a movie poster.",
};

export const POSITION: Record<Position, string> = {
  left: "Subject anchored on the left third of the frame, leaving generous negative space on the right for typography.",
  center: "Subject centered with symmetrical composition; copy stacks above or below.",
  right: "Subject anchored on the right third of the frame, leaving generous negative space on the left for typography.",
};

export const FRAMING: Record<Framing, string> = {
  "close-up": "Tight close-up framing — head and shoulders or product macro, intimate scale.",
  medium: "Medium framing — waist-up or product in context, balanced scale.",
  wide: "Wide framing — full body or environmental product shot, expansive scale.",
};

export const LIGHTING: Record<Lighting, string> = {
  cold:
    "Cool-toned lighting: soft diffused key from a large softbox, slight cyan cast, crisp natural shadows.",
  warm:
    "Golden-hour lighting: warm sun as key, soft amber rim light wrapping the subject, long natural shadows on the face.",
  neutral:
    "Natural daylight: balanced key and fill, true-to-life colors, even exposure.",
  dark:
    "Low-key lighting: single hard rim light, deep natural shadows, dramatic chiaroscuro.",
  vibrant:
    "Studio lighting with colored gels used as practicals — saturated background while the subject's skin stays naturally lit and photographic.",
};

export const VISUAL_STYLE: Record<VisualStyle, string> = {
  minimalist:
    "Minimalist direction: clean composition, generous negative space, single hero element, restrained palette.",
  bold:
    "Bold direction: high contrast, large clean typography, saturated background colors, scroll-stopping impact.",
  lifestyle:
    "Lifestyle direction: candid natural moment, real-world environment, authentic textures, documentary feel.",
  corporate:
    "Corporate direction: polished editorial finish, clean grid layout, restrained palette, premium magazine register.",
};

export const DIMENSIONS: Record<Dimensions, string> = {
  "9:16": "Vertical 9:16 aspect ratio (Stories / Reels).",
  "4:5": "Vertical 4:5 aspect ratio (Instagram feed).",
  "16:9": "Horizontal 16:9 aspect ratio (landscape, YouTube, web).",
  "1:1": "Square 1:1 aspect ratio.",
};

export const TEXT_ALIGNMENT: Record<Alignment, string> = {
  left: "Left-aligned typography.",
  center: "Center-aligned typography.",
  right: "Right-aligned typography.",
};

export const TEXT_VERTICAL: Record<VerticalAlignment, string> = {
  top: "Typography placed in the top third of the frame.",
  middle: "Typography placed in the vertical middle of the frame.",
  bottom: "Typography placed in the bottom third of the frame.",
};
