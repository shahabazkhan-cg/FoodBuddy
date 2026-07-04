import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Card, Text } from "@rneui/themed";
import { Search, Sparkles } from "lucide-react-native";

import type { MainTabParamList } from "../../navigation/types";
import { AppScreen } from "../../components/AppScreen";
import { ExpiryBadge } from "../../components/ExpiryBadge";
import { PANTRY } from "../../data/foodBuddyData";
import { colors } from "../../theme/appTheme";

type Props = BottomTabScreenProps<MainTabParamList, "Pantry">;

const CATEGORIES = ["All", "Produce", "Dairy", "Proteins", "Grains", "Spices"] as const;

export function PantryScreen(_props: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");

  const filtered = useMemo(
    () =>
      PANTRY.filter((item) => {
        const categoryMatch = category === "All" || item.category === category;
        const queryMatch = item.name.toLowerCase().includes(query.toLowerCase());
        return categoryMatch && queryMatch;
      }),
    [category, query],
  );

  return (
    <AppScreen>
      <Text style={styles.kicker}>My Pantry</Text>

      <Card containerStyle={styles.healthCard}>
        <Text style={styles.healthTop}>Pantry Health</Text>
        <Text style={styles.healthScore}>89</Text>
        <Text style={styles.healthHint}>Excellent · 3 ingredients to rescue</Text>
      </Card>

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

      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        renderItem={({ item }) => {
          const active = item === category;
          return (
            <Pressable
              onPress={() => setCategory(item)}
              style={[styles.categoryChip, active && styles.categoryChipActive]}
            >
              <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{item}</Text>
            </Pressable>
          );
        }}
        contentContainerStyle={styles.categoriesList}
      />

      <View style={styles.buddyBox}>
        <Sparkles size={14} color={colors.primary} />
        <Text style={styles.buddyText}>Buddy recommends lemon herb chicken to rescue cilantro and spinach.</Text>
      </View>

      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.itemsList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <Text style={styles.itemEmoji}>{item.emoji}</Text>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.itemQty}>{item.qty}</Text>
            <View style={styles.badgeWrap}>
              <ExpiryBadge status={item.status} label={item.expiryLabel} />
            </View>
          </View>
        )}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    marginTop: 10,
    color: colors.primary,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "700",
  },
  healthCard: {
    marginTop: 10,
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
  itemsList: {
    paddingTop: 12,
    paddingBottom: 130,
    gap: 10,
  },
  gridRow: {
    gap: 10,
  },
  itemCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
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
});
