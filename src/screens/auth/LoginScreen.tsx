import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Text } from "@rneui/themed";
import LottieView from "lottie-react-native";
import Icon from "react-native-vector-icons/FontAwesome5";


import type { RootStackParamList } from "../../navigation/types";
import { AppScreen } from "../../components/AppScreen";
import { colors } from "../../theme/appTheme";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

function Feature({ emoji, title }: { emoji: string; title: string }) {
  return (
    <View style={styles.featureCard}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={styles.featureTitle}>{title}</Text>
    </View>
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
            // icon={<Icon name="apple" brand size={16} color={colors.bg} />}
            buttonStyle={styles.appleBtn}
            titleStyle={styles.appleTitle}
            onPress={() => navigation.navigate("Onboarding")}
          />
          <Button
            title="Login"
            type="outline"
            // icon={{ name: "google", type: "font-awesome-5", color: colors.text, size: 14 }}
            buttonStyle={styles.outlineBtn}
            titleStyle={styles.outlineTitle}
            onPress={() => navigation.navigate("Onboarding")}
          />
          <Button
            title="Login as guest"
            // icon={{ name: "mail", type: "ionicon", color: "#F4FFF8", size: 16 }}
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
