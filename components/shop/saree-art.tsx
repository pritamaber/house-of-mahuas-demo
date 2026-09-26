import { motifFor, paletteFor, type Motif } from "@/lib/colors";

export type ArtView = "full" | "pallu" | "border";

// All views are 4:5 so they slot into the same frames as real photos.
const VIEWBOX: Record<ArtView, string> = {
  full: "0 0 400 500",
  pallu: "92 230 216 270",
  border: "0 320 128 160",
};

const ZARI = "#e2b85a";

function MotifShape({ motif, color, ground }: { motif: Motif; color: string; ground: string }) {
  switch (motif) {
    case "floral":
      return (
        <g>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-5" rx="2.7" ry="4.4" fill={color} transform={`rotate(${a})`} />
          ))}
          <circle r="1.9" fill={ZARI} />
        </g>
      );
    case "paisley":
      return (
        <g transform="rotate(24)">
          <path d="M0 -10 C7 -5 8 4 0 10 C-8 4 -7 -5 0 -10Z" fill={color} />
          <path d="M0 -5 C3.4 -2 3.8 2 0 5.4 C-3.8 2 -3.4 -2 0 -5Z" fill={ground} opacity="0.85" />
          <circle cy="0.2" r="1.1" fill={color} />
        </g>
      );
    default:
      return (
        <g>
          <path d="M0 -6.5 L4.8 0 L0 6.5 L-4.8 0Z" fill={color} />
          <circle r="1.4" fill={ground} opacity="0.9" />
        </g>
      );
  }
}

/**
 * A generated woven-textile illustration used wherever a saree has no photograph yet.
 * Colour comes from the product's colour name, the motif from its fabric.
 */
