import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { type Locale, t } from '../../../i18n';

/** Snap marks for portfolio demo fast-forward (engagement days to add). */
const DEMO_DAY_MARKS = [14, 60, 180] as const;

interface DemoGrowthPanelProps {
  locale: Locale;
  disabled?: boolean;
  isPending: boolean;
  onApply: (days: number) => void;
  onReset: () => void;
}

/** react-native-web's Alert.alert is a no-op — use window.confirm on web. */
function confirmReset(
  title: string,
  message: string,
  confirmLabel: string,
  cancelLabel: string,
  onConfirm: () => void,
): void {
  if (Platform.OS === 'web') {
    const ok =
      typeof globalThis.confirm === 'function' &&
      globalThis.confirm(`${title}\n\n${message}`);
    if (ok) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelLabel, style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}

/** Demo-only garden fast-forward + reset — clearly labeled, not clinical. */
export function DemoGrowthPanel({
  locale,
  disabled = false,
  isPending,
  onApply,
  onReset,
}: DemoGrowthPanelProps) {
  const [days, setDays] = useState<(typeof DEMO_DAY_MARKS)[number]>(60);

  return (
    <View style={styles.panel} accessibilityLabel={t('world.demo.label', locale)}>
      <View style={styles.badgeRow}>
        <Text style={styles.badge}>{t('world.demo.label', locale)}</Text>
        <Text style={styles.title}>{t('world.demo.title', locale)}</Text>
      </View>
      <Text style={styles.hint}>{t('world.demo.hint', locale)}</Text>
      <View style={styles.marks}>
        {DEMO_DAY_MARKS.map((mark) => {
          const selected = days === mark;
          return (
            <Pressable
              key={mark}
              style={[styles.mark, selected && styles.markSelected]}
              disabled={disabled || isPending}
              onPress={() => setDays(mark)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text
                style={[styles.markLabel, selected && styles.markLabelSelected]}
              >
                {t('world.demo.daysMark', locale, mark)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        style={[
          styles.applyBtn,
          (disabled || isPending) && styles.applyBtnDisabled,
        ]}
        disabled={disabled || isPending}
        onPress={() => onApply(days)}
        accessibilityRole="button"
      >
        {isPending ? (
          <ActivityIndicator color="#f8fafc" />
        ) : (
          <Text style={styles.applyLabel}>
            {t('world.demo.apply', locale, days)}
          </Text>
        )}
      </Pressable>
      <Pressable
        style={[
          styles.resetBtn,
          (disabled || isPending) && styles.applyBtnDisabled,
        ]}
        disabled={disabled || isPending}
        onPress={() =>
          confirmReset(
            t('world.demo.resetConfirmTitle', locale),
            t('world.demo.resetConfirmMessage', locale),
            t('world.demo.reset', locale),
            t('world.demo.resetCancel', locale),
            onReset,
          )
        }
        accessibilityRole="button"
      >
        <Text style={styles.resetLabel}>{t('world.demo.reset', locale)}</Text>
      </Pressable>
      <Text style={styles.note}>{t('world.demo.note', locale)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginHorizontal: 10,
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    zIndex: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  badge: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: '#fde68a',
    backgroundColor: 'rgba(120, 53, 15, 0.55)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
    overflow: 'hidden',
  },
  title: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  hint: {
    fontSize: 10,
    color: '#cbd5e1',
    marginBottom: 4,
  },
  marks: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  mark: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.5)',
  },
  markSelected: {
    backgroundColor: 'rgba(15, 118, 110, 0.85)',
    borderColor: '#5eead4',
  },
  markLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  markLabelSelected: {
    color: '#ecfdf5',
  },
  applyBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
    borderRadius: 6,
    backgroundColor: '#0f766e',
    paddingHorizontal: 10,
  },
  applyBtnDisabled: {
    opacity: 0.55,
  },
  applyLabel: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '600',
  },
  resetBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 30,
    marginTop: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.55)',
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
    paddingHorizontal: 10,
  },
  resetLabel: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '600',
  },
  note: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 13,
    color: '#94a3b8',
  },
});
