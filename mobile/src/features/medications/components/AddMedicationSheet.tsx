import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { type Locale, t } from '../../../i18n';
import type {
  CommonStrength,
  DoseUnit,
  FrequencyCode,
  MedicationForm,
  PatientMedicationUpdate,
} from '../../../lib/api-types';
import { defaultTimesForFrequency } from '../../../lib/api-types';

const FORMS: MedicationForm[] = ['tablet', 'capsule', 'liquid', 'inhaler'];
const UNITS: DoseUnit[] = ['mg', 'g', 'mL', 'mcg', 'puff'];
const FREQUENCIES: FrequencyCode[] = [
  'od',
  'bd',
  'tds',
  'qds',
  'mane',
  'nocte',
];

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

const HHMM = /^([01]?\d|2[0-3]):([0-5]\d)$/;

function normalizeHhMm(raw: string): string | null {
  const trimmed = raw.trim();
  const match = HHMM.exec(trimmed);
  if (!match) return null;
  const hour = Number.parseInt(match[1], 10);
  const minute = Number.parseInt(match[2], 10);
  return `${hour.toString().padStart(2, '0')}:${minute
    .toString()
    .padStart(2, '0')}`;
}

export interface MedicationDosingValues {
  form: MedicationForm;
  dose_amount: number;
  dose_unit: DoseUnit;
  frequency_code: FrequencyCode;
  with_food: boolean | null;
  times_local: string[];
}

export interface MedicationSheetSubmit extends PatientMedicationUpdate {
  times_local: string[];
}

interface AddMedicationSheetProps {
  locale: Locale;
  visible: boolean;
  medicineName: string;
  commonStrengths: CommonStrength[];
  isSaving: boolean;
  saveError: Error | null;
  mode?: 'add' | 'edit';
  initialValues?: MedicationDosingValues | null;
  onClose: () => void;
  onSubmit: (payload: MedicationSheetSubmit) => Promise<void>;
}

