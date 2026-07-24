import { useCallback, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { type Locale, t } from '../../../i18n';
import type { PatientMedication } from '../../../lib/api-types';
import {
  AddMedicationSheet,
  type MedicationSheetSubmit,
} from '../components/AddMedicationSheet';
import { MedicineDetailPanel } from '../components/MedicineDetailPanel';
import { MyMedicationsList } from '../components/MyMedicationsList';
import { TodayDosesSection } from '../components/TodayDosesSection';
import { useMarkDose } from '../hooks/useMarkDose';
import { useMedicineDetail } from '../hooks/useMedicineDetail';
import { useMedicines, useMyMedicationDetails } from '../hooks/useMedicines';
import { useRemoveMedication } from '../hooks/useRemoveMedication';
import { useSaveReminder } from '../hooks/useSaveReminder';
import { useTodayDoses } from '../hooks/useTodayDoses';
import { useUpdateMedication } from '../hooks/useUpdateMedication';

/** react-native-web's Alert.alert is a no-op — use window.confirm on web. */
function confirmDestructive(
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

interface MyMedicationsScreenProps {
  locale: Locale;
  onGoToSearch?: () => void;
}

/** Personal medications list only. */
export function MyMedicationsScreen({
  locale,
  onGoToSearch,
}: MyMedicationsScreenProps) {
  const [selectedMedicineId, setSelectedMedicineId] = useState<string | null>(
    null,
  );
  const [editing, setEditing] = useState<PatientMedication | null>(null);

  const {
    medicines,
    isLoading: listLoading,
    error: listError,
    refetch,
  } = useMedicines();
  const { detailsByMedicineId, isLoading: detailsLoading } =
    useMyMedicationDetails(medicines, locale);
  const { detail, isLoading: detailLoading, error: detailError } =
    useMedicineDetail(selectedMedicineId, locale);
  const {
    doses,
    isLoading: dosesLoading,
    error: dosesError,
    refetch: refetchDoses,
  } = useTodayDoses(locale);

  const refreshLists = useCallback(() => {
    refetch();
    void refetchDoses();
  }, [refetch, refetchDoses]);

  const { updateMedication, isUpdating, error: updateError } =
    useUpdateMedication();
  const { removeMedication, isRemoving, error: removeError } =
    useRemoveMedication(() => {
      setEditing(null);
      refreshLists();
    });
  const { saveReminder, isSaving: isSavingTimes, error: timesError } =
    useSaveReminder();
  const { markDose, pendingKey } = useMarkDose(() => {
    void refetchDoses();
  });

  const handleSubmitEdit = useCallback(
    async (payload: MedicationSheetSubmit) => {
      if (!editing) return;
      const { times_local, ...dosing } = payload;
      const ok = await updateMedication(editing.id, dosing);
      if (!ok) return;
      const timesOk = await saveReminder(editing.id, times_local);
      if (!timesOk) return;
      setEditing(null);
      refreshLists();
    },
    [editing, refreshLists, saveReminder, updateMedication],
  );

  const handleRemove = useCallback(
    (item: PatientMedication) => {
      const name =
        detailsByMedicineId[item.medicine_id]?.display_name ??
        t('medications.unknownName', locale);
      confirmDestructive(
        t('medications.removeConfirmTitle', locale),
        t('medications.removeConfirmMessage', locale).replace('{name}', name),
        t('medications.remove', locale),
        t('medications.cancel', locale),
        () => {
          void removeMedication(item.id);
        },
      );
    },
    [detailsByMedicineId, locale, removeMedication],
  );

  if (selectedMedicineId) {
    return (
      <View style={styles.container}>
        <MedicineDetailPanel
          locale={locale}
          detail={detail}
          isLoading={detailLoading}
          error={detailError}
          showAddButton={false}
          onBack={() => setSelectedMedicineId(null)}
        />
      </View>
    );
  }

  const editingDetail = editing
    ? detailsByMedicineId[editing.medicine_id]
    : undefined;
  const sheetError = updateError ?? timesError;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>{t('medications.myListTitle', locale)}</Text>
      <TodayDosesSection
        locale={locale}
        doses={doses}
        isLoading={dosesLoading}
        error={dosesError}
        pendingKey={pendingKey}
        onMark={(patientMedicationId, timeLocal, status) => {
          void markDose(patientMedicationId, timeLocal, status);
        }}
      />
      {removeError ? (
        <Text style={styles.removeError}>
          {t('medications.removeError', locale)}
        </Text>
      ) : null}
      <MyMedicationsList
        locale={locale}
        medicines={medicines}
        detailsByMedicineId={detailsByMedicineId}
        isLoading={listLoading || detailsLoading || isRemoving}
        error={listError}
        onSelectMedicine={setSelectedMedicineId}
        onEdit={setEditing}
        onRemove={handleRemove}
        onGoToSearch={onGoToSearch}
      />
      <AddMedicationSheet
        locale={locale}
        visible={editing !== null}
        medicineName={editingDetail?.display_name ?? ''}
        commonStrengths={editingDetail?.common_strengths ?? []}
        mode="edit"
        initialValues={
          editing
            ? {
                form: editing.form,
                dose_amount: editing.dose_amount,
                dose_unit: editing.dose_unit,
                frequency_code: editing.frequency_code,
                with_food: editing.with_food,
                times_local: editing.times_local ?? [],
              }
            : null
        }
        isSaving={isUpdating || isSavingTimes}
        saveError={sheetError}
        onClose={() => setEditing(null)}
        onSubmit={handleSubmitEdit}
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
  removeError: {
    color: '#b91c1c',
    fontSize: 14,
    marginBottom: 12,
  },
});
