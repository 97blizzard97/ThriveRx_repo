import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { type Locale, t } from '../../../i18n';
import type { TreeState } from '../../../lib/api-types';

interface TreeDetailSheetProps {
  locale: Locale;
  tree: TreeState | null;
  medicineName: string;
  visible: boolean;
  isPressing: boolean;
  onClose: () => void;
  onPressToday: () => void;
}

const STAGE_KEYS = {
  budding: 'world.stage.budding',
  small: 'world.stage.small',
  large: 'world.stage.large',
  mature: 'world.stage.mature',
} as const;

const SPECIES_KEYS = {
  oak: 'world.species.oak',
  maple: 'world.species.maple',
  birch: 'world.species.birch',
  willow: 'world.species.willow',
  cedar: 'world.species.cedar',
} as const;

function speciesLabel(speciesKey: string, locale: Locale): string {
  const key = SPECIES_KEYS[speciesKey as keyof typeof SPECIES_KEYS];
  if (key) return t(key, locale);
  return speciesKey;
}

/** Detail panel for one tree — days first, honest stage, optional daily press. */
export function TreeDetailSheet({
  locale,
  tree,
  medicineName,
  visible,
  isPressing,
  onClose,
  onPressToday,
}: TreeDetailSheetProps) {
  if (!tree) return null;

  const stageKey = STAGE_KEYS[tree.growth_stage];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{medicineName}</Text>
          <Text style={styles.species}>
            {speciesLabel(tree.species_key, locale)}
          </Text>

          <Text style={styles.daysHero}>
            {t('world.growthDays', locale, tree.accumulated_growth_days)}
          </Text>
          <Text style={styles.stage}>{t(stageKey, locale)}</Text>

          {tree.can_press_today ? (
            <>
              <Text style={styles.hint}>{t('world.canPressHint', locale)}</Text>
              <Pressable
                style={[styles.pressBtn, isPressing && styles.pressBtnBusy]}
                disabled={isPressing}
                onPress={onPressToday}
                accessibilityRole="button"
              >
                <Text style={styles.pressBtnLabel}>
                  {isPressing
                    ? t('world.pressing', locale)
                    : t('world.pressCta', locale)}
                </Text>
              </Pressable>
            </>
          ) : (
            <Text style={styles.hint}>{t('world.alreadyPressed', locale)}</Text>
          )}

          <Text style={styles.pause}>{t('world.pauseNote', locale)}</Text>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeLabel}>{t('world.close', locale)}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '700',
  },
  species: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 4,
  },
  daysHero: {
    color: '#0f766e',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
  },
  stage: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '500',
    marginTop: 4,
  },
  hint: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 14,
  },
  pressBtn: {
    alignItems: 'center',
    backgroundColor: '#0f766e',
    borderRadius: 10,
    marginTop: 14,
    paddingVertical: 12,
  },
  pressBtnBusy: {
    opacity: 0.7,
  },
  pressBtnLabel: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  pause: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 16,
  },
  closeBtn: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  closeLabel: {
    color: '#0f766e',
    fontSize: 15,
    fontWeight: '600',
  },
});
