import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from "@rneui/themed";
import { Bell, ChevronLeft, ChevronRight, HeartPulse, LogOut, Settings2, Users } from "lucide-react-native";
import { useDispatch } from "react-redux";
import { clearAnswers } from "../../store/slices/onboardingSlice";

import type { RootStackParamList } from "../../navigation/types";
import { AppScreen } from "../../components/AppScreen";
import { useAppSelector } from "../../store/hooks";
import { colors } from "../../theme/appTheme";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Row({
  icon: IconComp,
  title,
  meta,
}: {
  icon: typeof Users;
  title: string;
  meta: string;
}) {
  return (
    <Pressable style={styles.rowCard}>
      <View style={styles.rowIconWrap}>
        <IconComp size={17} color={colors.primary} />
      </View>
      <View style={styles.rowMeta}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowHint}>{meta}</Text>
      </View>
      <ChevronRight size={16} color={colors.muted} />
    </Pressable>
  );
}

export function ProfileScreen({ navigation }: Props) {
  const dispatch = useDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const selectedUserId = useAppSelector((state) => state.auth.user_id);
  const selectedUserName = selectedUserId
    ? selectedUserId
        .replace(/^user_/, "")
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : user?.name ?? "User";
  const firstNameInitial = selectedUserName.charAt(0).toUpperCase();
  const userEmail = user?.email ?? "user@example.com";
  const familySize = user?.familySize ?? 1;

  return (
    <AppScreen withBottomPad={false}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={18} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.sideSpacer} />
      </View>

      <View style={styles.centerBlock}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{firstNameInitial}</Text>
        </View>
        <Text style={styles.name}>{selectedUserName}</Text>
        <Text style={styles.email}>{userEmail} · Family of {familySize}</Text>
      </View>

      <View style={styles.statsRow}>
        <Stat value="127" label="Meals" />
        <Stat value="$318" label="Saved" />
        <Stat value="12" label="Streak" />
      </View>

      <View style={styles.rowsWrap}>
        <Row icon={Users} title="Family" meta="4 members · 1 kid" />
        <Row icon={HeartPulse} title="Diet and goals" meta="Mediterranean · High protein" />
        <Row icon={Bell} title="Notifications" meta="Expiry and meal plan" />
        <Row icon={Settings2} title="Settings" meta="Units, language, privacy" />
      </View>

      <Pressable style={styles.logoutBtn} onPress={() => {
        dispatch(clearAnswers())
        navigation.replace("Login") 
      }}>
        <LogOut size={15} color="#EF4444" />
        <Text style={styles.logoutText}>Sign out</Text>
      </Pressable>
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F3",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  sideSpacer: {
    width: 40,
  },
  centerBlock: {
    marginTop: 18,
    alignItems: "center",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#F4FFF8",
    fontSize: 32,
    fontWeight: "700",
  },
  name: {
    marginTop: 12,
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
  },
  email: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 13,
  },
  statsRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 10,
    alignItems: "center",
  },
  statValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  rowsWrap: {
    marginTop: 16,
    gap: 8,
  },
  rowCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F1F5F3",
    alignItems: "center",
    justifyContent: "center",
  },
  rowMeta: {
    flex: 1,
  },
  rowTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  rowHint: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  logoutBtn: {
    marginTop: 16,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  logoutText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "700",
  },
});
