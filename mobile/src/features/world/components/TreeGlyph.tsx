import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { GrowthStage } from '../../../lib/api-types';
import type { TreePalette } from '../utils/treeColor';

interface TreeGlyphProps {
  growthStage: GrowthStage;
  medicineName: string;
  growthDays: number;
  palette: TreePalette;
  selected?: boolean;
  /** Compact outward-facing glyph for the planet rim (no name label). */
  planetMode?: boolean;
  onPress?: () => void;
}

interface LeafBlob {
  /** Horizontal offset of blob centre from canopy centre (negative = left). */
  x: number;
  /** Vertical offset of blob centre from canopy top. */
  y: number;
  w: number;
  h: number;
  /** 'base' | 'bright' | 'deep' — maps to palette / shade overlays. */
  tone: 'base' | 'bright' | 'deep';
  z?: number;
}

const STAGE_SCALE: Record<GrowthStage, number> = {
  budding: 0.68,
  small: 0.88,
  large: 1.08,
  mature: 1.32,
};

/** Bounding box for the foliage mass (non-budding stages). */
const CANOPY_BOX: Record<
  Exclude<GrowthStage, 'budding'>,
  { width: number; height: number }
> = {
  small: { width: 52, height: 40 },
  large: { width: 72, height: 54 },
  mature: { width: 94, height: 70 },
};

/** Overlapping soft ellipses — reads as foliage, not a single rectangle.
 *  `x` / `y` are the blob centre relative to canopy centre / top. */
const FOLIAGE: Record<Exclude<GrowthStage, 'budding'>, LeafBlob[]> = {
  small: [
    { x: -10, y: 18, w: 28, h: 24, tone: 'deep', z: 0 },
    { x: 12, y: 16, w: 30, h: 26, tone: 'deep', z: 0 },
    { x: -6, y: 12, w: 32, h: 28, tone: 'base', z: 1 },
    { x: 10, y: 10, w: 30, h: 26, tone: 'base', z: 1 },
    { x: 0, y: 8, w: 28, h: 24, tone: 'bright', z: 2 },
    { x: -8, y: 12, w: 14, h: 12, tone: 'bright', z: 3 },
  ],
  large: [
    { x: -16, y: 26, w: 34, h: 28, tone: 'deep', z: 0 },
    { x: 18, y: 24, w: 36, h: 30, tone: 'deep', z: 0 },
    { x: 0, y: 28, w: 38, h: 28, tone: 'deep', z: 0 },
    { x: -12, y: 16, w: 36, h: 32, tone: 'base', z: 1 },
    { x: 14, y: 14, w: 34, h: 30, tone: 'base', z: 1 },
    { x: 0, y: 14, w: 40, h: 34, tone: 'base', z: 1 },
    { x: 0, y: 8, w: 32, h: 28, tone: 'bright', z: 2 },
    { x: -12, y: 14, w: 16, h: 14, tone: 'bright', z: 3 },
    { x: 16, y: 16, w: 14, h: 12, tone: 'bright', z: 3 },
  ],
  mature: [
    { x: -20, y: 34, w: 40, h: 32, tone: 'deep', z: 0 },
    { x: 22, y: 32, w: 42, h: 34, tone: 'deep', z: 0 },
    { x: 0, y: 36, w: 44, h: 32, tone: 'deep', z: 0 },
    { x: -16, y: 20, w: 42, h: 36, tone: 'base', z: 1 },
    { x: 18, y: 18, w: 40, h: 34, tone: 'base', z: 1 },
    { x: 0, y: 18, w: 48, h: 40, tone: 'base', z: 1 },
    { x: -26, y: 24, w: 28, h: 26, tone: 'base', z: 1 },
    { x: 28, y: 26, w: 26, h: 24, tone: 'base', z: 1 },
    { x: 0, y: 10, w: 36, h: 30, tone: 'bright', z: 2 },
    { x: -14, y: 16, w: 18, h: 16, tone: 'bright', z: 3 },
    { x: 18, y: 18, w: 16, h: 14, tone: 'bright', z: 3 },
    { x: 2, y: 22, w: 20, h: 14, tone: 'bright', z: 3 },
  ],
};

