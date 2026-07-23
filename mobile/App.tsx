import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';

import { AppShell } from './src/features/shared/navigation/AppShell';
import { DisclaimerBanner } from './src/features/shared/components/DisclaimerBanner';

export default function App() {
  const locale = 'en';

  return (
    <SafeAreaView style={styles.root}>
      <DisclaimerBanner locale={locale} />
      <AppShell locale={locale} />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
