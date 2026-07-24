import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { type Locale, t } from '../../../i18n';
import {
  AddMedicationSheet,
  type MedicationSheetSubmit,
} from '../components/AddMedicationSheet';
import { MedicineDetailPanel } from '../components/MedicineDetailPanel';
import { MedicineSearchSection } from '../components/MedicineSearchSection';
import { useAddMedication } from '../hooks/useAddMedication';
import { useMedicineDetail } from '../hooks/useMedicineDetail';
import { useMedicineSearch } from '../hooks/useMedicineSearch';
import { useSaveReminder } from '../hooks/useSaveReminder';

interface CatalogScreenProps {
  locale: Locale;
}

/** Catalog search + detail + add sheet. */
export function CatalogScreen({ locale }: CatalogScreenProps) {
  const [selectedMedicineId, setSelectedMedicineId] = useState<string | null>(
    null,
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  const { query, setQuery, results, isSearching, error: searchError, search } =
    useMedicineSearch(locale);
  const { detail, isLoading: detailLoading, error: detailError } =
    useMedicineDetail(selectedMedicineId, locale);

  const closeAfterAdd = useCallback(() => {
    setSheetOpen(false);
    setSelectedMedicineId(null);
  }, []);

  const { addMedication, isAdding, error: addError } = useAddMedication();
  const { saveReminder, isSaving: isSavingTimes, error: timesError } =
    useSaveReminder();

  const handleSubmitAdd = useCallback(
    async (payload: MedicationSheetSubmit) => {
      if (!selectedMedicineId) return;
      const { times_local, ...dosing } = payload;
      const created = await addMedication({
        ...dosing,
        medicine_id: selectedMedicineId,
      });
      if (!created) return;
      await saveReminder(created.id, times_local);
      closeAfterAdd();
    },
    [addMedication, closeAfterAdd, saveReminder, selectedMedicineId],
  );

  if (selectedMedicineId) {
    return (
      <View style={styles.container}>
        <MedicineDetailPanel
          locale={locale}
          detail={detail}
          isLoading={detailLoading}
          error={detailError}
          isAdding={false}
          addError={null}
          onBack={() => {
            setSheetOpen(false);
            setSelectedMedicineId(null);
          }}
          onAdd={() => setSheetOpen(true)}
        />
        <AddMedicationSheet
          locale={locale}
          visible={sheetOpen}
          medicineName={detail?.display_name ?? ''}
          commonStrengths={detail?.common_strengths ?? []}
          isSaving={isAdding || isSavingTimes}
          saveError={addError ?? timesError}
          onClose={() => setSheetOpen(false)}
          onSubmit={handleSubmitAdd}
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>{t('medications.searchTitle', locale)}</Text>
      <MedicineSearchSection
        locale={locale}
        query={query}
        onQueryChange={setQuery}
        onSearch={search}
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
});
