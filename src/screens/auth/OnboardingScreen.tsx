import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, LinearProgress, Text } from "@rneui/themed";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import LottieView from "lottie-react-native";
import { ChevronLeft } from "lucide-react-native";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import { setAnswer } from "../../store/slices/onboardingSlice";

import type { RootStackParamList } from "../../navigation/types";
import { AppScreen } from "../../components/AppScreen";
import { colors } from "../../theme/appTheme";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

type StepKey =
  | "household"
  | "diet"
  | "allergies"
  | "cuisines"
  | "goal"
  | "frequency"
  | "budget"
  | "skill";

type Step = {
  key: StepKey;
  eyebrow: string;
  question: string;
  options: string[];
  multi?: boolean;
};
const STEPS: Step[] = [
  { key: "household", eyebrow: "01 Household", question: "Who are we cooking for?", options: ["Just me", "2 people", "3-4", "5+"] },
  { key: "diet", eyebrow: "02 Diet", question: "What do you eat?", options: ["Omnivore", "Vegetarian", "Vegan", "Sugar free", "Keto", "Mediterranean"], multi: true },
  { key: "allergies", eyebrow: "03 Allergies", question: "Anything to avoid?", options: ["None", "Sugar", "Tree nuts", "Dairy", "Gluten", "Shellfish", "Eggs"], multi: true },
  { key: "cuisines", eyebrow: "04 Cuisine", question: "Cuisines you love", options: ["Italian", "Indian", "Mexican", "Japanese", "Thai", "Mediterranean", "Belgian"], multi: true },
  { key: "goal", eyebrow: "05 Goal", question: "Your nutrition goal", options: ["High protein", "Balanced", "Low carb", "Weight loss", "Muscle gain"] },
  { key: "frequency", eyebrow: "06 Frequency", question: "How often do you cook?", options: ["Daily", "5x a week", "Weekends only", "Rarely"] },
  { key: "budget", eyebrow: "07 Budget", question: "Weekly grocery budget", options: ["Under €50", "€50-100", "€100-200", "€200+"] },
  { key: "skill", eyebrow: "08 Skill", question: "Cooking skill level", options: ["Beginner", "Intermediate", "Expert"] },
];

export function OnboardingScreen({ navigation }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const dispatch = useDispatch();
  const answers = useSelector(
  (state: RootState) => state.onboarding.answers
);
console.log(answers);

  const step = STEPS[stepIndex];
  const selected = answers[stepIndex] ?? [];
  const progress = useMemo(() => (stepIndex + 1) / STEPS.length, [stepIndex]);

  const toggleSelection = (value: string) => {
  const current = answers[stepIndex] ?? [];

  let next: string[];

  if (step.multi) {
    next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
  } else {
    next = [value];
  }

  dispatch(
    setAnswer({
      step: stepIndex,
      answers: next,
    })
  );
};

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((value) => value + 1);
      return;
    }
    navigation.replace("MainTabs");
  };

  return (
    <AppScreen withBottomPad={false}>
      <View style={styles.headerRow}>
        <Pressable style={styles.circleBtn} onPress={() => (stepIndex === 0 ? navigation.goBack() : setStepIndex((value) => value - 1))}>
          <ChevronLeft size={18} color={colors.text} />
        </Pressable>
        <View style={styles.progressWrap}>
          <LinearProgress
            value={progress}
            variant="determinate"
            trackColor={colors.border}
            color={colors.primary}
            style={styles.progress}
          />
        </View>
        <Text style={styles.counter}>{stepIndex + 1}/{STEPS.length}</Text>
      </View>

      <Text style={styles.eyebrow}>{step.eyebrow}</Text>
      <Text style={styles.question}>{step.question}</Text>
      {step.multi ? <Text style={styles.hint}>Pick as many as you like</Text> : null}

      <ScrollView contentContainerStyle={styles.optionsWrap} showsVerticalScrollIndicator={false}>
        {step.options.map((option) => {
          const active = selected.includes(option);
          return (
            <Pressable
              key={option}
              onPress={() => toggleSelection(option)}
              style={[styles.option, active && styles.optionActive]}
            >
              <Text style={[styles.optionText, active && styles.optionTextActive]}>{option}</Text>
              <View style={[styles.dot, active && styles.dotActive]}>
                {active ? <View style={styles.innerDot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        {stepIndex === STEPS.length - 1 ? (
          <LottieView
            source={require("../../assets/lottie/chef-success.json")}
            autoPlay
            loop
            style={styles.footerLottie}
          />
        ) : null}
        <Button
          title={stepIndex === STEPS.length - 1 ? "Meet Buddy" : "Continue"}
          disabled={selected.length === 0}
          buttonStyle={styles.continueBtn}
          onPress={goNext}
        />
        <Button
          title="Skip for now"
          type="clear"
          titleStyle={styles.skipTitle}
          onPress={() => navigation.replace("MainTabs")}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  progressWrap: {
    flex: 1,
    marginHorizontal: 4,
  },
  progress: {
    height: 8,
    borderRadius: 999,
  },
  counter: {
    color: colors.muted,
    minWidth: 38,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "600",
  },
  eyebrow: {
    marginTop: 12,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  question: {
    marginTop: 6,
    color: colors.text,
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 36,
  },
  hint: {
    marginTop: 6,
    color: colors.muted,
    fontSize: 12,
  },
  optionsWrap: {
    gap: 10,
    paddingTop: 16,
    paddingBottom: 16,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  optionText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  optionTextActive: {
    color: colors.text,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#3B584A",
    alignItems: "center",
    justifyContent: "center",
  },
  dotActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F4FFF8",
  },
  footer: {
    paddingBottom: 10,
  },
  footerLottie: {
    width: 68,
    height: 68,
    alignSelf: "center",
    marginBottom: 6,
  },
  continueBtn: {
    backgroundColor: colors.primary,
  },
  skipTitle: {
    color: colors.muted,
    fontWeight: "600",
  },
    circleBtn: {
      width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F3",
    alignItems: "center",
    justifyContent: "center",
  }
});
