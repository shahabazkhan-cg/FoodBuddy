import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearProgress, Text } from "@rneui/themed";
import { ChevronLeft, Mic, Pause, Timer } from "lucide-react-native";

import type { RootStackParamList } from "../../navigation/types";
import { AppScreen } from "../../components/AppScreen";
import { getRecipe } from "../../data/foodBuddyData";
import { colors } from "../../theme/appTheme";

type Props = NativeStackScreenProps<RootStackParamList, "Cook">;

export function CookScreen({ navigation, route }: Props) {
  const recipe = getRecipe(route.params.id);
  const [stepIndex, setStepIndex] = useState(0);
  const total = recipe.steps.length;
  const progress = useMemo(() => (stepIndex + 1) / total, [stepIndex, total]);

  return (
    <AppScreen withBottomPad={false}>
      <View style={styles.headerRow}>
        <Pressable style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={18} color={colors.text} />
        </Pressable>
        <View style={styles.headerMeta}>
          <Text style={styles.headerTop}>Cook mode</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{recipe.title}</Text>
        </View>
        <View style={styles.sideSpacer} />
      </View>

      <LinearProgress
        value={progress}
        variant="determinate"
        trackColor={colors.border}
        color={colors.primary}
        style={styles.progress}
      />
      <Text style={styles.stepCount}>Step {stepIndex + 1} of {total}</Text>

      <View style={styles.stepCard}>
        <Text style={styles.nowLabel}>Now</Text>
        <Text style={styles.stepText}>{recipe.steps[stepIndex]}</Text>
        <View style={styles.timerPill}>
          <Timer size={13} color={colors.primary} />
          <Text style={styles.timerText}>Timer 04:32</Text>
        </View>
      </View>

      <View style={styles.chatWrap}>
        <View style={styles.userBubble}>
          <Text style={styles.userBubbleText}>I do not have butter.</Text>
        </View>
        <View style={styles.aiBubble}>
          <Text style={styles.aiBubbleText}>
            No problem. Use 1 tbsp olive oil instead. Same richness with a cleaner finish.
          </Text>
        </View>
      </View>

      <View style={styles.footerBar}>
        <Pressable style={styles.roundBtn}>
          <Pause size={18} color={colors.text} />
        </Pressable>
        <Pressable style={styles.roundBtnPrimary}>
          <Mic size={18} color="#F4FFF8" />
        </Pressable>
        <Pressable
          style={styles.nextBtn}
          onPress={() => {
            if (stepIndex === total - 1) {
              navigation.replace("MainTabs", { screen: "Home" });
              return;
            }
            setStepIndex((value) => Math.min(value + 1, total - 1));
          }}
        >
          <Text style={styles.nextText}>{stepIndex === total - 1 ? "Finish" : "Next step"}</Text>
        </Pressable>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1C2A22",
    alignItems: "center",
    justifyContent: "center",
  },
  headerMeta: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 8,
  },
  headerTop: {
    color: colors.muted,
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  headerTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  sideSpacer: {
    width: 40,
  },
  progress: {
    marginTop: 16,
    height: 8,
    borderRadius: 999,
  },
  stepCount: {
    marginTop: 6,
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
  },
  stepCard: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 16,
  },
  nowLabel: {
    color: colors.primary,
    textTransform: "uppercase",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  stepText: {
    marginTop: 8,
    color: colors.text,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "700",
  },
  timerPill: {
    marginTop: 12,
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#1C2A22",
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timerText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  chatWrap: {
    marginTop: 12,
    gap: 8,
    paddingBottom: 90,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderRadius: 18,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 9,
    maxWidth: "84%",
  },
  userBubbleText: {
    color: "#F4FFF8",
    fontSize: 13,
  },
  aiBubble: {
    alignSelf: "flex-start",
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
    maxWidth: "86%",
  },
  aiBubbleText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  footerBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roundBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  roundBtnPrimary: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  nextText: {
    color: "#F4FFF8",
    fontSize: 14,
    fontWeight: "700",
  },
});
