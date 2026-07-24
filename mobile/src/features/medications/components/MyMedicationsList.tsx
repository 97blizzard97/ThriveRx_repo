import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { type Locale, t } from '../../../i18n';
import type { MedicineDetail, PatientMedication } from '../../../lib/api-types';

interface MyMedicationsListProps {
  locale: Locale;
  medicines: PatientMedication[];
  detailsByMedicineId: Record<string, MedicineDetail>;
  isLoading: boolean;
  error: Error | null;
}

export function MyMedicationsList({
  locale,
  medicines,
  detailsByMedicineId,
  isLoading,
  error,
}: MyMedicationsListProps) {
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.meta}>{t('medications.loading', locale)}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <Text style={styles.error}>{t('medications.listError', locale)}</Text>
    );
  }

  if (medicines.length === 0) {
    return (
      <Text style={styles.meta}>{t('medications.listEmpty', locale)}</Text>
    );
  }

  return (
    <FlatList
      data={medicines}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      renderItem={({ item }) => {
        const name =
          detailsByMedicineId[item.medicine_id]?.display_name ??
          t('medications.unknownName', locale);
        return (
          <View style={styles.row}>
            <Text style={styles.rowTitle}>{name}</Text>
            <Text style={styles.rowMeta}>
              {t('medications.addedLabel', locale)}
            </Text>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  meta: {
    color: '#64748b',
    fontSize: 14,
  },
  error: {
    color: '#b91c1c',
    fontSize: 14,
  },
  row: {
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  rowMeta: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
});
