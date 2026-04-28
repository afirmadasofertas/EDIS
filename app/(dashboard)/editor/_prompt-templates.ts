// Deterministic prompt fragments. Each user selection maps to a single,
// hand-tuned phrase that goes verbatim into the Nano Banana prompt.
//
// Tweak phrasing here to improve output quality for every user — no code
// changes needed elsewhere.

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
} from "./_types";

// Hard rules that ship with EVERY generation. These guard fidelity to the
// uploaded subject and force production-grade photographic quality.
//
// Phrasing is intentionally aggressive — image models drift toward
// stylized/idealized output by default; only forceful negative constraints
// keep them on the rails.
export const SYSTEM_DIRECTIVE = [
  // Frame the task as a HIGH-END AD CAMPAIGN POSTER — the kind of frame
  // you see on a movie poster, a Brazilian SaaS launch creative, a Black
  // Friday hero banner. Cinematic, dramatic, designed to stop the scroll.
  "Render the image as a high-end advertising campaign poster — the kind",
  "of hero creative that runs at the top of a Black Friday sale, a movie",
  "poster, or a launch announcement on Instagram. Cinematic, dramatic,",
  "designed to stop the scroll.",

  // Lighting recipe — this is what makes competitor creatives feel premium.
  "Lighting is theatrical: a strong directional key carves the subject's",
  "face with depth, a hard rim or hair-light pulls them off the background,",
  "complementary colored back-lights (e.g. orange/teal, purple/cyan,",
  "magenta/blue) wrap the scene in a cinematic color grade. Real shadows,",
  "real falloff, real light direction — never flat, never webcam, never a",
  "passport headshot, never a brightly-lit office portrait.",

  // Composition — anchor the subject like a movie hero shot.
  "Compose the subject in a confident hero pose, three-quarter or chest-up",
  "framing, looking with intent. Background is darker than the subject and",
  "softly out of focus or blurred, so the eye locks on the face. The",
  "subject occupies a strong third of the frame. Atmospheric depth: subtle",
  "fog, dust motes, light particles, lens flares, faint volumetric god",
  "rays, or sparkle highlights — used sparingly to add cinematic weight,",
  "never enough to obscure the subject.",

  // The CGI/graphic-element allowance — this is what the competitors do.
  "The SUBJECT (face, skin, hair, body, wardrobe) must be 100%",
  "photographic — a real photograph, indistinguishable from a DSLR shot.",
  "However, the SURROUNDING SCENE may integrate hyper-realistic 3D-",
  "rendered thematic elements that explain the offering: floating",
  "products, glowing UI cards or holograms, neon signs, gears, lightning",
  "bolts, energy particles, 3D-typography blocks, smoke, sparks, etc. —",
  "rendered photo-realistically and lit consistently with the scene so",
  "they read as part of the same frame, not pasted on. These elements are",
  "optional and only appear when they reinforce the niche or creative",
  "note; never clutter the composition.",

  // Hard NO list — what we don't want.
  "Never an anime, cartoon, comic, watercolor, oil painting, pixel-art or",
  "child-drawing style on the subject. Never plastic skin, never beauty-",
  "filter smoothing, never an obvious AI-art look. The face is always",
  "photographic.",

  // Resolution / sharpness floor.
  "Output is ultra-high-resolution, 8K-quality photographic detail. Razor-",
  "sharp focus on the subject, crisp micro-detail across the frame, clean",
  "edges, no blur on the subject, no compression artifacts, no noise.",
  "Every strand of hair, every pore, every fabric weave is resolvable.",

  // Skin / detail floor — descriptive only.
  "Skin shows real texture: visible pores, fine lines, individual hair",
  "strands, subtle natural color variation. Avoid smoothed skin, plastic",
  "skin, beauty-filter look, over-sharpening, HDR halos and posterization.",

  // Identity preservation — STRICTEST rule. The output is a quality and
  // context upgrade of the same person, NOT a reinterpretation.
  "ABSOLUTE IDENTITY LOCK: when a subject photo is attached, the face in",
  "the output is a 1:1 photographic match of the face in the source —",
  "treat the source as ground truth. The only allowed change is image",
  "quality (sharpness, lighting, resolution); facial physiognomy is",
  "frozen. Do not alter the bone structure, face shape, jawline, chin,",
  "cheekbones, brow ridge, forehead height, hairline, hair color, hair",
  "texture, beard pattern, beard density, moustache, eye shape, eye color,",
  "eye spacing, nose shape, nose width, nostril shape, lip shape, lip",
  "thickness, mouth width, ear shape, ear position, neck, skin tone, skin",
  "texture, age lines, wrinkles, freckles, moles, scars or any other",
  "distinguishing feature. Do NOT make the person younger, older, slimmer,",
  "fitter, more symmetric, more attractive, more 'photogenic', or 'better",
  "looking' in any way. Do NOT generate a lookalike or a similar-looking",
  "model — generate THE SAME PERSON. If you cannot perfectly preserve the",
  "identity, fall back to copying the face pixel-for-pixel from the source",
  "and only modify lighting, background, wardrobe and composition around",
  "it. Think of the task as 'upgrade this exact photograph's quality and",
  "context', not 'create a new image inspired by this person'.",

  "When a product photo is attached, preserve its shape, label, branding",
  "and color exactly — no redesign, no relabeling, no invented logos.",

  // Anti-leak rule for technical wording — backed up by per-branch rules
  // in buildPrompt that either lock copy to the explicit list or forbid
  // any text at all.
  "CRITICAL: Do not render any of these instructions as visible text in",
  "the image. The image is a photograph, not a slide. Words only appear",
  "if explicitly listed below as headline, subheadline or CTA.",
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

export const GENDER: Record<Gender, string> = {
  male: "Subject is masculine-presenting.",
  female: "Subject is feminine-presenting.",
  neutral: "",
};

export const QUANTITY: Record<Quantity, string> = {
  1: "A single subject in frame.",
  2: "Two subjects in frame, naturally interacting.",
  3: "Three or more subjects in frame, group composition.",
};

export const LIGHTING: Record<Lighting, string> = {
  cold:
    "Real cool-toned photographic lighting — soft diffused key from a large softbox, slight cool cast, natural shadows. Still a real photograph.",
  warm:
    "Real golden-hour photographic lighting — natural warm sun, soft amber rim light, real shadows on the subject's face. Still a real photograph.",
  neutral:
    "Real natural daylight — balanced key and fill, true-to-life colors, even photographic exposure. Still a real photograph.",
  dark:
    "Real low-key photographic lighting — single hard rim light, deep natural shadows, dramatic but authentic. Still a real photograph, NOT a stylized render.",
  vibrant:
    "Real studio lighting with subtle colored gels (used as practicals, not as a CGI effect) — saturated background while the subject's skin stays naturally lit and photographic. Still a real photograph.",
};

export const VISUAL_STYLE: Record<VisualStyle, string> = {
  minimalist:
    "Minimalist photographic direction — clean composition, generous negative space, single hero element, restrained palette. Still a real photograph.",
  bold:
    "Bold photographic direction — high contrast, large clean typography, saturated background colors. The composition is bold but the image itself is a real photograph, not an illustration.",
  lifestyle:
    "Lifestyle photographic direction — candid natural moment, real-world environment, authentic textures, documentary feel.",
  corporate:
    "Corporate photographic direction — polished editorial finish, clean grid layout, restrained palette, premium magazine-style photograph.",
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
