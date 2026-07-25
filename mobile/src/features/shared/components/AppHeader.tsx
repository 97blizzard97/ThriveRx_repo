import { StyleSheet, Text, View } from 'react-native';

import { type Locale, t } from '../../../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

interface AppHeaderProps {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}

/** Persistent brand header above all tabs. */
export function AppHeader({ locale, onLocaleChange }: AppHeaderProps) {
  return (
    <View style={styles.header} accessibilityRole="header">
      <View style={styles.brandRow}>
        <View style={styles.brandText}>
          <Text style={styles.title}>{t('app.title', locale)}</Text>
          <Text style={styles.subtitle}>{t('app.subtitle', locale)}</Text>
        </View>
        <LanguageSwitcher locale={locale} onLocaleChange={onLocaleChange} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#0f766e',
    borderBottomColor: '#0d9488',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  brandRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  brandText: {
    flex: 1,
    minWidth: 0,
    paddingRight: 4,
  },
  title: {
    color: '#f0fdfa',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subtitle: {
    color: '#ccfbf1',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
});
