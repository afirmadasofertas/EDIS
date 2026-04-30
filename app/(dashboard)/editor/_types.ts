// Single source of truth for the editor. Every control mutates this state;
// the JSON shipped to /api/generate is derived from it.

export type Mode = "editorial" | "campaign";
export type Framing = "close-up" | "medium" | "wide";
export type Position = "left" | "center" | "right";
export type Alignment = "left" | "center" | "right";
export type VerticalAlignment = "top" | "middle" | "bottom";
export type Lighting = "cold" | "warm" | "neutral" | "dark" | "vibrant";
export type Dimensions = "9:16" | "4:5" | "16:9" | "1:1";

export type ReferenceImage = {
  id: string;
  imageUrl: string;       // data URL (preview)
  imageBase64: string;    // raw base64 (no prefix) for API
  mimeType: string;
  note: string;
};

export type SubjectPhoto = {
  id: string;
  photoUrl: string;       // data URL (preview)
  photoBase64: string;    // raw base64 (no prefix) for API
  photoMime: string;
};

export type EditorState = {
  mode: Mode;
  niche: string;
  creativeNote: string;
  subject: {
    photos: SubjectPhoto[];
    framing: Framing;
    position: Position;
  };
  composition: {
    textAlignment: Alignment;
    textVertical: VerticalAlignment;
  };
  style: {
    colorPalette: string[];
    lighting: Lighting;
    dimensions: Dimensions;
    fontFamily: string;
  };
  copy: {
    headline: string;
    subheadline: string;
    cta: string;
  };
  references: ReferenceImage[];
};

export type Generation = {
  id: string;
  createdAt: number;
  imageUrl: string; // data URL of the generated PNG
  state: EditorState;
};

export const DEFAULT_STATE: EditorState = {
  mode: "editorial",
  niche: "",
  creativeNote: "",
  subject: {
    photos: [],
    framing: "medium",
    position: "center",
  },
  composition: {
    textAlignment: "left",
    textVertical: "bottom",
  },
  style: {
    colorPalette: ["#0a0a0a", "#00e573"],
    lighting: "warm",
    dimensions: "9:16",
    fontFamily: "Inter",
  },
  copy: {
    headline: "",
    subheadline: "",
    cta: "",
  },
  references: [],
};

// API payload uses snake_case as specified.
export function toApiPayload(s: EditorState) {
  const layout =
    s.subject.position === "center"
      ? "subject-center-text-bottom"
      : `subject-${s.subject.position}-text-${s.composition.textAlignment === s.subject.position ? "stack" : s.composition.textAlignment}`;

  return {
    mode: s.mode,
    subject: {
      // Image data ships separately as binary parts. Metadata only here.
      photos_count: s.subject.photos.length,
      framing: s.subject.framing,
      position: s.subject.position,
    },
    composition: {
      text_alignment: s.composition.textAlignment,
      text_vertical: s.composition.textVertical,
      text_position: `${s.composition.textVertical}-${s.composition.textAlignment}`,
      layout,
    },
    style: {
      color_palette: s.style.colorPalette,
      lighting: s.style.lighting,
      dimensions: s.style.dimensions,
      font_family: s.style.fontFamily,
    },
    copy: {
      headline: s.copy.headline,
      subheadline: s.copy.subheadline,
      cta: s.copy.cta,
    },
    niche: s.niche,
    creative_note: s.creativeNote,
    // Reference image data ships separately. Notes ride along here.
    references: s.references.map((r) => ({ note: r.note })),
  };
}
