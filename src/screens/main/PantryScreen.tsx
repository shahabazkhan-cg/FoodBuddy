import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Card, Text } from "@rneui/themed";
import { RefreshCw, Search, Sparkles } from "lucide-react-native";

import type { MainTabParamList } from "../../navigation/types";
import { AppScreen } from "../../components/AppScreen";
import { ExpiryBadge } from "../../components/ExpiryBadge";
import { colors } from "../../theme/appTheme";
import { useGetPantryQuery } from "../../store/api/pantryApi";
import type { ApiPantryItem } from "../../store/api/types";

type Props = BottomTabScreenProps<MainTabParamList, "Pantry">;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Maps backend category constants to user-friendly labels. */
const CATEGORY_LABELS: Record<string, string> = {
  DAIRY: "Dairy",
  OTHER: "Other",
  PRODUCE: "Produce",
  PROTEINS: "Proteins",
  GRAINS: "Grains",
  SPICES: "Spices",
  SEAFOOD: "Seafood",
  BEVERAGES: "Beverages",
  FROZEN: "Frozen",
  CONDIMENTS: "Condiments",
};

/** Maps backend category constants to a representative emoji. */
const CATEGORY_EMOJI: Record<string, string> = {
  DAIRY: "🥛",
  OTHER: "📦",
  PRODUCE: "🥦",
  PROTEINS: "🥩",
  GRAINS: "🌾",
  SPICES: "🌶️",
  SEAFOOD: "🐟",
  BEVERAGES: "🧃",
  FROZEN: "🧊",
  CONDIMENTS: "🫙",
};

/** Derives expiry status and display label from a nullable ISO date string. */
function getExpiryInfo(expiryDate: string | null): {
  status: "fresh" | "soon" | "expired";
  label: string;
} {
  if (!expiryDate) return { status: "fresh", label: "No expiry" };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / 86_400_000);
  if (diffDays < 0) return { status: "expired", label: `Expired ${Math.abs(diffDays)}d ago` };
  if (diffDays === 0) return { status: "soon", label: "Expires today" };
  if (diffDays <= 3) return { status: "soon", label: `${diffDays}d left` };
  return { status: "fresh", label: `${diffDays}d left` };
}

