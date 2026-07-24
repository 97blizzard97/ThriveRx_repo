import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { type Locale, t } from '../../../i18n';
import type { TreeState } from '../../../lib/api-types';
import { TreeGlyph } from './TreeGlyph';

interface WorldSceneProps {
  locale: Locale;
  trees: TreeState[];
  nameByPatientMedId: Record<string, string>;
  selectedId: string | null;
  onSelectTree: (tree: TreeState) => void;
}

/** Full-bleed sky/ground scene with trees in a row (scrolls when many). */
export function WorldScene({
  locale,
  trees,
  nameByPatientMedId,
  selectedId,
  onSelectTree,
}: WorldSceneProps) {
  const fallbackName = t('medications.unknownName', locale);

  return (
    <View style={styles.scene}>
      <View style={styles.skyTop} />
      <View style={styles.skyMid} />
      <View style={styles.horizon} />
      <View style={styles.ground}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.treeRow}
        >
          {trees.map((tree) => {
            const id = String(tree.patient_medication_id);
            return (
              <TreeGlyph
                key={id}
                growthStage={tree.growth_stage}
                medicineName={nameByPatientMedId[id] ?? fallbackName}
                growthDays={tree.accumulated_growth_days}
                selected={selectedId === id}
                onPress={() => onSelectTree(tree)}
              />
            );
          })}
        </ScrollView>
        <Text style={styles.groundHint}>{t('world.tapTreeHint', locale)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    borderRadius: 16,
    flex: 1,
    minHeight: 280,
    overflow: 'hidden',
  },
  skyTop: {
    backgroundColor: '#bae6fd',
    flex: 1.1,
  },
  skyMid: {
    backgroundColor: '#e0f2fe',
    flex: 0.7,
  },
  horizon: {
    backgroundColor: '#ccfbf1',
    height: 28,
  },
  ground: {
    backgroundColor: '#99f6e4',
    justifyContent: 'flex-end',
    minHeight: 160,
    paddingBottom: 12,
  },
  treeRow: {
    alignItems: 'flex-end',
    flexGrow: 1,
    justifyContent: 'center',
    minWidth: '100%',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  groundHint: {
    color: '#0f766e',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.85,
    textAlign: 'center',
  },
});
