import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Linking, Pressable, StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from "@rneui/themed";
import { Camera, RefreshCw, X } from "lucide-react-native";
import { callback } from "react-native-nitro-modules";
import {
  NativePreviewView,
  useCamera,
  useCameraDevice,
  useCameraDevices,
  useCameraPermission,
  usePhotoOutput,
  usePreviewOutput,
} from "react-native-vision-camera";

import type { RootStackParamList } from "../../navigation/types";
import { colors } from "../../theme/appTheme";

type Props = NativeStackScreenProps<RootStackParamList, "Scan">;

type CameraPreviewProps = {
  device: (ReturnType<typeof useCameraDevices>[number]);
  photoOutput: ReturnType<typeof usePhotoOutput>;
  previewOutput: ReturnType<typeof usePreviewOutput>;
};

function CameraPreview({ device, photoOutput, previewOutput }: CameraPreviewProps) {
  const hybridRef = useMemo(() => callback(() => {}), []);

  useCamera({
    isActive: true,
    device,
    outputs: [photoOutput, previewOutput],
  });

  return (
    <NativePreviewView
      style={StyleSheet.absoluteFill}
      previewOutput={previewOutput}
      hybridRef={hybridRef}
      resizeMode="cover"
      implementationMode="compatible"
    />
  );
}

export function ScanScreen({ navigation }: Props) {
  const { hasPermission, canRequestPermission, requestPermission } = useCameraPermission();
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPath, setCapturedPath] = useState<string | null>(null);

  const backDevice = useCameraDevice("back");
  const devices = useCameraDevices();
  const selectedDevice = backDevice ?? devices[0];

  const photoOutput = usePhotoOutput();
  const previewOutput = usePreviewOutput();

  const requestCameraAccess = useCallback(async () => {
    if (!canRequestPermission) {
      Alert.alert("Camera permission blocked", "Enable camera access from Settings to scan your fridge.");
      return;
    }

    setIsRequestingPermission(true);
    try {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert("Camera permission required", "Grant camera access to scan and capture your fridge.");
      }
    } finally {
      setIsRequestingPermission(false);
    }
  }, [canRequestPermission, requestPermission]);

  useEffect(() => {
    if (!hasPermission && canRequestPermission) {
      requestCameraAccess();
    }
  }, [canRequestPermission, hasPermission, requestCameraAccess]);

  const takePhoto = useCallback(async () => {
    setIsCapturing(true);
    try {
      const photo = await photoOutput.capturePhotoToFile({ flashMode: "off" }, {});
      setCapturedPath(photo.filePath);
    } catch {
      Alert.alert("Capture failed", "Could not capture photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  }, [photoOutput]);

  const openSettings = useCallback(async () => {
    try {
      await Linking.openSettings();
    } catch {
      Alert.alert("Unable to open settings", "Please open Settings manually and enable camera access.");
    }
  }, []);

  const retake = useCallback(() => {
    setCapturedPath(null);
  }, []);

  const continueToResults = useCallback(() => {
    navigation.replace("ScanResults");
  }, [navigation]);

  if (capturedPath) {
    return (
      <View style={styles.root}>
        <View style={styles.topRow}>
          <Pressable style={styles.softBtn} onPress={navigation.goBack}>
            <X size={18} color="#F4FFF8" />
          </Pressable>
          <Text style={styles.liveText}>Preview</Text>
          <View style={styles.sideSpacer} />
        </View>

        <View style={styles.previewFrame}>
          <Image source={{ uri: `file://${capturedPath}` }} style={styles.previewImage} resizeMode="cover" />
        </View>

        <View style={styles.bottomActions}>
          <Pressable style={styles.secondaryAction} onPress={retake}>
            <RefreshCw size={15} color={colors.text} />
            <Text style={styles.secondaryActionText}>Retake</Text>
          </Pressable>
          <Pressable style={styles.primaryAction} onPress={continueToResults}>
            <Text style={styles.primaryActionText}>Continue</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.root}>
        <View style={styles.topRow}>
          <Pressable style={styles.softBtn} onPress={navigation.goBack}>
            <X size={18} color="#F4FFF8" />
          </Pressable>
          <Text style={styles.liveText}>Camera Access</Text>
          <View style={styles.sideSpacer} />
        </View>

        <View style={styles.permissionCard}>
          <Camera size={34} color={colors.primary} />
          <Text style={styles.permissionTitle}>Allow camera access</Text>
          <Text style={styles.permissionText}>We need your camera to scan your fridge and capture ingredients.</Text>

          <Pressable
            style={[styles.primaryAction, isRequestingPermission && styles.actionDisabled]}
            onPress={requestCameraAccess}
            disabled={isRequestingPermission}
          >
            {isRequestingPermission ? (
              <ActivityIndicator color="#F4FFF8" />
            ) : (
              <Text style={styles.primaryActionText}>Grant Permission</Text>
            )}
          </Pressable>

          {!canRequestPermission ? (
            <Pressable style={styles.secondaryAction} onPress={openSettings}>
              <Text style={styles.secondaryActionText}>Open Settings</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }

  if (!selectedDevice) {
    return (
      <View style={styles.root}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.permissionText}>Waiting for camera device...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CameraPreview device={selectedDevice} photoOutput={photoOutput} previewOutput={previewOutput} />

      <View style={styles.topRow}>
        <Pressable style={styles.softBtn} onPress={() => navigation.goBack()}>
          <X size={18} color="#F4FFF8" />
        </Pressable>
        <Text style={styles.liveText}>AI Vision · Live</Text>
        <View style={styles.sideSpacer} />
      </View>

      <View style={styles.captureBar}>
        <Text style={styles.captureHint}>Frame your fridge and tap capture</Text>
        <Pressable
          style={[styles.captureButton, isCapturing && styles.actionDisabled]}
          onPress={takePhoto}
          disabled={isCapturing}
        >
          {isCapturing ? <ActivityIndicator color="#F4FFF8" /> : <Text style={styles.captureButtonText}>Capture</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#07110C",
    paddingHorizontal: 18,
    paddingTop: 44,
    paddingBottom: 20,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  softBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  liveText: {
    color: "#D6FCE6",
    fontSize: 11,
    fontWeight: "700",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  sideSpacer: {
    width: 40,
  },
  centerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  captureBar: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(0,0,0,0.45)",
    padding: 14,
    gap: 10,
  },
  captureHint: {
    color: "#ECFFF3",
    fontSize: 13,
    textAlign: "center",
  },
  captureButton: {
    backgroundColor: colors.primary,
    minHeight: 46,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  captureButtonText: {
    color: "#F4FFF8",
    fontSize: 15,
    fontWeight: "700",
  },
  permissionCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 18,
  },
  permissionTitle: {
    color: "#ECFFF3",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  permissionText: {
    color: "rgba(236,255,243,0.75)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  bottomActions: {
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
  },
  primaryAction: {
    flex: 1,
    minHeight: 46,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  primaryActionText: {
    color: "#F4FFF8",
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryAction: {
    flex: 1,
    minHeight: 46,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    backgroundColor: "rgba(255, 255, 255, .9)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14,
  },
  secondaryActionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  actionDisabled: {
    opacity: 0.65,
  },
  previewFrame: {
    flex: 1,
    marginTop: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    overflow: "hidden",
    backgroundColor: "#0B1A13",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
});
