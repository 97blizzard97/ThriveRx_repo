import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { type Locale, t } from '../../../i18n';
import type {
  DoseUnit,
  FrequencyCode,
  MedicationForm,
  MedicineDetail,
  PatientMedication,
} from '../../../lib/api-types';

interface MyMedicationsListProps {
  locale: Locale;
  medicines: PatientMedication[];
  detailsByMedicineId: Record<string, MedicineDetail>;
  isLoading: boolean;
  error: Error | null;
  onSelectMedicine: (medicineId: string) => void;
  onEdit: (item: PatientMedication) => void;
  onRemove: (item: PatientMedication) => void;
  onGoToSearch?: () => void;
}

const FORM_KEYS = {
  tablet: 'medications.form.tablet',
  capsule: 'medications.form.capsule',
  liquid: 'medications.form.liquid',
  inhaler: 'medications.form.inhaler',
} as const;

const FREQ_KEYS = {
  od: 'medications.freq.od',
  bd: 'medications.freq.bd',
  tds: 'medications.freq.tds',
  qds: 'medications.freq.qds',
  mane: 'medications.freq.mane',
  nocte: 'medications.freq.nocte',
} as const;

const FREQ_ABBREV_KEYS = {
  od: 'medications.freqAbbrev.od',
  bd: 'medications.freqAbbrev.bd',
  tds: 'medications.freqAbbrev.tds',
  qds: 'medications.freqAbbrev.qds',
  mane: 'medications.freqAbbrev.mane',
  nocte: 'medications.freqAbbrev.nocte',
} as const;

function isMedicationForm(value: unknown): value is MedicationForm {
  return typeof value === 'string' && value in FORM_KEYS;
}

function isFrequencyCode(value: unknown): value is FrequencyCode {
  return typeof value === 'string' && value in FREQ_KEYS;
}

function isDoseUnit(value: unknown): value is DoseUnit {
  return (
    value === 'mg' ||
    value === 'g' ||
    value === 'mL' ||
    value === 'mcg' ||
    value === 'puff'
  );
}

function formLabel(locale: Locale, form: unknown): string {
  if (!isMedicationForm(form)) return '—';
  return t(FORM_KEYS[form], locale);
}

function frequencyLabel(locale: Locale, code: unknown): string {
  if (!isFrequencyCode(code)) return '—';
  return `${t(FREQ_KEYS[code], locale)} (${t(FREQ_ABBREV_KEYS[code], locale)})`;
}

function doseLabel(item: PatientMedication): string {
  const amount = item.dose_amount;
  const unit = item.dose_unit;
  if (typeof amount !== 'number' || !Number.isFinite(amount) || !isDoseUnit(unit)) {
    return '—';
  }
  return `${amount} ${unit}`;
}

export function MyMedicationsList({
  locale,
  medicines,
  detailsByMedicineId,
  isLoading,
  error,
  onSelectMedicine,
  onEdit,
  onRemove,
  onGoToSearch,
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
      <View style={styles.empty}>
        <Text style={styles.meta}>{t('medications.listEmpty', locale)}</Text>
        {onGoToSearch ? (
          <Pressable
            style={styles.emptyCta}
            onPress={onGoToSearch}
            accessibilityRole="button"
          >
            <Text style={styles.emptyCtaLabel}>
              {t('medications.goToSearch', locale)}
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <FlatList
      data={medicines}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      ListHeaderComponent={
        onGoToSearch ? (
          <Pressable
            style={styles.addButton}
            onPress={onGoToSearch}
            accessibilityRole="button"
          >
            <Text style={styles.addButtonLabel}>
              {t('medications.addFromSearch', locale)}
            </Text>
          </Pressable>
        ) : null
      }
      renderItem={({ item }) => {
        const name =
          detailsByMedicineId[item.medicine_id]?.display_name ??
          t('medications.unknownName', locale);
        const food =
          item.with_food === true
            ? t('medications.withFoodYes', locale)
            : item.with_food === false
              ? t('medications.withFoodNo', locale)
              : null;
        return (
          <View style={styles.row}>
            <Pressable
              onPress={() => onSelectMedicine(item.medicine_id)}
              accessibilityRole="button"
              accessibilityHint={t('medications.tapForDetail', locale)}
            >
              <Text style={styles.rowTitle}>{name}</Text>
              <Text style={styles.rowMeta}>
                {formLabel(locale, item.form)} · {doseLabel(item)}
              </Text>
              <Text style={styles.rowSchedule}>
                {frequencyLabel(locale, item.frequency_code)}
              </Text>
              {item.times_local && item.times_local.length > 0 ? (
                <Text style={styles.rowMeta}>{item.times_local.join(' · ')}</Text>
              ) : null}
              {food ? <Text style={styles.rowMeta}>{food}</Text> : null}
            </Pressable>
            <View style={styles.actions}>
              <Pressable
                onPress={() => onEdit(item)}
                accessibilityRole="button"
                hitSlop={8}
              >
                <Text style={styles.actionEdit}>
                  {t('medications.edit', locale)}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => onRemove(item)}
                accessibilityRole="button"
                hitSlop={8}
              >
                <Text style={styles.actionRemove}>
                  {t('medications.remove', locale)}
                </Text>
              </Pressable>
            </View>
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
  empty: {
    gap: 12,
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
  emptyCta: {
    alignSelf: 'flex-start',
    backgroundColor: '#0f766e',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  emptyCtaLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    alignSelf: 'flex-start',
    borderColor: '#0f766e',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonLabel: {
    color: '#0f766e',
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  rowMeta: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 2,
  },
  rowSchedule: {
    color: '#475569',
    fontSize: 13,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
  },
  actionEdit: {
    color: '#0f766e',
    fontSize: 14,
    fontWeight: '600',
  },
  actionRemove: {
    color: '#b91c1c',
    fontSize: 14,
    fontWeight: '600',
  },
});
