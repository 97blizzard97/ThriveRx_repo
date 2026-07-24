import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import WebView, { type WebViewMessageEvent } from 'react-native-webview';

import type { TreeState } from '../../../lib/api-types';
import { buildPlanetHtml, buildSetMarkersMessage } from '../lib/planetHtml';

interface PlanetViewProps {
  trees: TreeState[];
  onTreePress: (patientMedicationId: string) => void;
}

interface IncomingMessage {
  type: string;
  patientMedicationId?: string;
}

/** Rotatable 3D planet (Three.js in a WebView) with one marker per tree. */
export function PlanetView({ trees, onTreePress }: PlanetViewProps) {
  const webviewRef = useRef<WebView>(null);
  // Built once — later tree updates are pushed via postMessage so the
  // user's current rotation isn't reset by a WebView reload.
  const initialHtml = useMemo(() => buildPlanetHtml(trees), []);

  useEffect(() => {
    webviewRef.current?.postMessage(buildSetMarkersMessage(trees));
  }, [trees]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as IncomingMessage;
      if (message.type === 'treeTap' && message.patientMedicationId) {
        onTreePress(message.patientMedicationId);
      }
    } catch {
      // ignore malformed messages from the webview
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        source={{ html: initialHtml }}
        onMessage={handleMessage}
        originWhitelist={['*']}
        style={styles.webview}
        scrollEnabled={false}
        bounces={false}
        allowsInlineMediaPlayback
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1021',
    borderRadius: 16,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
