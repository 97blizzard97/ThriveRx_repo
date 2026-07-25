/**
 * Tiny-forest rim placements — pack trees along a short viewer-facing arc
 * (not NESW compass points). Angles are degrees clockwise from planet top.
 */

/** Bottom / viewer-facing centre of the grove. */
export const FOREST_CENTER_DEG = 180;

/** Max arc width when many trees pack in (°). */
const FOREST_MAX_SPAN_DEG = 84;

/** Preferred angular gap between neighbours when few trees (°). */
const FOREST_PACK_STEP_DEG = 12;

/** Slight inward/outward stagger so the grove has depth (px). */
const RADIUS_STAGGER_PX = 5;

export interface ForestSlot {
  angleDeg: number;
  radius: number;
}

/** Place tree `index` of `count` on a packed lower-rim arc. */
export function forestSlot(
  index: number,
  count: number,
  orbitRadius: number,
): ForestSlot {
  if (count <= 1) {
    return { angleDeg: FOREST_CENTER_DEG, radius: orbitRadius };
  }

  const step = Math.min(
    FOREST_PACK_STEP_DEG,
    FOREST_MAX_SPAN_DEG / (count - 1),
  );
  const span = step * (count - 1);
  const start = FOREST_CENTER_DEG - span / 2;
  const angleDeg = start + index * step;

  // Alternate depth + mild mid-row push so trees read as a grove, not a line.
  const parity = index % 2 === 0 ? -1 : 1;
  const midPush = count >= 3 && index > 0 && index < count - 1 ? 2 : 0;
  const radius = orbitRadius + parity * RADIUS_STAGGER_PX + midPush;

  return { angleDeg, radius };
}
