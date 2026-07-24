import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CatalogScreen } from '../../medications/screens/CatalogScreen';
import { MyMedicationsScreen } from '../../medications/screens/MyMedicationsScreen';
import { WorldScreen } from '../../world/screens/WorldScreen';
import { type Locale, t } from '../../../i18n';

export type AppTab = 'search' | 'myList' | 'world';

interface AppShellProps {
  locale?: Locale;
}

export function AppShell({ locale = 'en' }: AppShellProps) {
  const [tab, setTab] = useState<AppTab>('search');

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        {tab === 'search' ? (
          <CatalogScreen locale={locale} />
        ) : tab === 'myList' ? (
          <MyMedicationsScreen
            locale={locale}
            onGoToSearch={() => setTab('search')}
          />
        ) : (
          <WorldScreen locale={locale} />
        )}
      </View>
      <View style={styles.tabBar}>
        <TabButton
          label={t('nav.search', locale)}
          active={tab === 'search'}
          onPress={() => setTab('search')}
        />
        <TabButton
          label={t('nav.myList', locale)}
          active={tab === 'myList'}
          onPress={() => setTab('myList')}
        />
        <TabButton
          label={t('nav.world', locale)}
          active={tab === 'world'}
          onPress={() => setTab('world')}
        />
      </View>
    </View>
  );
}

interface TabButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function TabButton({ label, active, onPress }: TabButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tab, active && styles.tabActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    borderTopColor: '#e2e8f0',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 12,
  },
  tabActive: {
    backgroundColor: '#f8fafc',
  },
  tabLabel: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#0f172a',
    fontWeight: '600',
  },
});
