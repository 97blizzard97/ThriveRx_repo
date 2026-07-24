import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { type Locale, t } from '../../../i18n';
import { MedicineDetailPanel } from '../components/MedicineDetailPanel';
import { MedicineSearchSection } from '../components/MedicineSearchSection';
import { MyMedicationsList } from '../components/MyMedicationsList';
import { useAddMedication } from '../hooks/useAddMedication';
import { useMedicineDetail } from '../hooks/useMedicineDetail';
import { useMedicineSearch } from '../hooks/useMedicineSearch';
import {
  useMedicines,
  useMyMedicationDetails,
} from '../hooks/useMedicines';

interface MedicationsScreenProps {
  locale: Locale;
}

/** Med core — search, detail, add to list, my medicines (A–D). */
export function MedicationsScreen({ locale }: MedicationsScreenProps) {
  const [selectedMedicineId, setSelectedMedicineId] = useState<string | null>(
    null,
  );

  const {
    medicines,
    isLoading: listLoading,
    error: listError,
    refetch,
  } = useMedicines();
  const { detailsByMedicineId, isLoading: detailsLoading } =
    useMyMedicationDetails(medicines);

  const { query, setQuery, results, isSearching, error: searchError, search } =
    useMedicineSearch();
  const { detail, isLoading: detailLoading, error: detailError } =
    useMedicineDetail(selectedMedicineId);

  const handleAddSuccess = useCallback(() => {
    refetch();
    setSelectedMedicineId(null);
  }, [refetch]);

  const { addMedication, isAdding, error: addError } =
    useAddMedication(handleAddSuccess);

  const handleAdd = useCallback(async () => {
    if (!selectedMedicineId) return;
    await addMedication({ medicine_id: selectedMedicineId });
  }, [addMedication, selectedMedicineId]);

  if (selectedMedicineId) {
    return (
      <View style={styles.container}>
        <MedicineDetailPanel
          locale={locale}
          detail={detail}
          isLoading={detailLoading}
          error={detailError}
          isAdding={isAdding}
          addError={addError}
          onBack={() => setSelectedMedicineId(null)}
          onAdd={handleAdd}
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>{t('medications.title', locale)}</Text>
      <Text style={styles.sectionTitle}>
        {t('medications.myListTitle', locale)}
      </Text>
      <MyMedicationsList
        locale={locale}
        medicines={medicines}
        detailsByMedicineId={detailsByMedicineId}
        isLoading={listLoading || detailsLoading}
        error={listError}
      />
      <MedicineSearchSection
        locale={locale}
        query={query}
        onQueryChange={setQuery}
        onSearch={() => search()}
        results={results}
        isSearching={isSearching}
        error={searchError}
        onSelect={setSelectedMedicineId}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
});
