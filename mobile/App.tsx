import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from './src/features/shared/components/AppHeader';
import { AppShell } from './src/features/shared/navigation/AppShell';
import { type Locale } from './src/i18n';

export default function App() {
  const [locale, setLocale] = useState<Locale>('en');

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <SafeAreaView style={styles.topSafe} edges={['top', 'left', 'right']}>
          <AppHeader locale={locale} onLocaleChange={setLocale} />
        </SafeAreaView>
        <SafeAreaView style={styles.bodySafe} edges={['bottom', 'left', 'right']}>
          <AppShell locale={locale} />
        </SafeAreaView>
        <StatusBar style="light" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topSafe: {
    backgroundColor: '#0f766e',
  },
  bodySafe: {
    backgroundColor: '#fff',
    flex: 1,
  },
});
