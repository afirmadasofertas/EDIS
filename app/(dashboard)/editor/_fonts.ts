// Curated Google Fonts list — covers display, sans, serif, mono so users can
// preview a creative without typing prompts. Fonts load on demand via a
// <link> tag injected once per family. The picker also supports typing
// any Google Font name as a custom value.

export type FontMeta = {
  family: string;
  category: "display" | "sans" | "serif" | "mono" | "handwriting";
};

export const FONTS: FontMeta[] = [
  // Sans
  { family: "Inter", category: "sans" },
  { family: "Space Grotesk", category: "sans" },
  { family: "DM Sans", category: "sans" },
  { family: "Manrope", category: "sans" },
  { family: "Plus Jakarta Sans", category: "sans" },
  { family: "Geist", category: "sans" },
  { family: "Outfit", category: "sans" },
  { family: "Onest", category: "sans" },
  { family: "Sora", category: "sans" },
  { family: "Albert Sans", category: "sans" },
  { family: "Hanken Grotesk", category: "sans" },
  { family: "Public Sans", category: "sans" },
  { family: "Montserrat", category: "sans" },
  { family: "Poppins", category: "sans" },
  { family: "Work Sans", category: "sans" },
  { family: "Nunito", category: "sans" },
  { family: "Rubik", category: "sans" },
  { family: "Lato", category: "sans" },
  { family: "Open Sans", category: "sans" },
  { family: "Roboto", category: "sans" },
  { family: "Figtree", category: "sans" },

  // Display
  { family: "Bricolage Grotesque", category: "display" },
  { family: "Archivo Black", category: "display" },
  { family: "Anton", category: "display" },
  { family: "Bebas Neue", category: "display" },
  { family: "Oswald", category: "display" },
  { family: "Big Shoulders Display", category: "display" },
  { family: "Unbounded", category: "display" },
  { family: "Syne", category: "display" },
  { family: "Major Mono Display", category: "display" },
  { family: "Climate Crisis", category: "display" },
  { family: "Bowlby One", category: "display" },
  { family: "Passion One", category: "display" },
  { family: "Russo One", category: "display" },

  // Serif
  { family: "Playfair Display", category: "serif" },
  { family: "Fraunces", category: "serif" },
  { family: "DM Serif Display", category: "serif" },
  { family: "Cormorant Garamond", category: "serif" },
  { family: "Libre Caslon Display", category: "serif" },
  { family: "Crimson Pro", category: "serif" },
  { family: "Lora", category: "serif" },
  { family: "Source Serif 4", category: "serif" },
  { family: "Newsreader", category: "serif" },
  { family: "Instrument Serif", category: "serif" },
  { family: "EB Garamond", category: "serif" },
  { family: "Merriweather", category: "serif" },

  // Mono
  { family: "JetBrains Mono", category: "mono" },
  { family: "IBM Plex Mono", category: "mono" },
  { family: "Space Mono", category: "mono" },
  { family: "Fira Code", category: "mono" },
  { family: "Geist Mono", category: "mono" },

  // Handwriting / script (use sparingly)
  { family: "Caveat", category: "handwriting" },
  { family: "Permanent Marker", category: "handwriting" },
  { family: "Pacifico", category: "handwriting" },
];

const loaded = new Set<string>();

export function loadFont(family: string) {
  if (typeof document === "undefined") return;
  const trimmed = family.trim();
  if (!trimmed || loaded.has(trimmed)) return;
  loaded.add(trimmed);

  const id = `gf-${trimmed.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;

  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    trimmed
  )}:wght@400;600;700;800;900&display=swap`;
  document.head.appendChild(link);
}
