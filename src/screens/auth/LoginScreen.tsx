import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Text } from "@rneui/themed";
// @ts-ignore - react-native-vector-icons doesn't have full TypeScript support
import FeatherIcon from "react-native-vector-icons/Feather";
import LottieView from "lottie-react-native";
import { ChevronDown } from "lucide-react-native";

import type { RootStackParamList } from "../../navigation/types";
import { AppScreen } from "../../components/AppScreen";
import { colors } from "../../theme/appTheme";
import { useAppDispatch } from "../../store/hooks";
import { setUserId } from "../../store/slices/authSlice";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

// User list with IDs
const USERS = [
  { id: "user_chandra", name: "Chandra" },
  { id: "user_pasha", name: "Pasha" },
  { id: "user_thakur", name: "Thakur" },
  { id: "user_roshan", name: "Roshan" },
  { id: "user_shahbaz", name: "Shahbaz" },
  { id: "user_hemanth", name: "Hemanth" },
];

function Feature({
  emoji,
  title,
  onPress,
}: {
  emoji: string;
  title: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.featureCard,
        pressed && styles.featureCardPressed,
      ]}
    >
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={styles.featureTitle}>{title}</Text>
    </Pressable>
  );
}

export function LoginScreen({ navigation }: Props) {
  const [selectedUserId, setSelectedUserId] = useState<string>(USERS[0].id);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dispatch = useAppDispatch();

  const handleUserSelect = (user_id: string) => {
    setSelectedUserId(user_id);
    dispatch(setUserId(user_id));
    setShowUserDropdown(false);
    navigation.navigate("MainTabs"); // Navigate to Home after selecting a user
  };

  const selectedUser = USERS.find((u) => u.id === selectedUserId);

  return (
    <AppScreen withBottomPad={false}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
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

          {/* User Selection Dropdown */}
          <View style={styles.userSelectionSection}>
            <Text style={styles.userSelectionLabel}>Select User</Text>
            <Pressable
              style={[
                styles.userDropdownButton,
                showUserDropdown && styles.userDropdownButtonActive,
              ]}
              onPress={() => setShowUserDropdown(!showUserDropdown)}
            >
              <Text style={styles.userDropdownText}>
                {selectedUser?.name || "Select a user"}
              </Text>
              <ChevronDown
                size={16}
                color={colors.text}
                style={{
                  transform: [{ rotate: showUserDropdown ? "180deg" : "0deg" }],
                }}
              />
            </Pressable>

            {/* User Dropdown Menu */}
            {showUserDropdown && (
              <View style={styles.userDropdownMenu}>
                {USERS.map((user) => (
                  <Pressable
                    key={user.id}
                    style={[
                      styles.userDropdownItem,
                      selectedUserId === user.id &&
                        styles.userDropdownItemSelected,
                    ]}
                    onPress={() => handleUserSelect(user.id)}
                  >
                    <Text
                      style={[
                        styles.userDropdownItemText,
                        selectedUserId === user.id &&
                          styles.userDropdownItemTextSelected,
                      ]}
                    >
                      {user.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <View style={styles.featureList}>
            <Feature emoji="📸" title="Scan your fridge in seconds" />
            <Feature emoji="🧠" title="Buddy remembers what you love" />
            <Feature emoji="🍳" title="Cook hands-free with voice" />
          </View>
        </View>

        <View style={styles.actions}>
          <Text style={styles.terms}>
            By continuing you agree to our Terms and Privacy.
          </Text>
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
  userSelectionSection: {
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  userSelectionLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  userDropdownButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userDropdownButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  userDropdownText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  userDropdownMenu: {
    position: "absolute",
    top: 90,
    left: 4,
    right: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginHorizontal: 4,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  userDropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userDropdownItemSelected: {
    backgroundColor: colors.primary,
    opacity: 0.1,
  },
  userDropdownItemText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  userDropdownItemTextSelected: {
    fontWeight: "700",
    color: colors.primary,
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
