import React from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from "@rneui/themed";
import { Check, Pencil, Sparkles, X } from "lucide-react-native";

import type { RootStackParamList, VisionExtractItem } from "../../navigation/types";
import { AppScreen } from "../../components/AppScreen";
import { ExpiryBadge } from "../../components/ExpiryBadge";
import { PANTRY } from "../../data/foodBuddyData";
import { colors } from "../../theme/appTheme";

type Props = NativeStackScreenProps<RootStackParamList, "ScanResults">;

function getExpiryStatus(expiryDate: string): "fresh" | "soon" | "expired" {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const msInDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((expiry.getTime() - today.getTime()) / msInDay);

  if (diffDays < 0) return "expired";
  if (diffDays <= 3) return "soon";
  return "fresh";
}

function getExpiryLabel(expiryDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const msInDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((expiry.getTime() - today.getTime()) / msInDay);

  if (diffDays < 0) return "Expired";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day";
  return `${diffDays} days`;
}

function toDisplayCategory(category: string): string {
  const lowered = category.toLowerCase();
  return lowered.charAt(0).toUpperCase() + lowered.slice(1);
}

export function ScanResultsScreen({ navigation, route }: Props) {
  const apiItems = route.params?.items ?? [];
  const items = apiItems.length > 0 ? apiItems : PANTRY.slice(0, 8);
  const soonOrExpiredCount = apiItems.filter((item) => {
    const status = getExpiryStatus(item.expiryDate);
    return status === "soon" || status === "expired";
  }).length;

  return (
    <AppScreen withBottomPad={false}>
      <View style={styles.headerRow}>
        <Pressable style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <X size={18} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Scan · Fridge</Text>
        <View style={styles.sideSpacer} />
      </View>

      <View style={styles.heroBox}>
        <View style={styles.heroBadge}>
          <Sparkles size={13} color={colors.primary} />
          <Text style={styles.heroBadgeText}>Buddy says</Text>
        </View>
        <Text style={styles.heroText}>
          {apiItems.length > 0
            ? `I found ${apiItems.length} ingredients. ${soonOrExpiredCount} will expire soon.`
            : "I found 27 ingredients. 3 will expire this week."}
        </Text>
      </View>

      <Text style={styles.detectedTitle}>Detected · tap to edit</Text>

      <FlatList
        data={items}
        keyExtractor={(item, index) => {
          if ("id" in item) {
            return item.id;
          }
          const apiItem = item as VisionExtractItem;
          return `${apiItem.itemName}-${index}`;
        }}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridList}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {"id" in item ? (
              <>
                <View style={styles.topIconRow}>
                  <Text style={styles.emoji}>{item.emoji}</Text>
                  <View style={styles.confChip}>
                    <Text style={styles.confText}>{Math.round((item.confidence ?? 1) * 100)}%</Text>
                  </View>
                </View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.qty} · {item.category}</Text>
                <View style={styles.bottomRow}>
                  <ExpiryBadge status={item.status} label={item.expiryLabel} />
                  <Pencil size={12} color={colors.muted} />
                </View>
              </>
            ) : (
              <>
                <View style={styles.topIconRow}>
                  <Text style={styles.emoji}>🥗</Text>
                  <View style={styles.confChip}>
                    <Text style={styles.confText}>AI</Text>
                  </View>
                </View>
                <Text style={styles.name}>{(item as VisionExtractItem).itemName}</Text>
                <Text style={styles.meta}>
                  {(item as VisionExtractItem).quantity} {(item as VisionExtractItem).unit} ·{" "}
                  {toDisplayCategory((item as VisionExtractItem).category)}
                </Text>
                <View style={styles.bottomRow}>
                  <ExpiryBadge
                    status={getExpiryStatus((item as VisionExtractItem).expiryDate)}
                    label={getExpiryLabel((item as VisionExtractItem).expiryDate)}
                  />
                  <Pencil size={12} color={colors.muted} />
                </View>
              </>
            )}
          </View>
        )}
      />

      <View style={styles.footerBar}>
        <View style={styles.footerMeta}>
          <Text style={styles.footerHint}>Ready to add</Text>
          <Text style={styles.footerTitle}>
            {apiItems.length > 0 ? `${apiItems.length} items to your pantry` : "27 items to your pantry"}
          </Text>
        </View>
        <Pressable style={styles.footerAction} onPress={() => navigation.replace("MainTabs", { screen: "Pantry" })}>
          <Check size={14} color="#F4FFF8" />
          <Text style={styles.footerActionText}>Build pantry</Text>
        </Pressable>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconBtn: {
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
  heroBox: {
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 14,
  },
  heroBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#E8F7EE",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  heroBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  heroText: {
    marginTop: 8,
    color: colors.text,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "700",
  },
  detectedTitle: {
    marginTop: 14,
    color: colors.muted,
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 1,
  },
  gridList: {
    paddingTop: 10,
    paddingBottom: 90,
    gap: 10,
  },
  gridRow: {
    gap: 10,
  },
  card: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 12,
  },
  topIconRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  emoji: {
    fontSize: 30,
  },
  confChip: {
    borderRadius: 999,
    backgroundColor: "#E8F7EE",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  confText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "700",
  },
  name: {
    marginTop: 8,
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  meta: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  bottomRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 12,
  },
  footerMeta: {
    flex: 1,
  },
  footerHint: {
    color: colors.muted,
    fontSize: 11,
  },
  footerTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  footerAction: {
    borderRadius: 999,
    backgroundColor: colors.primary,
    minHeight: 42,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerActionText: {
    color: "#F4FFF8",
    fontSize: 12,
    fontWeight: "700",
  },
});
