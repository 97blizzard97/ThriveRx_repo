import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { type Locale, t } from '../../../i18n';
import type { TreeState } from '../../../lib/api-types';

interface TreeDetailSheetProps {
  locale: Locale;
  tree: TreeState;
  isPressing: boolean;
  pressError: Error | null;
  onPress: () => void;
  onClose: () => void;
}

/** Bottom panel for the currently-selected tree: stage info + daily press. */
export function TreeDetailSheet({
  locale,
  tree,
  isPressing,
  pressError,
  onPress,
  onClose,
}: TreeDetailSheetProps) {
  const stageLabel = t(`world.stage.${tree.growth_stage}`, locale);
  const speciesLabel = t(`world.species.${tree.species_key}`, locale);

  return (
    <View style={styles.sheet}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        accessibilityLabel={t('world.close', locale)}
      >
        <Text style={styles.closeText}>{t('world.close', locale)}</Text>
      </TouchableOpacity>
      <Text style={styles.title}>
        {speciesLabel} · {stageLabel}
      </Text>
      {tree.growth_stage === 'mature' ? (
        <Text style={styles.hint}>{t('world.matureHint', locale)}</Text>
      ) : (
        <Text style={styles.hint}>{t('world.treeGrowingHint', locale)}</Text>
      )}
      <TouchableOpacity
        style={[
          styles.pressButton,
          !tree.can_press_today && styles.pressButtonDone,
        ]}
        onPress={onPress}
        disabled={!tree.can_press_today || isPressing}
      >
        <Text style={styles.pressButtonText}>
          {isPressing
            ? t('world.press.pressing', locale)
            : tree.can_press_today
              ? t('world.press.button', locale)
              : t('world.press.done', locale)}
        </Text>
      </TouchableOpacity>
      {pressError ? (
        <Text style={styles.error}>{t('world.press.error', locale)}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    padding: 20,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  closeText: {
    color: '#64748b',
    fontSize: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  hint: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  pressButton: {
    backgroundColor: '#2e8b4f',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  pressButtonDone: {
    backgroundColor: '#94a3b8',
  },
  pressButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  error: {
    color: '#b91c1c',
    fontSize: 13,
    marginTop: 10,
  },
});