function blobColor(
  tone: LeafBlob['tone'],
  palette: TreePalette,
): string {
  if (tone === 'bright') return palette.canopyBright;
  if (tone === 'deep') return palette.canopy;
  return palette.canopy;
}

/** Sprout / tree glyph sized by growth_stage; canopy tinted per medicine. */
export function TreeGlyph({
  growthStage,
  medicineName,
  growthDays,
  palette,
  selected = false,
  planetMode = false,
  onPress,
}: TreeGlyphProps) {
  const scale = STAGE_SCALE[growthStage];
  const isBudding = growthStage === 'budding';
  const canopy = isBudding ? null : CANOPY_BOX[growthStage];
  const foliage = isBudding ? null : FOLIAGE[growthStage];

  const trunkTop = isBudding ? 3 : growthStage === 'small' ? 6 : 8;
  const trunkBottom = isBudding ? 5 : growthStage === 'small' ? 11 : 14;
  const trunkHeight = isBudding
    ? 16
    : 18 + Math.round(20 * (growthStage === 'mature' ? 1.15 : 1));

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.wrap,
        planetMode && styles.wrapPlanet,
        selected && styles.wrapSelected,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${medicineName}, ${growthDays}`}
      hitSlop={planetMode ? 8 : 0}
    >
      <View
        style={[
          styles.tree,
          planetMode && styles.treePlanet,
          { transform: [{ scale }] },
        ]}
      >
        <View
          style={[
            styles.groundShadow,
            {
              width: isBudding
                ? 18
                : Math.max(trunkBottom * 2.4, (canopy?.width ?? 40) * 0.48),
            },
          ]}
        />

        {isBudding ? (
          <BuddingFoliage palette={palette} />
        ) : (
          <View
            style={[
              styles.canopyStack,
              {
                width: canopy!.width,
                height: canopy!.height,
              },
            ]}
          >
            {foliage!.map((blob, i) => (
              <View
                key={`leaf-${i}`}
                style={[
                  styles.leafBlob,
                  {
                    left: canopy!.width / 2 + blob.x - blob.w / 2,
                    top: blob.y - blob.h / 2,
                    width: blob.w,
                    height: blob.h,
                    borderRadius: Math.max(blob.w, blob.h),
                    backgroundColor: blobColor(blob.tone, palette),
                    opacity: blob.tone === 'deep' ? 0.78 : 1,
                    zIndex: blob.z ?? 1,
                  },
                ]}
              />
            ))}
            {/* Specular highlight — reads day/night */}
            <View
              style={[
                styles.canopyHighlight,
                {
                  left: canopy!.width * 0.22,
                  top: canopy!.height * 0.14,
                  width: canopy!.width * 0.28,
                  height: canopy!.height * 0.22,
                  borderRadius: canopy!.width * 0.2,
                },
              ]}
            />
            {/* Underside shade for faux depth */}
            <View
              style={[
                styles.canopyShade,
                {
                  left: canopy!.width * 0.18,
                  bottom: 2,
                  width: canopy!.width * 0.64,
                  height: canopy!.height * 0.22,
                  borderRadius: canopy!.width * 0.2,
                },
              ]}
            />
            {selected ? (
              <View
                style={[
                  styles.selectRing,
                  {
                    width: canopy!.width + 6,
                    height: canopy!.height + 4,
                    borderRadius: canopy!.width / 2,
                    left: -3,
                    top: -2,
                  },
                ]}
              />
            ) : null}
          </View>
        )}

        <TaperTrunk
          topWidth={trunkTop}
          bottomWidth={trunkBottom}
          height={trunkHeight}
          color={palette.trunk}
        />
      </View>
      {planetMode ? null : (
        <>
          <Text style={styles.name} numberOfLines={1}>
            {medicineName}
          </Text>
          <Text style={styles.days}>{growthDays}</Text>
        </>
      )}
    </Pressable>
  );
}

interface BuddingFoliageProps {
  palette: TreePalette;
}

function BuddingFoliage({ palette }: BuddingFoliageProps) {
  return (
    <View style={styles.sproutWrap}>
      <View
        style={[
          styles.sproutLeaf,
          styles.sproutLeafLeft,
          { backgroundColor: palette.canopyBright },
        ]}
      >
        <View style={styles.sproutLeafShine} />
      </View>
      <View
        style={[
          styles.sproutLeaf,
          styles.sproutLeafRight,
          { backgroundColor: palette.canopy },
        ]}
      />
      <View
        style={[
          styles.sproutLeaf,
          styles.sproutLeafTop,
          { backgroundColor: palette.canopyBright },
        ]}
      />
    </View>
  );
}

interface TaperTrunkProps {
  topWidth: number;
  bottomWidth: number;
  height: number;
  color: string;
}

/** Stacked rounded segments — wider at the base for a tapered silhouette. */
function TaperTrunk({
  topWidth,
  bottomWidth,
  height,
  color,
}: TaperTrunkProps) {
  const segments = 4;
  return (
    <View style={[styles.trunkWrap, { width: bottomWidth + 2, height }]}>
      {Array.from({ length: segments }, (_, i) => {
        const t = i / (segments - 1);
        const w = topWidth + (bottomWidth - topWidth) * t;
        const segH = height / segments + 1;
        return (
          <View
            key={`trunk-${i}`}
            style={[
              styles.trunkSeg,
              {
                width: w,
                height: segH,
                marginTop: i === 0 ? 0 : -1,
                backgroundColor: color,
                borderRadius: Math.max(2, w * 0.35),
              },
            ]}
          >
            <View style={styles.trunkShade} />
            <View
              style={[
                styles.trunkHighlight,
                { width: Math.max(1.5, w * 0.22) },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    minWidth: 88,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  wrapPlanet: {
    minWidth: 76,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  wrapSelected: {
    backgroundColor: 'rgba(15, 118, 110, 0.12)',
    borderRadius: 12,
  },
  tree: {
    alignItems: 'center',
    height: 118,
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  treePlanet: {
    height: 104,
    marginBottom: 0,
  },
  groundShadow: {
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
    borderRadius: 20,
    bottom: 2,
    height: 7,
    position: 'absolute',
    zIndex: 0,
  },
  sproutWrap: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'flex-end',
    marginBottom: -2,
    width: 36,
    zIndex: 2,
  },
  sproutLeaf: {
    borderRadius: 999,
    overflow: 'hidden',
    position: 'absolute',
  },
  sproutLeafLeft: {
    height: 16,
    left: 0,
    top: 8,
    transform: [{ rotate: '-38deg' }],
    width: 14,
  },
  sproutLeafRight: {
    height: 16,
    right: 0,
    top: 8,
    transform: [{ rotate: '38deg' }],
    width: 14,
  },
  sproutLeafTop: {
    height: 14,
    top: 0,
    width: 12,
  },
  sproutLeafShine: {
    backgroundColor: 'rgba(248, 250, 252, 0.4)',
    borderRadius: 6,
    height: 6,
    left: 2,
    position: 'absolute',
    top: 2,
    width: 6,
  },
  canopyStack: {
    marginBottom: -10,
    overflow: 'visible',
    position: 'relative',
    zIndex: 2,
  },
  leafBlob: {
    position: 'absolute',
  },
  canopyHighlight: {
    backgroundColor: 'rgba(248, 250, 252, 0.38)',
    position: 'absolute',
    zIndex: 4,
  },
  canopyShade: {
    backgroundColor: 'rgba(15, 23, 42, 0.26)',
    position: 'absolute',
    zIndex: 4,
  },
  selectRing: {
    borderColor: 'rgba(15, 118, 110, 0.65)',
    borderWidth: 2,
    position: 'absolute',
    zIndex: 5,
  },
  trunkWrap: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 1,
  },
  trunkSeg: {
    overflow: 'hidden',
  },
  trunkShade: {
    backgroundColor: 'rgba(28, 25, 23, 0.38)',
    bottom: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '40%',
  },
  trunkHighlight: {
    backgroundColor: 'rgba(248, 250, 252, 0.2)',
    borderRadius: 1,
    bottom: 2,
    left: 1,
    position: 'absolute',
    top: 1,
  },
  name: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 96,
    textAlign: 'center',
  },
  days: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
});
