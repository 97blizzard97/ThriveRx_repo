import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { GrowthStage } from '../../../lib/api-types';

interface TreeGlyphProps {
  growthStage: GrowthStage;
  medicineName: string;
  growthDays: number;
  selected?: boolean;
  onPress?: () => void;
}

const STAGE_SCALE: Record<GrowthStage, number> = {
  budding: 0.55,
  small: 0.75,
  large: 0.95,
  mature: 1.15,
};

const CANOPY: Record<GrowthStage, { width: number; height: number; color: string }> =
  {
    budding: { width: 22, height: 18, color: '#5eead4' },
    small: { width: 36, height: 28, color: '#2dd4bf' },
    large: { width: 52, height: 40, color: '#14b8a6' },
    mature: { width: 68, height: 52, color: '#0f766e' },
  };

/** Simple sprout/tree glyph sized by growth_stage (honest API stage). */
export function TreeGlyph({
  growthStage,
  medicineName,
  growthDays,
  selected = false,
  onPress,
}: TreeGlyphProps) {
  const scale = STAGE_SCALE[growthStage];
  const canopy = CANOPY[growthStage];
  const trunkHeight = 10 + Math.round(14 * scale);
  const trunkWidth = growthStage === 'budding' ? 4 : 6;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.wrap, selected && styles.wrapSelected]}
      accessibilityRole="button"
      accessibilityLabel={medicineName}
    >
      <View style={[styles.tree, { transform: [{ scale }] }]}>
        {growthStage === 'budding' ? (
          <View style={styles.sproutRow}>
            <View style={[styles.leaf, styles.leafLeft]} />
            <View style={[styles.leaf, styles.leafRight]} />
          </View>
        ) : (
          <View
            style={[
              styles.canopy,
              {
                width: canopy.width,
                height: canopy.height,
                backgroundColor: canopy.color,
                borderRadius: canopy.width / 2,
              },
            ]}
          />
        )}
        <View
          style={[
            styles.trunk,
            {
              width: trunkWidth,
              height: trunkHeight,
            },
          ]}
        />
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {medicineName}
      </Text>
      <Text style={styles.days}>{growthDays}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    minWidth: 88,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  wrapSelected: {
    backgroundColor: 'rgba(15, 118, 110, 0.08)',
    borderRadius: 12,
  },
  tree: {
    alignItems: 'center',
    height: 88,
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  sproutRow: {
    flexDirection: 'row',
    marginBottom: -2,
  },
  leaf: {
    backgroundColor: '#5eead4',
    borderRadius: 8,
    height: 14,
    width: 14,
  },
  leafLeft: {
    marginRight: -4,
    transform: [{ rotate: '-28deg' }],
  },
  leafRight: {
    marginLeft: -4,
    transform: [{ rotate: '28deg' }],
  },
  canopy: {
    marginBottom: -4,
  },
  trunk: {
    backgroundColor: '#78716c',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
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
