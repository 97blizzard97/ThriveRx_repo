import { StyleSheet, Text, View } from 'react-native';

import { type Locale, t } from '../../../i18n';
import { useMedicines } from '../hooks/useMedicines';

interface MedicationsScreenProps {
  locale: Locale;
}

/** Med core feature — lookup, scan, list, reminders (collaborator 1). */
export function MedicationsScreen({ locale }: MedicationsScreenProps) {
  const { medicines, isLoading } = useMedicines();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{t('medications.title', locale)}</Text>
      <Text style={styles.hint}>{t('medications.stubHint', locale)}</Text>
      <Text style={styles.meta}>
        {isLoading
          ? t('medications.loading', locale)
          : t('medications.count', locale, medicines.length)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  hint: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  meta: {
    color: '#475569',
    fontSize: 14,
  },
});
