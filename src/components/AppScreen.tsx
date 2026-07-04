import React, { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/appTheme";

type AppScreenProps = PropsWithChildren<{
  withBottomPad?: boolean;
}>;

export function AppScreen({ children, withBottomPad = true }: AppScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={[styles.content, withBottomPad && styles.bottomPad]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  bottomPad: {
    paddingBottom: 86,
  },
});
