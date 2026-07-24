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
import { DemoGrowthPanel } from '../components/DemoGrowthPanel';
import { TreeDetailSheet } from '../components/TreeDetailSheet';
import { WorldScene } from '../components/WorldScene';
import { useDailyPress } from '../hooks/useDailyPress';
import { useDemoAdvance } from '../hooks/useDemoAdvance';
import { useDemoReset } from '../hooks/useDemoReset';
import { useSkyPeriod } from '../hooks/useSkyPeriod';
import { useWorld } from '../hooks/useWorld';

interface WorldScreenProps {
  locale: Locale;
  onGoToSearch?: () => void;
}

/** World / trees — little planet, growth days, optional fallback daily press. */
export function WorldScreen({ locale, onGoToSearch }: WorldScreenProps) {
  const { world, isLoading, error, refetch } = useWorld();
  const { medicines } = useMedicines();
  const { detailsByMedicineId } = useMyMedicationDetails(medicines, locale);
  const [selected, setSelected] = useState<TreeState | null>(null);
  const sky = useSkyPeriod();

  const { press, pendingId } = useDailyPress(() => {
    refetch();
  });

  const { advance, isPending: demoAdvancePending } = useDemoAdvance(() => {
    refetch();
  });

  const { reset, isPending: demoResetPending } = useDemoReset(() => {
    refetch();
  });

  const demoPending = demoAdvancePending || demoResetPending;

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

  const handleDemoApply = useCallback(
    async (days: number) => {
      const result = await advance(days);
      if (result) {
        setSelected(null);
      }
    },
    [advance],
  );

  const handleDemoReset = useCallback(async () => {
    const result = await reset();
    if (result) {
      setSelected(null);
    }
  }, [reset]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: sky.bands[1] }]}>
        <Text style={[styles.heading, { color: sky.ink }]}>
          {t('world.title', locale)}
        </Text>
        <ActivityIndicator color="#0f766e" style={styles.loader} />
      </View>
    );
  }

  if (error || !world) {
    return (
      <View style={[styles.container, { backgroundColor: sky.bands[1] }]}>
        <Text style={[styles.heading, { color: sky.ink }]}>
          {t('world.title', locale)}
        </Text>
        <Text style={styles.error}>{t('world.loadError', locale)}</Text>
        <Pressable style={styles.retryBtn} onPress={refetch}>
          <Text style={styles.retryLabel}>{t('world.retry', locale)}</Text>
        </Pressable>
      </View>
    );
  }

  const treeCount = world.trees.length;

  return (
    <View style={[styles.container, { backgroundColor: sky.bands[0] }]}>
      <View style={styles.header}>
        <Text style={[styles.heading, { color: sky.ink }]}>
          {t('world.title', locale)}
        </Text>
        {treeCount > 0 ? (
          <Text style={[styles.subtitle, { color: sky.inkMuted }]}>
            {t('world.growthLead', locale, treeCount)}
          </Text>
        ) : null}
      </View>
      {treeCount > 0 ? (
        <DemoGrowthPanel
          locale={locale}
          isPending={demoPending}
          onApply={(days) => {
            void handleDemoApply(days);
          }}
          onReset={() => {
            void handleDemoReset();
          }}
        />
      ) : null}
      <WorldScene
        locale={locale}
        trees={world.trees}
        nameByPatientMedId={nameByPatientMedId}
        selectedId={
          selected ? String(selected.patient_medication_id) : null
        }
        sky={sky}
        onSelectTree={handleSelect}
        onGoToSearch={onGoToSearch}
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
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 1,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 2,
  },
  loader: {
    marginTop: 32,
  },
  error: {
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 20,
    marginHorizontal: 16,
    marginTop: 12,
  },
  retryBtn: {
    alignSelf: 'flex-start',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 8,
  },
  retryLabel: {
    color: '#0f766e',
    fontSize: 15,
    fontWeight: '600',
  },
});
