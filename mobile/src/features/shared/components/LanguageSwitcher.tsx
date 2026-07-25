import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type Locale } from '../../../i18n';

interface LanguageSwitcherProps {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}

const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'zh', label: '中文' },
  { value: 'vi', label: 'VI' },
];

export function LanguageSwitcher({
  locale,
  onLocaleChange,
}: LanguageSwitcherProps) {
  return (
    <View style={styles.options} accessibilityRole="radiogroup">
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
            <Text
              style={[styles.optionLabel, active && styles.optionLabelActive]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  options: {
    flexDirection: 'row',
    flexShrink: 0,
    gap: 4,
  },
  option: {
    borderColor: 'rgba(204, 251, 241, 0.45)',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  optionActive: {
    backgroundColor: '#f0fdfa',
    borderColor: '#f0fdfa',
  },
  optionLabel: {
    color: '#ccfbf1',
    fontSize: 12,
    fontWeight: '600',
  },
  optionLabelActive: {
    color: '#0f766e',
  },
});
