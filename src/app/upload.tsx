import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppText, Button, PressableScale, Screen, ScreenHeader } from '@/components/ui';
import { draftStore, useAnalysisDraft } from '@/features/analysis/draft';
import { haptics } from '@/lib/haptics';
import { colors, layout, motion, radii, spacing } from '@/theme';

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 0.9,
  allowsEditing: false,
};

export default function UploadScreen() {
  const { image } = useAnalysisDraft();
  const [busy, setBusy] = useState<'library' | 'camera' | null>(null);
  const { width, height } = useWindowDimensions();

  const handleResult = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    draftStore.setImage({ uri: asset.uri, width: asset.width, height: asset.height });
    haptics.success();
  };

  const pickFromLibrary = async () => {
    setBusy('library');
    try {
      handleResult(await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS));
    } catch {
      Alert.alert('Galerie nicht verfügbar', 'Das Foto konnte nicht geladen werden. Bitte versuche es erneut.');
    } finally {
      setBusy(null);
    }
  };

  const takePhoto = async () => {
    setBusy('camera');
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Kamerazugriff benötigt',
          'Erlaube STORYTUNE den Zugriff auf die Kamera, um direkt ein Foto aufzunehmen.',
          [
            { text: 'Abbrechen', style: 'cancel' },
            ...(permission.canAskAgain ? [] : [{ text: 'Einstellungen', onPress: () => Linking.openSettings() }]),
          ],
        );
        return;
      }
      handleResult(await ImagePicker.launchCameraAsync(PICKER_OPTIONS));
    } catch {
      Alert.alert('Kamera nicht verfügbar', 'Auf diesem Gerät kann gerade kein Foto aufgenommen werden.');
    } finally {
      setBusy(null);
    }
  };

  const close = () => {
    draftStore.reset();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  // Preview size: keep aspect ratio, never taller than ~58% of the screen.
  const maxW = Math.min(width, layout.maxContentWidth) - spacing.gutter * 2;
  const maxH = height * 0.58;
  const ratio = image ? image.width / Math.max(image.height, 1) : 4 / 5;
  let previewW = maxW;
  let previewH = previewW / ratio;
  if (previewH > maxH) {
    previewH = maxH;
    previewW = previewH * ratio;
  }

  return (
    <Screen
      footer={
        image ? (
          <Button label="Weiter" size="lg" icon="arrow-right" fullWidth onPress={() => router.push('/effect')} />
        ) : null
      }>
      <ScreenHeader title="Neues Foto" leading="close" onLeadingPress={close} />

      {!image ? (
        <Animated.View entering={FadeInDown.duration(motion.slow)} style={styles.emptyWrap}>
          <PressableScale
            onPress={pickFromLibrary}
            scaleTo={0.985}
            accessibilityLabel="Foto aus der Galerie wählen"
            style={[styles.dropZone, { height: maxH }]}>
            <View style={styles.dropIcon}>
              <Feather name="image" size={28} color={colors.text} />
            </View>
            <AppText variant="title" align="center">
              Welches Foto wird deine Story?
            </AppText>
            <AppText variant="callout" tone="secondary" align="center" style={styles.dropHint}>
              JPG, PNG oder HEIC. Dein Foto bleibt auf deinem Gerät.
            </AppText>
          </PressableScale>

          <View style={styles.actions}>
            <Button
              label="Galerie"
              icon="grid"
              variant="secondary"
              size="lg"
              loading={busy === 'library'}
              disabled={busy !== null}
              onPress={pickFromLibrary}
              style={styles.flex}
            />
            <Button
              label="Kamera"
              icon="camera"
              variant="secondary"
              size="lg"
              loading={busy === 'camera'}
              disabled={busy !== null}
              onPress={takePhoto}
              style={styles.flex}
            />
          </View>
        </Animated.View>
      ) : (
        <Animated.View key={image.uri} entering={FadeIn.duration(motion.slow)} style={styles.previewWrap}>
          <Image
            source={{ uri: image.uri }}
            style={[styles.preview, { width: previewW, height: previewH }]}
            contentFit="cover"
            transition={motion.base}
            accessibilityLabel="Ausgewähltes Foto"
          />
          <View style={styles.actions}>
            <Button
              label="Foto tauschen"
              icon="refresh-cw"
              variant="secondary"
              disabled={busy !== null}
              onPress={pickFromLibrary}
              style={styles.flex}
            />
            <Button
              label="Kamera"
              icon="camera"
              variant="secondary"
              disabled={busy !== null}
              onPress={takePhoto}
              style={styles.flex}
            />
          </View>
        </Animated.View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyWrap: { gap: spacing.lg },
  dropZone: {
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xxl,
  },
  dropIcon: {
    width: 64,
    height: 64,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  dropHint: { maxWidth: 280 },
  previewWrap: { alignItems: 'center', gap: spacing.lg },
  preview: { borderRadius: radii.xl, backgroundColor: colors.surface },
  actions: { flexDirection: 'row', gap: spacing.md, alignSelf: 'stretch' },
  flex: { flex: 1 },
});
