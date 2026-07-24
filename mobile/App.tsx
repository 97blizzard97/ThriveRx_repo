import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AppShell } from './src/features/shared/navigation/AppShell';
import { DisclaimerBanner } from './src/features/shared/components/DisclaimerBanner';
import { LanguageSwitcher } from './src/features/shared/components/LanguageSwitcher';
import { type Locale } from './src/i18n';

export default function App() {
  const [locale, setLocale] = useState<Locale>('en');

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <DisclaimerBanner locale={locale} />
        <LanguageSwitcher locale={locale} onLocaleChange={setLocale} />
        <AppShell locale={locale} />
        <StatusBar style="auto" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
