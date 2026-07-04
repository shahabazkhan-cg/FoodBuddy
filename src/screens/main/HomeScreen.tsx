import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Card, Overlay, Text } from "@rneui/themed";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import {
  ArrowUp,
  CalendarClock,
  Image as ImageIcon,
  Mic,
  Receipt,
  Refrigerator,
  ScanLine,
  Sparkles,
  X,
} from "lucide-react-native";

import type { MainTabParamList, RootStackParamList } from "../../navigation/types";
import { AppScreen } from "../../components/AppScreen";
import { PromptChip } from "../../components/PromptChip";
import { SUGGESTED_PROMPTS } from "../../data/foodBuddyData";
import { colors } from "../../theme/appTheme";

type Props = BottomTabScreenProps<MainTabParamList, "Home">;
type RootNav = NativeStackNavigationProp<RootStackParamList>;

function QuickAction({
  emoji,
  title,
  meta,
  onPress,
}: {
  emoji: string;
  title: string;
  meta: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.quickCard} onPress={onPress}>
      <Text style={styles.quickEmoji}>{emoji}</Text>
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickMeta}>{meta}</Text>
    </Pressable>
  );
}

export function HomeScreen(_props: Props) {
  const navigation = useNavigation<RootNav>();
  const tabNavigation = _props.navigation;
  const [captureOpen, setCaptureOpen] = useState(false);

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Pressable style={styles.avatar} onPress={() => navigation.navigate("Profile")}>
            <Text style={styles.avatarText}>S</Text>
          </Pressable>
          <View>
            <Text style={styles.smallMuted}>Good evening</Text>
            <Text style={styles.greeting}>Hi Sarvaa</Text>
          </View>
          <View style={styles.spacer} />
        </View>

        <Text style={styles.heroTitle}>What are we cooking tonight?</Text>

        <Card containerStyle={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Sparkles size={13} color={colors.primary} />
            <Text style={styles.heroBadgeText}>Buddy already knows</Text>
          </View>
          <Text style={styles.heroLine}>Your pantry has 24 ingredients</Text>
          <Text style={styles.heroLine}>3 ingredients expire tomorrow</Text>
          <Text style={styles.heroLine}>You can prepare 18 meals now</Text>
        </Card>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promptsRow}>
          {SUGGESTED_PROMPTS.map((prompt) => (
            <PromptChip
              key={prompt}
              label={prompt}
              onPress={() => navigation.navigate("Chat", { q: prompt })}
            />
          ))}
        </ScrollView>

        <View style={styles.quickGrid}>
          <QuickAction
            emoji="🥑"
            title="My pantry"
            meta="24 items · 92 score"
            onPress={() => tabNavigation.navigate("Pantry")}
          />
          <QuickAction
            emoji="📅"
            title="Meal plan"
            meta="5 of 7 dinners"
            onPress={() => tabNavigation.navigate("Meals")}
          />
        </View>
      </ScrollView>

      <Pressable style={styles.askBar} onPress={() => navigation.navigate("Chat") }>
        <Text style={styles.askText}>Ask Buddy anything...</Text>
        <Pressable
          style={styles.iconCircleSoft}
          onPress={(event) => {
            event.stopPropagation();
            setCaptureOpen(true);
          }}
        >
          <Text style={styles.plusText}>+</Text>
        </Pressable>
        <View style={styles.iconCirclePrimary}>
          <ArrowUp size={16} color="#F4FFF8" />
        </View>
      </Pressable>

      <Overlay
        isVisible={captureOpen}
        onBackdropPress={() => setCaptureOpen(false)}
        overlayStyle={styles.captureSheet}
      >
        <View style={styles.captureHeader}>
          <Text style={styles.captureTitle}>Give Buddy something</Text>
          <Pressable style={styles.closeBtn} onPress={() => setCaptureOpen(false)}>
            <X size={16} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.captureGrid}>
          <CaptureOption icon={Refrigerator} title="Scan fridge" onPress={() => navigation.navigate("Scan")} />
          <CaptureOption icon={ScanLine} title="Scan pantry" onPress={() => navigation.navigate("Scan")} />
          <CaptureOption icon={Receipt} title="Upload receipt" onPress={() => navigation.navigate("Scan")} />
          <CaptureOption icon={ImageIcon} title="Upload images" onPress={() => navigation.navigate("Scan")} />
          <CaptureOption icon={Mic} title="Voice input" onPress={() => navigation.navigate("Chat")} />
          <CaptureOption icon={CalendarClock} title="Plan week" onPress={() => tabNavigation.navigate("Meals")} />
        </View>
      </Overlay>
    </AppScreen>
  );
}

function CaptureOption({
  icon: IconComp,
  title,
  onPress,
}: {
  icon: typeof Mic;
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.captureCard} onPress={onPress}>
      <View style={styles.captureIconWrap}>
        <IconComp size={15} color={colors.primary} />
      </View>
      <Text style={styles.captureCardTitle}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#F4FFF8", fontWeight: "700" },
  smallMuted: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  greeting: { color: colors.text, fontSize: 14, fontWeight: "700" },
  spacer: { flex: 1 },
  heroTitle: {
    marginTop: 20,
    color: colors.text,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "700",
  },
  heroCard: {
    marginTop: 14,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 16,
  },
  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "#E8F7EE",
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 8,
  },
  heroBadgeText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 11,
  },
  heroLine: {
    color: colors.text,
    fontSize: 13,
    marginTop: 5,
  },
  promptsRow: {
    marginTop: 16,
  },
  quickGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  quickCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 14,
  },
  quickEmoji: { fontSize: 26 },
  quickTitle: { marginTop: 8, color: colors.text, fontSize: 14, fontWeight: "700" },
  quickMeta: { marginTop: 4, color: colors.muted, fontSize: 11 },
  askBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 92,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    minHeight: 56,
    paddingLeft: 16,
    paddingRight: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  askText: {
    flex: 1,
    color: colors.muted,
    fontSize: 14,
  },
  iconCircleSoft: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F3",
    alignItems: "center",
    justifyContent: "center",
  },
  plusText: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 24,
    marginTop: -2,
  },
  iconCirclePrimary: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  captureSheet: {
    width: "100%",
    marginTop: "auto",
    marginBottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  captureHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  captureTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F3",
    alignItems: "center",
    justifyContent: "center",
  },
  captureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  captureCard: {
    width: "48.5%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    padding: 12,
  },
  captureIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F3",
    marginBottom: 8,
  },
  captureCardTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
});