function computeHealthScore(items: ApiPantryItem[]): number {
  if (!items.length) return 0;
  const fresh = items.filter((i) => getExpiryInfo(i.expiryDate).status === "fresh").length;
  return Math.round((fresh / items.length) * 100);
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function PantryScreen(_props: Props) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const { data, isLoading, isError, refetch, isFetching } = useGetPantryQuery();

  const items = data?.payload.pantry_items ?? [];

  // Category chips derived from what the API actually returns.
  const categories = useMemo(() => {
    const unique = [...new Set(items.map((i) => i.category))].sort();
    return ["All", ...unique];
  }, [items]);

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const catMatch = activeCategory === "All" || item.category === activeCategory;
        const qMatch = item.itemName.toLowerCase().includes(query.toLowerCase());
        return catMatch && qMatch;
      }),
    [items, activeCategory, query],
  );

  const healthScore = useMemo(() => computeHealthScore(items), [items]);
  const soonCount = useMemo(
    () => items.filter((i) => getExpiryInfo(i.expiryDate).status !== "fresh").length,
    [items],
  );

  // ── Loading ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <AppScreen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.mutedText}>Loading pantry…</Text>
        </View>
      </AppScreen>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <AppScreen>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Failed to load pantry.</Text>
          <Pressable style={styles.retryBtn} onPress={refetch}>
            <RefreshCw size={14} color={colors.primary} />
            <Text style={styles.retryLabel}>Retry</Text>
          </Pressable>
        </View>
      </AppScreen>
    );
  }

  // ── Success ─────────────────────────────────────────────────────────────
  return (
    <AppScreen>
      <Text style={styles.kicker}>My Pantry</Text>

      {/* ── Health card ──────────────────────────────────────────────────── */}
      <Card containerStyle={styles.healthCard}>
        <Text style={styles.healthTop}>Pantry Health</Text>
        <Text style={styles.healthScore}>{healthScore}</Text>
        <Text style={styles.healthHint}>
          {healthScore >= 80 ? "Excellent" : healthScore >= 50 ? "Fair" : "Needs attention"}
          {soonCount > 0 ? ` · ${soonCount} item${soonCount !== 1 ? "s" : ""} to rescue` : ""}
        </Text>
      </Card>

      {/* ── API status message ───────────────────────────────────────────── */}
      {data?.message ? (
        <View style={styles.messageBanner}>
          <Text style={styles.messageText}>{data.message}</Text>
        </View>
      ) : null}

      {/* ── Search ───────────────────────────────────────────────────────── */}
      <View style={styles.searchWrap}>
        <Search size={15} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search ingredients"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
      </View>

      {/* ── Category filter chips ─────────────────────────────────────────── */}
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        renderItem={({ item }) => {
          const active = item === activeCategory;
          const label = item === "All" ? "All" : (CATEGORY_LABELS[item] ?? item);
          return (
            <Pressable
              onPress={() => setActiveCategory(item)}
              style={[styles.categoryChip, active && styles.categoryChipActive]}
            >
              <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                {label}
              </Text>
            </Pressable>
          );
        }}
        contentContainerStyle={styles.categoriesList}
      />

      {/* ── Buddy suggestion ─────────────────────────────────────────────── */}
      <View style={styles.buddyBox}>
        <Sparkles size={14} color={colors.primary} />
        <Text style={styles.buddyText}>
          {soonCount > 0
            ? `Buddy recommends recipes to use your ${soonCount} expiring item${soonCount !== 1 ? "s" : ""}.`
            : "Your pantry is looking great! Ask Buddy for recipe ideas."}
        </Text>
      </View>

      {/* ── Ingredient grid (RNEUI Card per item) ────────────────────────── */}
      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.itemsList}
        showsVerticalScrollIndicator={false}
        refreshing={isFetching}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.mutedText}>No ingredients found.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const expiry = getExpiryInfo(item.expiryDate);
          const emoji = CATEGORY_EMOJI[item.category] ?? "🍽️";
          return (
            <Card containerStyle={styles.itemCard} wrapperStyle={styles.itemCardInner}>
              <Text style={styles.itemEmoji}>{emoji}</Text>
              <Text style={styles.itemName} numberOfLines={1}>{item.itemName}</Text>
              <Text style={styles.itemQty}>
                {item.quantity} {item.unit}
              </Text>
              <View style={styles.badgeWrap}>
                <ExpiryBadge status={expiry.status} label={expiry.label} />
              </View>
            </Card>
          );
        }}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  // ── Layout ──────────────────────────────────────────────────────────────
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  // ── Kicker ──────────────────────────────────────────────────────────────
  kicker: {
    marginTop: 10,
    color: colors.primary,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "700",
  },
  // ── Health card (RNEUI Card) ─────────────────────────────────────────────
  healthCard: {
    marginTop: 10,
    marginHorizontal: 0,
    borderRadius: 22,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    padding: 18,
  },
  healthTop: {
    color: "#D9FEE7",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  healthScore: {
    color: "#F4FFF8",
    fontSize: 42,
    fontWeight: "700",
    marginTop: 6,
  },
  healthHint: {
    color: "#DBFBE8",
    fontSize: 12,
  },
  // ── API message banner ───────────────────────────────────────────────────
  messageBanner: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    color: colors.muted,
    fontSize: 12,
  },
  // ── Search ───────────────────────────────────────────────────────────────
  searchWrap: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    minHeight: 46,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  // ── Category chips ────────────────────────────────────────────────────────
  categoriesList: {
    paddingVertical: 12,
  },
  categoryChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#F4FFF8",
  },
  // ── Buddy box ─────────────────────────────────────────────────────────────
  buddyBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#7CCB98",
    backgroundColor: "#E8F7EE",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buddyText: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
  },
  // ── Item grid ─────────────────────────────────────────────────────────────
  itemsList: {
    paddingTop: 12,
    paddingBottom: 130,
    gap: 10,
  },
  gridRow: {
    gap: 10,
  },
  /** RNEUI Card container — override defaults for dark theme grid cells. */
  itemCard: {
    flex: 1,
    margin: 0,
    padding: 0,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    // Remove RNEUI default shadow
    shadowColor: "transparent",
    elevation: 0,
  },
  itemCardInner: {
    padding: 12,
  },
  itemEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  itemName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  itemQty: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 3,
  },
  badgeWrap: {
    marginTop: 10,
  },
  // ── States ────────────────────────────────────────────────────────────────
  mutedText: {
    color: colors.muted,
    fontSize: 14,
  },
  errorText: {
    color: "#F87171",
    fontSize: 14,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  retryLabel: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
});