export function SareeArt({
  slug,
  color,
  fabric,
  name,
  view = "full",
  className,
}: {
  slug: string;
  color: string;
  fabric: string;
  name?: string;
  view?: ArtView;
  className?: string;
}) {
  const pal = paletteFor(color);
  const motif = motifFor(fabric, name);
  const id = `art-${slug}-${view}`.replace(/[^a-z0-9-]/gi, "");
  const palluMotif: Motif = motif === "floral" ? "floral" : motif === "paisley" ? "paisley" : "buti";
  const latticeMotif: Motif = motif === "floral" || motif === "paisley" ? motif : "buti";

  return (
    <svg
      viewBox={VIEWBOX[view]}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label={`${color} ${fabric} saree`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* fine weave texture */}
        <pattern id={`${id}-weave`} width="3" height="3" patternUnits="userSpaceOnUse">
          <rect width="3" height="1" fill="#fff" opacity="0.05" />
          <rect x="1" y="1.5" width="1" height="1.5" fill="#000" opacity="0.05" />
        </pattern>

        {/* body: diagonal lattice of woven butis */}
        <pattern id={`${id}-lattice`} width="44" height="44" patternUnits="userSpaceOnUse">
          <g transform="translate(11 11)">
            <MotifShape motif={latticeMotif} color={pal.motif} ground={pal.base} />
          </g>
          <g transform="translate(33 33)">
            <MotifShape motif={latticeMotif} color={pal.motif} ground={pal.base} />
          </g>
        </pattern>

        {/* body: woven stripes (tussar / ikat / chanderi) */}
        <pattern id={`${id}-stripe`} width="16" height="10" patternUnits="userSpaceOnUse">
          <rect x="3" width="1.4" height="10" fill={pal.motif} opacity="0.55" />
          <rect x="11" width="0.7" height="10" fill={pal.motif} opacity="0.3" />
        </pattern>

        {/* body: tant / linen check */}
        <pattern id={`${id}-check`} width="26" height="26" patternUnits="userSpaceOnUse">
          <rect width="26" height="1.3" fill={pal.motif} opacity="0.4" />
          <rect width="1.3" height="26" fill={pal.motif} opacity="0.4" />
          <rect x="13" y="13" width="2.4" height="2.4" fill={pal.motif} opacity="0.5" />
        </pattern>

        {/* body: jamdani — finely woven diamonds */}
        <pattern id={`${id}-jamdani`} width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M15 8 L22 15 L15 22 L8 15Z" fill="none" stroke={pal.motif} strokeWidth="1.2" opacity="0.75" />
          <circle cx="15" cy="15" r="1.7" fill={pal.motif} opacity="0.85" />
          <circle cx="0" cy="0" r="1.2" fill={pal.motif} opacity="0.6" />
          <circle cx="30" cy="0" r="1.2" fill={pal.motif} opacity="0.6" />
          <circle cx="0" cy="30" r="1.2" fill={pal.motif} opacity="0.6" />
          <circle cx="30" cy="30" r="1.2" fill={pal.motif} opacity="0.6" />
        </pattern>

        {/* pallu: dense motif field */}
        <pattern id={`${id}-pallu`} width="30" height="28" patternUnits="userSpaceOnUse">
          <g transform="translate(8 8)">
            <MotifShape motif={palluMotif} color={ZARI} ground={pal.deep} />
          </g>
          <g transform="translate(23 22)">
            <MotifShape motif={palluMotif} color={ZARI} ground={pal.deep} />
          </g>
        </pattern>

        {/* selvedge border: repeating diamond */}
        <pattern id={`${id}-edge`} width="28" height="20" patternUnits="userSpaceOnUse">
          <path d="M14 3 L20 10 L14 17 L8 10Z" fill={ZARI} opacity="0.95" />
          <circle cx="14" cy="10" r="1.6" fill={pal.accent} />
        </pattern>

        {/* drape folds */}
        <linearGradient id={`${id}-fold`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.12" />
          <stop offset="0.13" stopColor="#fff" stopOpacity="0.11" />
          <stop offset="0.25" stopColor="#000" stopOpacity="0" />
          <stop offset="0.4" stopColor="#000" stopOpacity="0.15" />
          <stop offset="0.52" stopColor="#fff" stopOpacity="0.13" />
          <stop offset="0.68" stopColor="#000" stopOpacity="0.02" />
          <stop offset="0.82" stopColor="#000" stopOpacity="0.15" />
          <stop offset="0.93" stopColor="#fff" stopOpacity="0.09" />
          <stop offset="1" stopColor="#000" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id={`${id}-vig`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.1" />
          <stop offset="0.35" stopColor="#000" stopOpacity="0" />
          <stop offset="0.75" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect width="400" height="500" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${id}-clip)`}>
        {/* body */}
        <rect width="400" height="500" fill={pal.base} />
        <rect x="28" width="344" height="322" fill={`url(#${id}-${motif === "jamdani" || motif === "check" || motif === "stripe" ? motif : "lattice"})`} />

        {/* pallu */}
        <rect x="28" y="336" width="344" height="164" fill={pal.deep} />
        <rect x="28" y="352" width="344" height="132" fill={`url(#${id}-pallu)`} />
        <rect x="28" y="344" width="344" height="2" fill={ZARI} />
        <rect x="28" y="490" width="344" height="2" fill={ZARI} />

        {/* pallu heading band */}
        <rect x="28" y="316" width="344" height="3" fill={ZARI} />
        <rect x="28" y="322" width="344" height="11" fill={pal.accent} />
        <rect x="28" y="325.5" width="344" height="1.4" fill={ZARI} opacity="0.9" />
        <rect x="28" y="329" width="344" height="1.4" fill={ZARI} opacity="0.9" />

        {/* selvedge borders */}
        <rect width="28" height="500" fill={pal.accent} />
        <rect x="372" width="28" height="500" fill={pal.accent} />
        <rect x="4" width="1.6" height="500" fill={ZARI} />
        <rect x="22.4" width="1.6" height="500" fill={ZARI} />
        <rect x="374" width="1.6" height="500" fill={ZARI} />
        <rect x="392.4" width="1.6" height="500" fill={ZARI} />
        <rect x="7" width="14" height="500" fill={`url(#${id}-edge)`} />
        <rect x="379" width="14" height="500" fill={`url(#${id}-edge)`} />

        {/* fabric finish */}
        <rect width="400" height="500" fill={`url(#${id}-weave)`} />
        <rect x="-120" y="-120" width="640" height="740" fill={`url(#${id}-fold)`} transform="rotate(-14 200 250)" />
        <rect width="400" height="500" fill={`url(#${id}-vig)`} />
      </g>
    </svg>
  );
}
