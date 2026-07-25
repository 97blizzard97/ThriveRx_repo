/** Deterministic canopy colour from a medication id (hash → hue). */

export interface TreePalette {
  canopy: string;
  canopyBright: string;
  trunk: string;
}

function hashString(id: string): number {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** HSL → #rrggbb (RN-safe). */
function hslToHex(h: number, s: number, l: number): string {
  const sat = s / 100;
  const light = l / 100;
  const a = sat * Math.min(light, 1 - light);
  const channel = (n: number): string => {
    const k = (n + h / 30) % 12;
    const color =
      light - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

/**
 * Stable palette per id. Mid luminance so canopies stay readable on
 * both day and night skies; slight hue spread avoids near-duplicates.
 */
export function treePaletteFromId(id: string): TreePalette {
  const hue = hashString(id) % 360;
  return {
    canopy: hslToHex(hue, 58, 42),
    canopyBright: hslToHex(hue, 62, 56),
    trunk: '#57534e',
  };
}
