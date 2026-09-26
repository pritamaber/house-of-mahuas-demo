export interface Palette {
  /** body of the saree */
  base: string;
  /** darker tone used for the pallu and shading */
  deep: string;
  /** border colour */
  accent: string;
  /** colour of woven butis / motifs */
  motif: string;
}

const PALETTES: Record<string, Palette> = {
  black: { base: "#231c29", deep: "#150f1b", accent: "#5b2f86", motif: "#d6884a" },
  maroon: { base: "#7a1631", deep: "#560d21", accent: "#c99a3b", motif: "#e6c06a" },
  green: { base: "#0f5d47", deep: "#0a4032", accent: "#c99a3b", motif: "#e6c36a" },
  ivory: { base: "#f2eadb", deep: "#e6d9c0", accent: "#b3222f", motif: "#b3222f" },
  pink: { base: "#e9a3b8", deep: "#d7809b", accent: "#7a1631", motif: "#fff1e8" },
  red: { base: "#b3122b", deep: "#8a0c20", accent: "#d9a441", motif: "#f4d284" },
  beige: { base: "#d9c4a3", deep: "#c4ab86", accent: "#6d3f22", motif: "#7a5330" },
  mustard: { base: "#d49c1d", deep: "#b57f0e", accent: "#5a1a2a", motif: "#5a1a2a" },
  peach: { base: "#f2bb92", deep: "#e39c6c", accent: "#a34a2a", motif: "#a34a2a" },
  teal: { base: "#147a80", deep: "#0d5a5f", accent: "#f0e6d2", motif: "#f0e6d2" },
  blue: { base: "#1f3b7a", deep: "#16295a", accent: "#c99a3b", motif: "#e6c36a" },
  purple: { base: "#5b2a86", deep: "#431d66", accent: "#d9a441", motif: "#ecc86f" },
  yellow: { base: "#f0c230", deep: "#d9a316", accent: "#b3122b", motif: "#a3121f" },
  gold: { base: "#c9a24c", deep: "#a98130", accent: "#7a1631", motif: "#fff0c4" },
  orange: { base: "#d9661a", deep: "#b04e0f", accent: "#2b1c14", motif: "#ffe0a8" },
  white: { base: "#f6f2ea", deep: "#e7e0d2", accent: "#c99a3b", motif: "#c99a3b" },
  grey: { base: "#9a9aa2", deep: "#7c7c86", accent: "#2f2f3a", motif: "#f0f0f4" },
  navy: { base: "#16224a", deep: "#0d1631", accent: "#c99a3b", motif: "#e6c36a" },
  brown: { base: "#6b4630", deep: "#4c3020", accent: "#d9a441", motif: "#e9c98a" },
};

const FALLBACK: Palette = { base: "#a89785", deep: "#8a7866", accent: "#5a1a2a", motif: "#f3e7d3" };

/** Match on the first recognised colour word, e.g. "Emerald Green" → green. */
export function paletteFor(colorName: string): Palette {
  const words = colorName.toLowerCase().split(/[^a-z]+/).filter(Boolean);
  for (const w of words) if (PALETTES[w]) return PALETTES[w];
  return FALLBACK;
}

/** Swatch colour shown in the filter sidebar. */
export function swatchFor(colorName: string): string {
  return paletteFor(colorName).base;
}

export type Motif = "buti" | "floral" | "paisley" | "stripe" | "check" | "jamdani";

/** Chooses a woven motif for the generated placeholder from the product's fabric. */
export function motifFor(fabric: string, name = ""): Motif {
  const s = `${fabric} ${name}`.toLowerCase();
  if (/jamdani/.test(s)) return "jamdani";
  if (/linen|tant|cotton/.test(s)) return "check";
  if (/organza|floral|georgette/.test(s)) return "floral";
  if (/banarasi|kanjivaram|baluchari|katan|zari/.test(s)) return "paisley";
  if (/tussar|kantha|ikat|chanderi/.test(s)) return "stripe";
  return "buti";
}
