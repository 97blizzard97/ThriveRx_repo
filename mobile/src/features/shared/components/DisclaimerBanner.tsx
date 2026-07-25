import { StyleSheet, Text, View } from 'react-native';

import { type Locale, t } from '../../../i18n';

interface DisclaimerBannerProps {
  locale?: Locale;
}

export function DisclaimerBanner({ locale = 'en' }: DisclaimerBannerProps) {
  return (
    <View style={styles.banner} accessibilityRole="text">
      <Text style={styles.text}>{t('disclaimer.general', locale)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#f8fafc',
    borderTopColor: '#e2e8f0',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  text: {
    color: '#64748b',
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
  },
});
