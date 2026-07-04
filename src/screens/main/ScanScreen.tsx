import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from "@rneui/themed";
import { Camera, RefreshCw, Upload, X } from "lucide-react-native";
import { launchImageLibrary } from "react-native-image-picker";
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

import type { RootStackParamList, VisionExtractResponse } from "../../navigation/types";
import { colors } from "../../theme/appTheme";

type Props = NativeStackScreenProps<RootStackParamList, "Scan">;

type CameraPreviewProps = {
  device: (ReturnType<typeof useCameraDevices>[number]);
  photoOutput: ReturnType<typeof usePhotoOutput>;
  previewOutput: ReturnType<typeof usePreviewOutput>;
};

type SelectedImage = {
  uri: string;
  name: string;
  type: string;
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
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);

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
      setSelectedImage(null);
    } catch {
      Alert.alert("Capture failed", "Could not capture photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  }, [photoOutput]);

  const requestGalleryPermission = useCallback(async () => {
    if (Platform.OS !== "android") {
      return true;
    }

    const permission =
      Platform.Version >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

    const granted = await PermissionsAndroid.request(permission);
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }, []);

  const pickImageFromLibrary = useCallback(async () => {
    try {
      const hasGalleryPermission = await requestGalleryPermission();
      if (!hasGalleryPermission) {
        Alert.alert("Permission required", "Allow photo access to upload an image from gallery.");
        return;
      }

      const result = await launchImageLibrary({
        mediaType: "photo",
        selectionLimit: 1,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert(
          "Image selection failed",
          `${result.errorCode}${result.errorMessage ? `: ${result.errorMessage}` : ""}`,
        );
        return;
      }

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        Alert.alert("Image selection failed", "Could not read selected image.");
        return;
      }

      setCapturedPath(null);
      setSelectedImage({
        uri: asset.uri,
        name: asset.fileName ?? "fridge.jpg",
        type: asset.type ?? "image/jpeg",
      });
    } catch {
      Alert.alert("Image selection failed", "Could not pick image from gallery.");
    }
  }, [requestGalleryPermission]);

  const openSettings = useCallback(async () => {
    try {
      await Linking.openSettings();
    } catch {
      Alert.alert("Unable to open settings", "Please open Settings manually and enable camera access.");
    }
  }, []);

  const retake = useCallback(() => {
    setCapturedPath(null);
    setSelectedImage(null);
  }, []);

  const previewUri = useMemo(() => {
    if (selectedImage?.uri) {
      return selectedImage.uri;
    }

    if (capturedPath) {
      return capturedPath.startsWith("file://") ? capturedPath : `file://${capturedPath}`;
    }

    return null;
  }, [capturedPath, selectedImage]);

  const [isUploading, setIsUploading] = useState(false);

  const continueToResults = useCallback(async () => {
    if (!previewUri) return;
    setIsUploading(true);
    try {
      const uri = previewUri;
      console.log("Uploading image from URI:", uri, selectedImage);
      const imageName = selectedImage?.name ?? "fridge.jpg";
      const imageType = selectedImage?.type ?? "image/jpeg";

      // Log image size metadata before upload for debugging.
      try {
        const localResponse = await fetch(uri);
        const localBlob = await localResponse.blob();
        console.log("Captured image size (bytes):", localBlob.size);
      } catch (sizeError) {
        console.warn("Could not read image byte size:", sizeError);
      }

      Image.getSize(
        uri,
        (width, height) => {
          console.log("Captured image dimensions:", { width, height });
        },
        (dimensionError) => {
          console.warn("Could not read image dimensions:", dimensionError);
        },
      );

      const formData = new FormData();
      formData.append("file", {
        uri,
        type: imageType,
        name: imageName,
      } as any);

      const uploadResult = await new Promise<VisionExtractResponse>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(
          "POST",
          "https://java-pantry-asfgc7dvhadjdecz.westeurope-01.azurewebsites.net/api/ai/vision/extract-save",
        );
        xhr.onload = () => {
          console.log("Upload response status:", xhr.status);
          console.log("Upload response headers:", xhr.getAllResponseHeaders());
          console.log("Upload response body:", xhr.responseText);

          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const parsed = JSON.parse(xhr.responseText) as VisionExtractResponse;
              resolve({ items: Array.isArray(parsed?.items) ? parsed.items : [] });
            } catch {
              resolve({ items: [] });
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(formData);
      });

      const chatInput =
        uploadResult.items.length > 0
          ? `I scanned these items: ${uploadResult.items
              .map((item) => `${item.itemName} (${item.quantity} ${item.unit})`)
              .join(", ")}. Suggest recipes I can make.`
          : "I scanned my fridge but no items were detected. Help me figure out what to do next.";

      navigation.replace("Chat", { q: chatInput });
    } catch (e) {
      console.error("Upload error:", e);
      Alert.alert("Upload failed", "Could not upload the image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [navigation, previewUri, selectedImage]);

  if (previewUri) {
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
          <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="cover" />
        </View>

        <View style={styles.bottomActions}>
          <Pressable style={styles.secondaryAction} onPress={retake}>
            <RefreshCw size={15} color={colors.text} />
            <Text style={styles.secondaryActionText}>Retake</Text>
          </Pressable>
          <Pressable
            style={[styles.primaryAction, isUploading && styles.actionDisabled]}
            onPress={continueToResults}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="#F4FFF8" />
            ) : (
              <Text style={styles.primaryActionText}>Continue</Text>
            )}
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
        <Pressable style={styles.uploadAction} onPress={pickImageFromLibrary}>
          <Upload size={15} color={colors.text} />
          <Text style={styles.uploadActionText}>Upload Image</Text>
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
  uploadAction: {
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
  uploadActionText: {
    color: colors.text,
    fontSize: 14,
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
