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
    backgroundColor: '#f0f4f8',
    borderBottomColor: '#c5d3e0',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  text: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