export function AddMedicationSheet({
  locale,
  visible,
  medicineName,
  commonStrengths,
  isSaving,
  saveError,
  mode = 'add',
  initialValues = null,
  onClose,
  onSubmit,
}: AddMedicationSheetProps) {
  const [form, setForm] = useState<MedicationForm>('tablet');
  const [doseAmount, setDoseAmount] = useState('');
  const [doseUnit, setDoseUnit] = useState<DoseUnit>('mg');
  const [frequencyCode, setFrequencyCode] = useState<FrequencyCode>('od');
  const [withFood, setWithFood] = useState<boolean | null>(null);
  const [timesLocal, setTimesLocal] = useState<string[]>(
    defaultTimesForFrequency('od'),
  );
  const [customTime, setCustomTime] = useState('');

  useEffect(() => {
    if (!visible) return;
    if (mode === 'edit' && initialValues) {
      setForm(initialValues.form);
      setDoseAmount(String(initialValues.dose_amount));
      setDoseUnit(initialValues.dose_unit);
      setFrequencyCode(initialValues.frequency_code);
      setWithFood(initialValues.with_food);
      setTimesLocal(
        initialValues.times_local.length > 0
          ? [...initialValues.times_local]
          : defaultTimesForFrequency(initialValues.frequency_code),
      );
      setCustomTime('');
      return;
    }
    setForm('tablet');
    setDoseAmount('');
    setDoseUnit(
      commonStrengths[0]?.unit === 'mcg' || commonStrengths[0]?.unit === 'puff'
        ? (commonStrengths[0].unit as DoseUnit)
        : 'mg',
    );
    setFrequencyCode('od');
    setWithFood(null);
    setTimesLocal(defaultTimesForFrequency('od'));
    setCustomTime('');
  }, [visible, commonStrengths, mode, initialValues]);

  const selectFrequency = (code: FrequencyCode) => {
    setFrequencyCode(code);
    setTimesLocal(defaultTimesForFrequency(code));
  };

  const toggleSuggestedTime = (time: string) => {
    setTimesLocal((prev) =>
      prev.includes(time)
        ? prev.filter((item) => item !== time)
        : [...prev, time].sort(),
    );
  };

  const addCustomTime = () => {
    const normalized = normalizeHhMm(customTime);
    if (!normalized) return;
    setTimesLocal((prev) =>
      prev.includes(normalized) ? prev : [...prev, normalized].sort(),
    );
    setCustomTime('');
  };

  const parsedAmount = Number.parseFloat(doseAmount);
  const canSubmit =
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    timesLocal.length > 0 &&
    !isSaving;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await onSubmit({
      form,
      dose_amount: parsedAmount,
      dose_unit: doseUnit,
      frequency_code: frequencyCode,
      with_food: withFood,
      times_local: timesLocal,
    });
  };

  const titleKey =
    mode === 'edit'
      ? 'medications.editSheetTitle'
      : 'medications.addSheetTitle';
  const submitKey =
    mode === 'edit'
      ? isSaving
        ? 'medications.saving'
        : 'medications.saveChanges'
      : isSaving
        ? 'medications.adding'
        : 'medications.addToList';
  const errorKey =
    mode === 'edit' ? 'medications.editError' : 'medications.addError';

  const suggestions = defaultTimesForFrequency(frequencyCode);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{t(titleKey, locale)}</Text>
            <Pressable onPress={onClose} accessibilityRole="button">
              <Text style={styles.close}>{t('medications.cancel', locale)}</Text>
            </Pressable>
          </View>
          {medicineName ? (
            <Text style={styles.medicineName}>{medicineName}</Text>
          ) : null}

          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.sectionLabel}>
              {t('medications.formLabel', locale)}
            </Text>
            <View style={styles.chipRow}>
              {FORMS.map((value) => (
                <ChoiceChip
                  key={value}
                  label={t(FORM_KEYS[value], locale)}
                  selected={form === value}
                  onPress={() => setForm(value)}
                />
              ))}
            </View>

            <Text style={styles.sectionLabel}>
              {t('medications.doseLabel', locale)}
            </Text>
            <Text style={styles.hint}>
              {t('medications.strengthsHint', locale)}
            </Text>
            <View style={styles.doseRow}>
              <TextInput
                style={styles.doseInput}
                keyboardType="decimal-pad"
                value={doseAmount}
                onChangeText={setDoseAmount}
                placeholder="0"
                placeholderTextColor="#94a3b8"
              />
              <View style={styles.unitRow}>
                {UNITS.map((unit) => (
                  <ChoiceChip
                    key={unit}
                    label={unit}
                    selected={doseUnit === unit}
                    onPress={() => setDoseUnit(unit)}
                    compact
                  />
                ))}
              </View>
            </View>
            {commonStrengths.length > 0 ? (
              <View style={styles.chipRow}>
                {commonStrengths.map((strength) => {
                  const label = `${strength.amount} ${strength.unit}`;
                  const selected =
                    doseAmount === String(strength.amount) &&
                    doseUnit === strength.unit;
                  return (
                    <ChoiceChip
                      key={label}
                      label={label}
                      selected={selected}
                      onPress={() => {
                        setDoseAmount(String(strength.amount));
                        if (UNITS.includes(strength.unit as DoseUnit)) {
                          setDoseUnit(strength.unit as DoseUnit);
                        }
                      }}
                    />
                  );
                })}
              </View>
            ) : null}

            <Text style={styles.sectionLabel}>
              {t('medications.frequencyLabel', locale)}
            </Text>
            <View style={styles.freqList}>
              {FREQUENCIES.map((code) => (
                <Pressable
                  key={code}
                  style={[
                    styles.freqOption,
                    frequencyCode === code && styles.freqOptionSelected,
                  ]}
                  onPress={() => selectFrequency(code)}
                >
                  <Text
                    style={[
                      styles.freqPrimary,
                      frequencyCode === code && styles.freqPrimarySelected,
                    ]}
                  >
                    {t(FREQ_KEYS[code], locale)}
                  </Text>
                  <Text style={styles.freqAbbrev}>
                    {t(FREQ_ABBREV_KEYS[code], locale)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionLabel}>
              {t('medications.timesLabel', locale)}
            </Text>
            <Text style={styles.hint}>
              {t('medications.timesHint', locale)}
            </Text>
            <View style={styles.chipRow}>
              {suggestions.map((time) => (
                <ChoiceChip
                  key={time}
                  label={time}
                  selected={timesLocal.includes(time)}
                  onPress={() => toggleSuggestedTime(time)}
                  compact
                />
              ))}
            </View>
            <View style={styles.timeInputRow}>
              <TextInput
                style={styles.timeInput}
                value={customTime}
                onChangeText={setCustomTime}
                placeholder={t('medications.timesPlaceholder', locale)}
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable
                style={styles.timeAdd}
                onPress={addCustomTime}
                accessibilityRole="button"
              >
                <Text style={styles.timeAddLabel}>
                  {t('medications.timesAdd', locale)}
                </Text>
              </Pressable>
            </View>
            {timesLocal.length > 0 ? (
              <View style={styles.chipRow}>
                {timesLocal.map((time) => (
                  <ChoiceChip
                    key={`selected-${time}`}
                    label={time}
                    selected
                    onPress={() =>
                      setTimesLocal((prev) =>
                        prev.filter((item) => item !== time),
                      )
                    }
                    compact
                  />
                ))}
              </View>
            ) : (
              <Text style={styles.hint}>
                {t('medications.timesRequired', locale)}
              </Text>
            )}

            <Text style={styles.sectionLabel}>
              {t('medications.withFoodLabel', locale)}
            </Text>
            <View style={styles.chipRow}>
              <ChoiceChip
                label={t('medications.withFoodYes', locale)}
                selected={withFood === true}
                onPress={() => setWithFood(true)}
              />
              <ChoiceChip
                label={t('medications.withFoodNo', locale)}
                selected={withFood === false}
                onPress={() => setWithFood(false)}
              />
              <ChoiceChip
                label={t('medications.withFoodSkip', locale)}
                selected={withFood === null}
                onPress={() => setWithFood(null)}
              />
            </View>
          </ScrollView>

          <Pressable
            style={[styles.submit, !canSubmit && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            <Text style={styles.submitLabel}>{t(submitKey, locale)}</Text>
          </Pressable>
          {saveError ? (
            <Text style={styles.error}>{t(errorKey, locale)}</Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

interface ChoiceChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  compact?: boolean;
}

function ChoiceChip({ label, selected, onPress, compact }: ChoiceChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        compact && styles.chipCompact,
        selected && styles.chipSelected,
      ]}
    >
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '92%',
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  close: {
    color: '#0f766e',
    fontSize: 15,
    fontWeight: '600',
  },
  medicineName: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 12,
  },
  body: {
    paddingBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  hint: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipCompact: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  chipSelected: {
    backgroundColor: '#0f766e',
  },
  chipLabel: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '500',
  },
  chipLabelSelected: {
    color: '#fff',
  },
  doseRow: {
    gap: 10,
  },
  doseInput: {
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  unitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  freqList: {
    gap: 6,
  },
  freqOption: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  freqOptionSelected: {
    backgroundColor: '#ecfdf5',
    borderColor: '#0f766e',
  },
  freqPrimary: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '500',
  },
  freqPrimarySelected: {
    color: '#0f766e',
    fontWeight: '600',
  },
  freqAbbrev: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '400',
  },
  timeInputRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  timeInput: {
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  timeAdd: {
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  timeAddLabel: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '600',
  },
  submit: {
    alignItems: 'center',
    backgroundColor: '#0f766e',
    borderRadius: 8,
    marginTop: 8,
    paddingVertical: 14,
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#b91c1c',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
