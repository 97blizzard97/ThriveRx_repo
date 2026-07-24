import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { type Locale, t } from '../../../i18n';
import { PlanetView } from '../components/PlanetView';
import { TreeDetailSheet } from '../components/TreeDetailSheet';
import { useDailyPress } from '../hooks/useDailyPress';
import { useWorld } from '../hooks/useWorld';

interface WorldScreenProps {
  locale: Locale;
}

/** World / trees feature — planet view + daily press (collaborator 2). */
export function WorldScreen({ locale }: WorldScreenProps) {
  const { world, isLoading, error, refetch } = useWorld();
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);

  const handlePressSuccess = useCallback(() => {
    refetch();
  }, [refetch]);
  const { press, isPressing, error: pressError } = useDailyPress(handlePressSuccess);

  const selectedTree = useMemo(
    () => world?.trees.find((tree) => tree.patient_medication_id === selectedTreeId) ?? null,
    [world, selectedTreeId],
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>{t('world.loading', locale)}</Text>
      </View>
    );
  }

  if (error || !world) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>{t('world.apiUnknown', locale)}</Text>
      </View>
    );
  }

  if (world.trees.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.heading}>{t('world.title', locale)}</Text>
        <Text style={styles.hint}>{t('world.empty', locale)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{t('world.title', locale)}</Text>
      {world.world_expansion_level > 0 ? (
        <Text style={styles.growingBadge}>{t('world.growingHint', locale)}</Text>
      ) : null}
      <PlanetView trees={world.trees} onTreePress={setSelectedTreeId} />
      <Text style={styles.rotateHint}>{t('world.rotateHint', locale)}</Text>
      {selectedTree ? (
        <TreeDetailSheet
          locale={locale}
          tree={selectedTree}
          isPressing={isPressing}
          pressError={pressError}
          onPress={() => press(selectedTree.patient_medication_id)}
          onClose={() => setSelectedTreeId(null)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
  },
  growingBadge: {
    color: '#2e8b4f',
    fontSize: 13,
    marginBottom: 8,
  },
  rotateHint: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  hint: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
  },
});
