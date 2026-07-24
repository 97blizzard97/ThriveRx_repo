import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type Locale, t } from '../../../i18n';

interface LanguageSwitcherProps {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}

const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'zh', label: '中文' },
  { value: 'vi', label: 'Tiếng Việt' },
];

export function LanguageSwitcher({
  locale,
  onLocaleChange,
}: LanguageSwitcherProps) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      <Text style={styles.label}>{t('language.label', locale)}</Text>
      <View style={styles.options}>
        {LOCALE_OPTIONS.map((option) => {
          const active = locale === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onLocaleChange(option.value)}
              style={[styles.option, active && styles.optionActive]}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={option.label}
            >
              <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  label: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '500',
  },
  options: {
    flexDirection: 'row',
    gap: 6,
  },
  option: {
    borderColor: '#cbd5e1',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  optionActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  optionLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '500',
  },
  optionLabelActive: {
    color: '#fff',
  },
});
