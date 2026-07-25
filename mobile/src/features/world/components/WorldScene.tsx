import { useMemo, useRef } from 'react';
import {
  Animated,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { type Locale, t } from '../../../i18n';
import type { TreeState } from '../../../lib/api-types';
import type { SkyPalette } from '../hooks/useSkyPeriod';
import { forestSlot } from '../utils/forestLayout';
import { treePaletteFromId } from '../utils/treeColor';
import { TreeGlyph } from './TreeGlyph';

/**
 * Local Earth disc texture (NASA Visible Earth “Blue Marble” land_shallow_topo).
 * Public-domain U.S. government work — https://visibleearth.nasa.gov/
 * Bundled for Expo offline/demo; not a full-screen wallpaper.
 */
const EARTH_TEXTURE = require('../../../../assets/world/earth.jpg');

interface WorldSceneProps {
  locale: Locale;
  trees: TreeState[];
  nameByPatientMedId: Record<string, string>;
  selectedId: string | null;
  sky: SkyPalette;
  onSelectTree: (tree: TreeState) => void;
  onGoToSearch?: () => void;
}

const PLANET_SIZE = 248;
const SPIN_SIZE = PLANET_SIZE + 200;
const TREE_SLOT = 96;
/** Slot centre so the trunk (inward edge) sits on the planet rim. */
const ORBIT_RADIUS = PLANET_SIZE / 2 + TREE_SLOT / 2 - 14;
/** Degrees of rotation per pixel of horizontal drag. */
const DRAG_SENSITIVITY = 0.42;

const SUN_SIZE = 28;
const MOON_SIZE = 18;

/** Soft sun/moon disc + glow in the sky (does not rotate with the planet). */
function CelestialBody({ sky }: { sky: SkyPalette }) {
  const { kind, x, elevation, opacity } = sky.celestial;
  if (kind === 'none' || opacity <= 0) return null;

  const size = kind === 'sun' ? SUN_SIZE : MOON_SIZE;
  const glow = kind === 'sun' ? size * 2.4 : size * 1.8;
  // Keep body in the upper sky band; elevation 0 ≈ above planet rim.
  const leftPct = 8 + x * 76;
  const topPct = 6 + (1 - elevation) * 28;

  const coreColor =
    kind === 'sun'
      ? sky.period === 'dusk'
        ? '#fbbf24'
        : sky.period === 'dawn'
          ? '#fde68a'
          : '#fef9c3'
      : '#e2e8f0';
  const glowColor =
    kind === 'sun'
      ? sky.period === 'dusk'
        ? 'rgba(251, 191, 36, 0.28)'
        : 'rgba(254, 243, 199, 0.35)'
      : 'rgba(226, 232, 240, 0.18)';

  return (
    <View
      pointerEvents="none"
      style={[
        styles.celestialAnchor,
        {
          left: `${leftPct}%`,
          top: `${topPct}%`,
          opacity,
        },
      ]}
    >
      <View
        style={[
          styles.celestialGlow,
          {
            width: glow,
            height: glow,
            marginLeft: -glow / 2,
            marginTop: -glow / 2,
            borderRadius: glow / 2,
            backgroundColor: glowColor,
          },
        ]}
      />
      <View
        style={[
          styles.celestialCore,
          {
            width: size,
            height: size,
            marginLeft: -size / 2,
            marginTop: -size / 2,
            borderRadius: size / 2,
            backgroundColor: coreColor,
          },
        ]}
      />
    </View>
  );
}

/** Rotatable little planet — forest grove on the rim, sky from local clock. */
export function WorldScene({
  locale,
  trees,
  nameByPatientMedId,
  selectedId,
  sky,
  onSelectTree,
  onGoToSearch,
}: WorldSceneProps) {
  const fallbackName = t('medications.unknownName', locale);
  const rotation = useRef(new Animated.Value(0)).current;
  const dragStartRotation = useRef(0);
  const lastVelocity = useRef(0);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 6 || Math.abs(gesture.dy) > 6,
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          Math.abs(gesture.dx) > 10,
        onPanResponderGrant: () => {
          rotation.stopAnimation((value) => {
            dragStartRotation.current = value;
            rotation.setValue(value);
          });
        },
        onPanResponderMove: (_, gesture) => {
          lastVelocity.current = gesture.vx;
          rotation.setValue(
            dragStartRotation.current + gesture.dx * DRAG_SENSITIVITY,
          );
        },
        onPanResponderRelease: () => {
          const velocity = lastVelocity.current * DRAG_SENSITIVITY * 18;
          if (Math.abs(velocity) > 8) {
            Animated.decay(rotation, {
              velocity,
              deceleration: 0.994,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [rotation],
  );

  const spin = rotation.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg'],
    extrapolate: 'extend',
  });

  const empty = trees.length === 0;
  const slotOrigin = SPIN_SIZE / 2 - TREE_SLOT / 2;
  const count = trees.length;

  return (
    <View style={styles.scene}>
      <View style={styles.skyStack} pointerEvents="none">
        <View style={[styles.skyBand, { flex: 1.15, backgroundColor: sky.bands[0] }]} />
        <View style={[styles.skyBand, { flex: 1, backgroundColor: sky.bands[1] }]} />
        <View style={[styles.skyBand, { flex: 0.95, backgroundColor: sky.bands[2] }]} />
      </View>

      <CelestialBody sky={sky} />

      <View style={styles.stage} {...panResponder.panHandlers}>
        <Animated.View
          style={[styles.planetSpin, { transform: [{ rotate: spin }] }]}
        >
          {/* Soft atmosphere halo behind the disc */}
          <View
            style={[
              styles.atmosphereHalo,
              { shadowColor: sky.planetRim, borderColor: sky.planetRim },
            ]}
            pointerEvents="none"
          />

          <View
            style={[
              styles.planet,
              {
                borderColor: sky.planetRim,
                shadowColor: sky.planetRim,
              },
            ]}
          >
            <Image
              source={EARTH_TEXTURE}
              style={styles.earthTexture}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
            {/* Spherical cue: soft terminator + limb darkening */}
            <View style={styles.terminator} pointerEvents="none" />
            <View style={styles.terminatorSoft} pointerEvents="none" />
            <View style={styles.limbDarken} pointerEvents="none" />
            <View style={styles.planetSheen} pointerEvents="none" />
          </View>

          {trees.map((tree, index) => {
            const id = String(tree.patient_medication_id);
            const { angleDeg, radius } = forestSlot(index, count, ORBIT_RADIUS);
            const rad = (angleDeg * Math.PI) / 180;
            const x = Math.sin(rad) * radius;
            const y = -Math.cos(rad) * radius;
            const palette = treePaletteFromId(id);

            return (
              <View
                key={id}
                style={[
                  styles.treeSlot,
                  {
                    left: slotOrigin,
                    top: slotOrigin,
                    transform: [
                      { translateX: x },
                      { translateY: y },
                      { rotate: `${angleDeg}deg` },
                    ],
                  },
                ]}
              >
                <TreeGlyph
                  growthStage={tree.growth_stage}
                  medicineName={nameByPatientMedId[id] ?? fallbackName}
                  growthDays={tree.accumulated_growth_days}
                  palette={palette}
                  selected={selectedId === id}
                  planetMode
                  onPress={() => onSelectTree(tree)}
                />
              </View>
            );
          })}
        </Animated.View>

        {empty ? (
          <View style={styles.emptyOverlay} pointerEvents="box-none">
            <Text style={[styles.emptyTitle, { color: sky.ink }]}>
              {t('world.empty', locale)}
            </Text>
            {onGoToSearch ? (
              <Pressable style={styles.searchCta} onPress={onGoToSearch}>
                <Text style={styles.searchCtaLabel}>
                  {t('world.goToSearch', locale)}
                </Text>
              </Pressable>
            ) : (
              <Text style={[styles.emptyHint, { color: sky.inkMuted }]}>
                {t('world.goToSearchHint', locale)}
              </Text>
            )}
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.hint, { color: sky.inkMuted }]}>
          {t('world.colorLegend', locale)}
        </Text>
        {!empty ? (
          <>
            <Text style={[styles.hint, { color: sky.inkMuted }]}>
              {t('world.dragHint', locale)}
            </Text>
            <Text style={[styles.hint, { color: sky.inkMuted }]}>
              {t('world.tapTreeHint', locale)}
            </Text>
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    flex: 1,
    minHeight: 320,
    overflow: 'hidden',
  },
  skyStack: {
    ...StyleSheet.absoluteFillObject,
  },
  skyBand: {
    width: '100%',
  },
  celestialAnchor: {
    position: 'absolute',
    zIndex: 1,
  },
  celestialGlow: {
    position: 'absolute',
  },
  celestialCore: {
    position: 'absolute',
  },
  stage: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    zIndex: 2,
  },
  atmosphereHalo: {
    backgroundColor: 'transparent',
    borderRadius: (PLANET_SIZE + 28) / 2,
    borderWidth: 1,
    height: PLANET_SIZE + 28,
    left: (SPIN_SIZE - (PLANET_SIZE + 28)) / 2,
    opacity: 0.55,
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 22,
    top: (SPIN_SIZE - (PLANET_SIZE + 28)) / 2,
    width: PLANET_SIZE + 28,
    zIndex: 0,
  },
  planetSpin: {
    alignItems: 'center',
    height: SPIN_SIZE,
    justifyContent: 'center',
    width: SPIN_SIZE,
  },
  planet: {
    backgroundColor: '#0c4a6e',
    borderRadius: PLANET_SIZE / 2,
    borderWidth: 3,
    elevation: 10,
    height: PLANET_SIZE,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    width: PLANET_SIZE,
    zIndex: 1,
  },
  earthTexture: {
    // Crop equirectangular map toward a hemisphere-like framing
    height: PLANET_SIZE * 1.35,
    left: -PLANET_SIZE * 0.12,
    position: 'absolute',
    top: -PLANET_SIZE * 0.18,
    width: PLANET_SIZE * 1.55,
  },
  terminator: {
    backgroundColor: 'rgba(15, 23, 42, 0.22)',
    bottom: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '38%',
  },
  terminatorSoft: {
    backgroundColor: 'rgba(15, 23, 42, 0.12)',
    bottom: 0,
    position: 'absolute',
    right: '28%',
    top: 0,
    width: '18%',
  },
  limbDarken: {
    ...StyleSheet.absoluteFillObject,
    borderColor: 'rgba(15, 23, 42, 0.2)',
    borderRadius: PLANET_SIZE / 2,
    borderWidth: 12,
  },
  planetSheen: {
    backgroundColor: 'rgba(248, 250, 252, 0.16)',
    borderRadius: 90,
    height: 110,
    left: 32,
    position: 'absolute',
    top: 24,
    width: 78,
  },
  treeSlot: {
    alignItems: 'center',
    height: TREE_SLOT,
    justifyContent: 'flex-end',
    position: 'absolute',
    width: TREE_SLOT,
    zIndex: 2,
  },
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  searchCta: {
    backgroundColor: '#0f766e',
    borderRadius: 10,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchCtaLabel: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    gap: 2,
    paddingBottom: 10,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
});
