import React from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, View } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Card, Text } from "@rneui/themed";
import { Flame, ShoppingBasket, Timer, TrendingUp } from "lucide-react-native";

import type { MainTabParamList, RootStackParamList } from "../../navigation/types";
import { AppScreen } from "../../components/AppScreen";
import { RECIPES } from "../../data/foodBuddyData";
import { colors } from "../../theme/appTheme";

type Props = BottomTabScreenProps<MainTabParamList, "Meals">;
type RootNav = NativeStackNavigationProp<RootStackParamList>;

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function StatPill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={styles.statPill}>
      {icon}
      <Text style={styles.statText}>{text}</Text>
    </View>
  );
}

export function MealsScreen(_props: Props) {
  const navigation = useNavigation<RootNav>();
  const hero = RECIPES[0];

  return (
    <AppScreen>
      <Text style={styles.kicker}>Meal Intelligence</Text>
      <Text style={styles.title}>Tonight&apos;s recommendation</Text>

      <Pressable style={styles.heroCard} onPress={() => navigation.navigate("Recipe", { id: hero.id })}>
        <View style={styles.heroEmojiWrap}>
          <Text style={styles.heroEmoji}>{hero.emoji}</Text>
        </View>
        <View style={styles.heroBody}>
          <Text style={styles.heroRecipe}>{hero.title}</Text>
          <View style={styles.statRow}>
            <StatPill icon={<Timer size={13} color={colors.primary} />} text={`${hero.minutes} min`} />
            <StatPill icon={<Flame size={13} color={colors.primary} />} text={`${hero.kcal} kcal`} />
            <StatPill icon={<TrendingUp size={13} color={colors.primary} />} text={`${hero.protein}g`} />
          </View>
        </View>
      </Pressable>

      <Text style={styles.sectionTitle}>Weekly meal plan</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}>
        {DAYS.map((day, index) => (
          <View key={day} style={[styles.dayCard, index === 0 && styles.dayCardActive]}>
            <Text style={[styles.dayName, index === 0 && styles.dayNameActive]}>{day}</Text>
            <Text style={[styles.dayNum, index === 0 && styles.dayNumActive]}>{index + 3}</Text>
          </View>
        ))}
      </ScrollView>

      <FlatList
        data={[RECIPES[0], RECIPES[1], RECIPES[2], RECIPES[1], RECIPES[0]]}
        keyExtractor={(_, index) => `meal-${index}`}
        contentContainerStyle={styles.weekList}
        renderItem={({ item, index }) => (
          <Pressable
            style={styles.weekItem}
            onPress={() => navigation.navigate("Recipe", { id: item.id })}
          >
            <Text style={styles.weekEmoji}>{item.emoji}</Text>
            <View style={styles.weekMeta}>
              <Text style={styles.weekDay}>{DAYS[index]} · Dinner</Text>
              <Text style={styles.weekTitle}>{item.title}</Text>
              <Text style={styles.weekHint}>{item.minutes} min · {item.uses}/{item.total} pantry</Text>
            </View>
          </Pressable>
        )}
      />

      <Pressable style={styles.shopCard} onPress={() => navigation.navigate("Shopping") }>
        <View style={styles.shopIconWrap}>
          <ShoppingBasket size={17} color={colors.primary} />
        </View>
        <View style={styles.shopMeta}>
          <Text style={styles.shopTitle}>Shopping list</Text>
          <Text style={styles.shopHint}>7 items · $23.90 est.</Text>
        </View>
      </Pressable>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    marginTop: 10,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "700",
    marginTop: 6,
  },
  heroCard: {
    marginTop: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    backgroundColor: colors.card,
  },
  heroEmojiWrap: {
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#193C2B",
  },
  heroEmoji: {
    fontSize: 82,
  },
  heroBody: {
    padding: 14,
  },
  heroRecipe: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  statRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
  },
  statPill: {
    borderRadius: 999,
    backgroundColor: "#1C2A22",
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "600",
  },
  sectionTitle: {
    marginTop: 18,
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  dayScroll: {
    marginTop: 10,
  },
  dayCard: {
    width: 58,
    height: 62,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  dayCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayName: {
    color: colors.muted,
    fontSize: 11,
  },
  dayNameActive: {
    color: "#E8FFF2",
  },
  dayNum: {
    marginTop: 4,
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
  },
  dayNumActive: {
    color: "#F4FFF8",
  },
  weekList: {
    marginTop: 12,
    paddingBottom: 8,
    gap: 9,
  },
  weekItem: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  weekEmoji: {
    fontSize: 30,
  },
  weekMeta: {
    flex: 1,
  },
  weekDay: {
    color: colors.muted,
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  weekTitle: {
    marginTop: 2,
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  weekHint: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 11,
  },
  shopCard: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  shopIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#1C2A22",
    alignItems: "center",
    justifyContent: "center",
  },
  shopMeta: {
    flex: 1,
  },
  shopTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  shopHint: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
});
