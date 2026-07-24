import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { type Locale, t } from '../../../i18n';
import type { DoseStatus, TodayDoseMedication } from '../../../lib/api-types';

interface TodayDosesSectionProps {
  locale: Locale;
  doses: TodayDoseMedication[];
  isLoading: boolean;
  error: Error | null;
  pendingKey: string | null;
  onMark: (
    patientMedicationId: string,
    timeLocal: string,
    status: DoseStatus,
  ) => void;
}

export function TodayDosesSection({
  locale,
  doses,
  isLoading,
  error,
  pendingKey,
  onMark,
}: TodayDosesSectionProps) {
  if (isLoading) {
    return (
      <View style={styles.block}>
        <Text style={styles.heading}>{t('medications.todayTitle', locale)}</Text>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.block}>
        <Text style={styles.heading}>{t('medications.todayTitle', locale)}</Text>
        <Text style={styles.error}>{t('medications.todayError', locale)}</Text>
      </View>
    );
  }

  if (doses.length === 0) {
    return null;
  }

  const anyCanGrow = doses.some((d) => d.can_grow_today && !d.all_taken);

  return (
    <View style={styles.block}>
      <Text style={styles.heading}>{t('medications.todayTitle', locale)}</Text>
      {anyCanGrow ? (
        <Text style={styles.softHint}>
          {t('medications.treeCanGrow', locale)}
        </Text>
      ) : null}
      {doses.map((med) => (
        <View key={med.patient_medication_id} style={styles.medCard}>
          <Text style={styles.medName}>{med.display_name}</Text>
          <Text style={styles.prompt}>
            {t('medications.haveYouTaken', locale).replace(
              '{name}',
              med.display_name,
            )}
          </Text>
          {med.slots.map((slot) => {
            const key = `${med.patient_medication_id}:${slot.time_local}`;
            const busy = pendingKey === key;
            return (
              <View key={slot.time_local} style={styles.slotRow}>
                <Text style={styles.slotTime}>{slot.time_local}</Text>
                <View style={styles.slotActions}>
                  <Pressable
                    style={[
                      styles.slotBtn,
                      slot.status === 'taken' && styles.slotBtnTaken,
                    ]}
                    disabled={busy}
                    onPress={() =>
                      onMark(
                        med.patient_medication_id,
                        slot.time_local,
                        'taken',
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.slotBtnLabel,
                        slot.status === 'taken' && styles.slotBtnLabelActive,
                      ]}
                    >
                      {t('medications.taken', locale)}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.slotBtn,
                      slot.status === 'skipped' && styles.slotBtnSkipped,
                    ]}
                    disabled={busy}
                    onPress={() =>
                      onMark(
                        med.patient_medication_id,
                        slot.time_local,
                        'skipped',
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.slotBtnLabel,
                        slot.status === 'skipped' && styles.slotBtnLabelActive,
                      ]}
                    >
                      {t('medications.skip', locale)}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
          {med.all_taken ? (
            <Text style={styles.doneNote}>
              {t('medications.allTakenToday', locale)}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  softHint: {
    color: '#0f766e',
    fontSize: 13,
    marginBottom: 10,
  },
  error: {
    color: '#b91c1c',
    fontSize: 14,
  },
  medCard: {
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 12,
    paddingTop: 4,
  },
  medName: {
    fontSize: 16,
    fontWeight: '600',
  },
  prompt: {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 8,
    marginTop: 2,
  },
  slotRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  slotTime: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '500',
    minWidth: 56,
  },
  slotActions: {
    flexDirection: 'row',
    gap: 8,
  },
  slotBtn: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  slotBtnTaken: {
    backgroundColor: '#0f766e',
  },
  slotBtnSkipped: {
    backgroundColor: '#94a3b8',
  },
  slotBtnLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  slotBtnLabelActive: {
    color: '#fff',
  },
  doneNote: {
    color: '#0f766e',
    fontSize: 12,
    marginTop: 8,
  },
});
