import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { type Locale, t } from '../../../i18n';
import type { MedicineDetail } from '../../../lib/api-types';

interface MedicineDetailPanelProps {
  locale: Locale;
  detail: MedicineDetail | null;
  isLoading: boolean;
  error: Error | null;
  isAdding?: boolean;
  addError?: Error | null;
  showAddButton?: boolean;
  onBack: () => void;
  onAdd?: () => void;
}

export function MedicineDetailPanel({
  locale,
  detail,
  isLoading,
  error,
  isAdding = false,
  addError = null,
  showAddButton = true,
  onBack,
  onAdd,
}: MedicineDetailPanelProps) {
  return (
    <View style={styles.panel}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backLabel}>{t('medications.back', locale)}</Text>
      </Pressable>
      {isLoading ? (
        <ActivityIndicator style={styles.spinner} />
      ) : error ? (
        <Text style={styles.error}>{t('medications.detailError', locale)}</Text>
      ) : detail ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{detail.display_name}</Text>
          {!detail.translation_reviewed ? (
            <Text style={styles.translationNote}>
              {t('medications.translationNote', locale)}
            </Text>
          ) : null}
          <DetailBlock
            label={t('medications.whatFor', locale)}
            body={detail.what_its_for}
          />
          <DetailBlock
            label={t('medications.howTaken', locale)}
            body={detail.how_usually_taken}
          />
          <DetailBlock
            label={t('medications.sideEffects', locale)}
            body={detail.common_side_effects}
          />
          <DetailBlock
            label={t('medications.pharmacistIf', locale)}
            body={detail.check_with_pharmacist_if}
          />
          {showAddButton && onAdd ? (
            <Pressable
              style={[styles.addButton, isAdding && styles.addButtonDisabled]}
              onPress={onAdd}
              disabled={isAdding}
            >
              <Text style={styles.addButtonLabel}>
                {isAdding
                  ? t('medications.adding', locale)
                  : t('medications.addToList', locale)}
              </Text>
            </Pressable>
          ) : null}
          {addError ? (
            <Text style={styles.error}>{t('medications.addError', locale)}</Text>
          ) : null}
        </ScrollView>
      ) : null}
    </View>
  );
}

interface DetailBlockProps {
  label: string;
  body: string;
}

function DetailBlock({ label, body }: DetailBlockProps) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockLabel}>{label}</Text>
      <Text style={styles.blockBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
  },
  backButton: {
    marginBottom: 8,
  },
  backLabel: {
    color: '#0f766e',
    fontSize: 16,
    fontWeight: '600',
  },
  spinner: {
    marginTop: 24,
  },
  content: {
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  translationNote: {
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    color: '#92400e',
    fontSize: 12,
    marginBottom: 12,
    padding: 8,
  },
  block: {
    marginBottom: 14,
  },
  blockLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  blockBody: {
    color: '#334155',
    fontSize: 15,
    lineHeight: 22,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: '#0f766e',
    borderRadius: 8,
    marginTop: 8,
    paddingVertical: 14,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#b91c1c',
    fontSize: 14,
    marginTop: 8,
  },
});
