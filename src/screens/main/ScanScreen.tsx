import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from "@rneui/themed";
import { Check, X, Zap } from "lucide-react-native";
import LottieView from "lottie-react-native";

import type { RootStackParamList } from "../../navigation/types";
import { colors } from "../../theme/appTheme";

type Props = NativeStackScreenProps<RootStackParamList, "Scan">;

const STAGES = [
  "Detecting ingredients",
  "Categorizing items",
  "Estimating quantities",
  "Predicting shelf life",
  "Building your pantry",
];

export function ScanScreen({ navigation }: Props) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (stage >= STAGES.length) {
      const doneTimer = setTimeout(() => navigation.replace("ScanResults"), 350);
      return () => clearTimeout(doneTimer);
    }

    const timer = setTimeout(() => setStage((value) => value + 1), 700);
    return () => clearTimeout(timer);
  }, [navigation, stage]);

  const active = useMemo(() => STAGES[Math.min(stage, STAGES.length - 1)], [stage]);

  return (
    <View style={styles.root}>
      <View style={styles.topRow}>
        <Pressable style={styles.softBtn} onPress={() => navigation.goBack()}>
          <X size={18} color="#F4FFF8" />
        </Pressable>
        <Text style={styles.liveText}>AI Vision · Live</Text>
        <View style={styles.sideSpacer} />
      </View>

      <View style={styles.centerArea}>
        <View style={styles.frame}>
          <LottieView
            source={require("../../assets/lottie/food-welcome.json")}
            autoPlay
            loop
            style={styles.scanLottie}
          />
          <Text style={styles.centerEmoji}>🥦</Text>
        </View>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusTop}>
          <Zap size={13} color={colors.primary} />
          <Text style={styles.statusTitle}>Buddy is analyzing</Text>
        </View>

        {STAGES.map((label, index) => {
          const done = index < stage;
          const current = label === active && stage < STAGES.length;
          return (
            <View key={label} style={styles.stageRow}>
              <View style={[styles.stageCircle, done && styles.stageDone, current && styles.stageCurrent]}>
                {done ? <Check size={12} color="#F4FFF8" /> : <Text style={styles.stageNum}>{index + 1}</Text>}
              </View>
              <Text style={[styles.stageText, !done && !current && styles.stageTextMuted]}>
                {label}{current ? " ..." : ""}
              </Text>
            </View>
          );
        })}
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
  frame: {
    width: "100%",
    maxWidth: 280,
    aspectRatio: 1,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(23,59,42,0.45)",
  },
  scanLottie: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  centerEmoji: {
    fontSize: 76,
  },
  statusCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 14,
  },
  statusTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  statusTitle: {
    color: colors.primary,
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 1,
  },
  stageRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  stageCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  stageDone: {
    backgroundColor: colors.primary,
  },
  stageCurrent: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  stageNum: {
    color: "#D6FCE6",
    fontSize: 11,
    fontWeight: "700",
  },
  stageText: {
    color: "#ECFFF3",
    fontSize: 13,
  },
  stageTextMuted: {
    color: "rgba(236,255,243,0.45)",
  },
});
