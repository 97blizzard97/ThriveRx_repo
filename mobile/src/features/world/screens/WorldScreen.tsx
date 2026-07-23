import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { type Locale, t } from '../../../i18n';
import { apiGet } from '../../../lib/api';

interface WorldSummary {
  trees: unknown[];
  world_expansion_level: number;
}

interface WorldScreenProps {
  locale: Locale;
}

/** World / trees feature — growth UI + daily press (collaborator 2). */
export function WorldScreen({ locale }: WorldScreenProps) {
  const [treeCount, setTreeCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiGet<WorldSummary>('/api/v1/me/world')
      .then((data) => {
        if (!cancelled) setTreeCount(data.trees.length);
      })
      .catch(() => {
        if (!cancelled) setTreeCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{t('world.title', locale)}</Text>
      <Text style={styles.hint}>{t('world.stubHint', locale)}</Text>
      <Text style={styles.meta}>
        {treeCount === null
          ? t('world.apiUnknown', locale)
          : t('world.treeCount', locale, treeCount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  hint: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  meta: {
    color: '#475569',
    fontSize: 14,
  },
});
