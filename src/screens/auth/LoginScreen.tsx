import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Text } from "@rneui/themed";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
// @ts-ignore - react-native-vector-icons doesn't have full TypeScript support
import FeatherIcon from "react-native-vector-icons/Feather";
import LottieView from "lottie-react-native";
import Icon from "react-native-vector-icons/FontAwesome5";


import type { RootStackParamList } from "../../navigation/types";
import { AppScreen } from "../../components/AppScreen";
import { colors } from "../../theme/appTheme";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

function Feature({ emoji, title, onPress }: { emoji: string; title: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.featureCard, pressed && styles.featureCardPressed]}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={styles.featureTitle}>{title}</Text>
    </Pressable>
  );
}

export function LoginScreen({ navigation }: Props) {
  return (
    <AppScreen withBottomPad={false}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View>
          <View style={styles.logoCard}>
            <LottieView
              source={require("../../assets/lottie/food-welcome.json")}
              autoPlay
              loop
              style={styles.lottie}
            />
          </View>

          <Text style={styles.title}>Food Buddy</Text>
          <Text style={styles.subtitle}>Your AI Kitchen Companion</Text>

          <View style={styles.featureList}>
            <Feature emoji="📸" title="Scan your fridge in seconds" />
            <Feature emoji="🧠" title="Buddy remembers what you love" />
            <Feature emoji="🍳" title="Cook hands-free with voice" />
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Sign Up"
            buttonStyle={styles.appleBtn}
            titleStyle={styles.appleTitle}
            onPress={() => navigation.navigate("MainTabs")}
          />
          <Button
            title="Login"
            type="outline"
            buttonStyle={styles.outlineBtn}
            titleStyle={styles.outlineTitle}
            onPress={() => navigation.navigate("MainTabs")}
          />
          <Button
            title="Login as guest"
            buttonStyle={styles.primaryBtn}
            onPress={() => navigation.navigate("Onboarding")}
          />
          <Text style={styles.terms}>By continuing you agree to our Terms and Privacy.</Text>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 24,
  },
  logoCard: {
    width: 120,
    height: 120,
    borderRadius: 28,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 8,
  },
  lottie: {
    width: 96,
    height: 96,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 16,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
  },
  featureList: {
    marginTop: 28,
    gap: 10,
  },
  featureCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureCardPressed: {
    opacity: 0.85,
  },
  featureEmoji: {
    fontSize: 18,
  },
  featureTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  actions: {
    marginTop: 24,
    gap: 10,
  },
  buttonIcon: {
    marginRight: 8,
  },
  appleBtn: {
    backgroundColor: colors.text,
  },
  appleTitle: {
    color: colors.bg,
  },
  outlineBtn: {
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  outlineTitle: {
    color: colors.text,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
  },
  terms: {
    marginTop: 4,
    textAlign: "center",
    color: colors.muted,
    fontSize: 11,
  },
});
