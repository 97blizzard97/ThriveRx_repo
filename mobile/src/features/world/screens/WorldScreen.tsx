import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { type Locale, t } from '../../../i18n';
import type { TreeState } from '../../../lib/api-types';
import {
  useMedicines,
  useMyMedicationDetails,
} from '../../medications/hooks/useMedicines';
import { TreeDetailSheet } from '../components/TreeDetailSheet';
import { WorldScene } from '../components/WorldScene';
import { useDailyPress } from '../hooks/useDailyPress';
import { useWorld } from '../hooks/useWorld';

interface WorldScreenProps {
  locale: Locale;
  onGoToSearch?: () => void;
}

/** World / trees — scene, growth days, optional fallback daily press. */
export function WorldScreen({ locale, onGoToSearch }: WorldScreenProps) {
  const { world, isLoading, error, refetch } = useWorld();
  const { medicines } = useMedicines();
  const { detailsByMedicineId } = useMyMedicationDetails(medicines, locale);
  const [selected, setSelected] = useState<TreeState | null>(null);

  const { press, pendingId } = useDailyPress(() => {
    refetch();
  });

  const nameByPatientMedId = useMemo(() => {
    const map: Record<string, string> = {};
    for (const med of medicines) {
      const name =
        detailsByMedicineId[med.medicine_id]?.display_name ??
        t('medications.unknownName', locale);
      map[med.id] = name;
    }
    return map;
  }, [medicines, detailsByMedicineId, locale]);

  const selectedName = selected
    ? (nameByPatientMedId[String(selected.patient_medication_id)] ??
      t('medications.unknownName', locale))
    : '';

  const handleSelect = useCallback((tree: TreeState) => {
    setSelected(tree);
  }, []);

  const handlePressToday = useCallback(async () => {
    if (!selected) return;
    const id = String(selected.patient_medication_id);
    const result = await press(id);
    if (result) {
      setSelected(result.tree);
    }
  }, [selected, press]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>{t('world.title', locale)}</Text>
        <ActivityIndicator color="#0f766e" style={styles.loader} />
      </View>
    );
  }

  if (error || !world) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>{t('world.title', locale)}</Text>
        <Text style={styles.error}>{t('world.loadError', locale)}</Text>
        <Pressable style={styles.retryBtn} onPress={refetch}>
          <Text style={styles.retryLabel}>{t('world.retry', locale)}</Text>
        </Pressable>
      </View>
    );
  }

  if (world.trees.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>{t('world.title', locale)}</Text>
        <View style={styles.emptyScene}>
          <View style={styles.emptySky} />
          <View style={styles.emptyGround}>
            <Text style={styles.emptyTitle}>{t('world.empty', locale)}</Text>
            {onGoToSearch ? (
              <Pressable style={styles.searchCta} onPress={onGoToSearch}>
                <Text style={styles.searchCtaLabel}>
                  {t('world.goToSearch', locale)}
                </Text>
              </Pressable>
            ) : (
              <Text style={styles.emptyHint}>
                {t('world.goToSearchHint', locale)}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{t('world.title', locale)}</Text>
      <Text style={styles.subtitle}>
        {t('world.growthLead', locale, world.trees.length)}
      </Text>
      <WorldScene
        locale={locale}
        trees={world.trees}
        nameByPatientMedId={nameByPatientMedId}
        selectedId={
          selected ? String(selected.patient_medication_id) : null
        }
        onSelectTree={handleSelect}
      />
      <TreeDetailSheet
        locale={locale}
        tree={selected}
        medicineName={selectedName}
        visible={selected !== null}
        isPressing={
          selected !== null &&
          pendingId === String(selected.patient_medication_id)
        }
        onClose={() => setSelected(null)}
        onPressToday={() => {
          void handlePressToday();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heading: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 12,
  },
  loader: {
    marginTop: 32,
  },
  error: {
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  retryBtn: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingVertical: 8,
  },
  retryLabel: {
    color: '#0f766e',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyScene: {
    borderRadius: 16,
    flex: 1,
    marginTop: 8,
    overflow: 'hidden',
  },
  emptySky: {
    backgroundColor: '#e0f2fe',
    flex: 1,
  },
  emptyGround: {
    alignItems: 'center',
    backgroundColor: '#99f6e4',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  emptyTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    textAlign: 'center',
  },
  emptyHint: {
    color: '#0f766e',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  searchCta: {
    backgroundColor: '#0f766e',
    borderRadius: 10,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchCtaLabel: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
  },
});
