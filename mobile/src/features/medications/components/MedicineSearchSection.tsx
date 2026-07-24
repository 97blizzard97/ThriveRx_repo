import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { type Locale, t } from '../../../i18n';
import type { MedicineSummary } from '../../../lib/api-types';

interface MedicineSearchSectionProps {
  locale: Locale;
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  results: MedicineSummary[];
  isSearching: boolean;
  error: Error | null;
  onSelect: (medicineId: string) => void;
}

export function MedicineSearchSection({
  locale,
  query,
  onQueryChange,
  onSearch,
  results,
  isSearching,
  error,
  onSelect,
}: MedicineSearchSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {t('medications.searchTitle', locale)}
      </Text>
      <View style={styles.searchRow}>
        <TextInput
          value={query}
          onChangeText={onQueryChange}
          placeholder={t('medications.searchPlaceholder', locale)}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          onSubmitEditing={onSearch}
          returnKeyType="search"
        />
        <Pressable style={styles.searchButton} onPress={onSearch}>
          <Text style={styles.searchButtonLabel}>
            {t('medications.searchButton', locale)}
          </Text>
        </Pressable>
      </View>
      {isSearching ? (
        <ActivityIndicator style={styles.spinner} />
      ) : null}
      {error ? (
        <Text style={styles.error}>{t('medications.searchError', locale)}</Text>
      ) : null}
      {!isSearching && results.length === 0 && query.trim().length > 0 ? (
        <Text style={styles.meta}>{t('medications.searchEmpty', locale)}</Text>
      ) : null}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Pressable style={styles.resultRow} onPress={() => onSelect(item.id)}>
            <Text style={styles.resultTitle}>{item.display_name}</Text>
            <Text style={styles.resultHint}>
              {t('medications.tapForDetail', locale)}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchButton: {
    alignItems: 'center',
    backgroundColor: '#0f766e',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  searchButtonLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  spinner: {
    marginTop: 12,
  },
  error: {
    color: '#b91c1c',
    fontSize: 14,
    marginTop: 8,
  },
  meta: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 8,
  },
  resultRow: {
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultHint: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
});
