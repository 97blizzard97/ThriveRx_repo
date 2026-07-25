import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { type Locale, t } from '../../../i18n';
import type { ScanMatch } from '../../../lib/api-types';
import { useScanScript } from '../hooks/useScanScript';

interface ScriptScanSectionProps {
  locale: Locale;
  onSelectMatch: (medicineId: string) => void;
}

export function ScriptScanSection({
  locale,
  onSelectMatch,
}: ScriptScanSectionProps) {
  const { scan, clear, isScanning, error, matches, extractedText } =
    useScanScript();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [textHint, setTextHint] = useState('');

  async function pickImage(fromCamera: boolean) {
    clear();
    if (fromCamera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        return;
      }
    } else {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        return;
      }
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.75,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.75,
        });

    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const uri = asset.uri;
    const mimeType = asset.mimeType ?? 'image/jpeg';
    const fileName = asset.fileName ?? 'script.jpg';
    setImageUri(uri);
    // Auto-scan Australian script / label as soon as a photo is chosen.
    await scan({
      uri,
      mimeType,
      fileName,
      textHint,
    });
  }

  async function runScan() {
    await scan({
      uri: imageUri,
      mimeType: 'image/jpeg',
      fileName: 'script.jpg',
      textHint,
    });
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('scan.title', locale)}</Text>
      <Text style={styles.hint}>{t('scan.hint', locale)}</Text>

      <View style={styles.row}>
        <Pressable
          style={styles.secondaryBtn}
          onPress={() => void pickImage(false)}
          disabled={isScanning}
        >
          <Text style={styles.secondaryLabel}>
            {t('scan.pickPhoto', locale)}
          </Text>
        </Pressable>
        <Pressable
          style={styles.secondaryBtn}
          onPress={() => void pickImage(true)}
          disabled={isScanning}
        >
          <Text style={styles.secondaryLabel}>
            {t('scan.takePhoto', locale)}
          </Text>
        </Pressable>
      </View>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      ) : null}

      {isScanning ? (
        <View style={styles.scanningRow}>
          <ActivityIndicator />
          <Text style={styles.scanningLabel}>{t('scan.scanning', locale)}</Text>
        </View>
      ) : null}

      <Text style={styles.label}>{t('scan.textHintLabel', locale)}</Text>
      <TextInput
        value={textHint}
        onChangeText={setTextHint}
        placeholder={t('scan.textHintPlaceholder', locale)}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />

      <Pressable
        style={[styles.primaryBtn, isScanning && styles.disabled]}
        onPress={() => void runScan()}
        disabled={isScanning || (!imageUri && !textHint.trim())}
      >
        <Text style={styles.primaryLabel}>
          {isScanning ? t('scan.scanning', locale) : t('scan.submit', locale)}
        </Text>
      </Pressable>

      {error ? (
        <Text style={styles.error}>{t('scan.error', locale)}</Text>
      ) : null}

      {extractedText ? (
        <Text style={styles.meta}>
          {t('scan.extracted', locale)}: {extractedText}
        </Text>
      ) : null}

      {!isScanning &&
      matches.length === 0 &&
      (imageUri || textHint.trim()) ? (
        <Text style={styles.meta}>{t('scan.empty', locale)}</Text>
      ) : null}

      {matches.map((match: ScanMatch) => (
        <Pressable
          key={match.medicine_id}
          style={styles.matchRow}
          onPress={() => onSelectMatch(match.medicine_id)}
        >
          <Text style={styles.matchTitle}>{match.display_name}</Text>
          <Text style={styles.matchMeta}>
            {t('scan.confidence', locale, Math.round(match.confidence * 100))}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 28,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  hint: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  secondaryBtn: {
    flex: 1,
    alignItems: 'center',
    borderColor: '#0f766e',
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 10,
  },
  secondaryLabel: {
    color: '#0f766e',
    fontWeight: '600',
    fontSize: 13,
  },
  preview: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#e2e8f0',
  },
  scanningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  scanningLabel: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '600',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  primaryBtn: {
    alignItems: 'center',
    backgroundColor: '#0f766e',
    borderRadius: 8,
    paddingVertical: 12,
  },
  primaryLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
  error: {
    color: '#b91c1c',
    fontSize: 13,
    marginTop: 8,
  },
  meta: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 8,
  },
  matchRow: {
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  matchMeta: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
});
