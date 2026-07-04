import React from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from "@rneui/themed";
import { ChevronLeft, Flame, ShoppingBasket, Timer, TrendingUp } from "lucide-react-native";

import type { RootStackParamList } from "../../navigation/types";
import { AppScreen } from "../../components/AppScreen";
import { getRecipe } from "../../data/foodBuddyData";
import { colors } from "../../theme/appTheme";

type Props = NativeStackScreenProps<RootStackParamList, "Recipe">;

function StatPill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={styles.pill}>
      {icon}
      <Text style={styles.pillText}>{text}</Text>
    </View>
  );
}

export function RecipeScreen({ navigation, route }: Props) {
  const recipe = getRecipe(route.params.id);
  const have = recipe.ingredients.filter((item) => item.have);
  const missing = recipe.ingredients.filter((item) => !item.have);

  return (
    <AppScreen withBottomPad={false}>
      <View style={styles.heroWrap}>
        <Text style={styles.heroEmoji}>{recipe.emoji}</Text>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={18} color={colors.text} />
        </Pressable>
      </View>

      <Text style={styles.title}>{recipe.title}</Text>

      <View style={styles.pillsRow}>
        <StatPill icon={<Timer size={13} color={colors.primary} />} text={`${recipe.minutes} min`} />
        <StatPill icon={<Flame size={13} color={colors.primary} />} text={`${recipe.kcal} kcal`} />
        <StatPill icon={<TrendingUp size={13} color={colors.primary} />} text={`${recipe.protein}g protein`} />
      </View>

      <Text style={styles.sectionTitle}>You have</Text>
      <FlatList
        data={have}
        keyExtractor={(item) => item.name}
        numColumns={2}
        columnWrapperStyle={styles.twoColRow}
        contentContainerStyle={styles.haveList}
        renderItem={({ item }) => (
          <View style={styles.haveCard}>
            <View style={styles.haveDot} />
            <View style={styles.haveMeta}>
              <Text style={styles.haveName}>{item.name}</Text>
              <Text style={styles.haveQty}>{item.qty}</Text>
            </View>
          </View>
        )}
      />

      {missing.length ? (
        <>
          <Text style={styles.sectionTitle}>Missing</Text>
          <View style={styles.missingWrap}>
            {missing.map((item) => (
              <View key={item.name} style={styles.missingRow}>
                <View style={styles.missingMeta}>
                  <Text style={styles.missingName}>{item.name}</Text>
                  <Text style={styles.missingQty}>{item.qty}</Text>
                </View>
                <Pressable style={styles.addBtn}>
                  <Text style={styles.addBtnText}>+ Add</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </>
      ) : null}

      <Text style={styles.sectionTitle}>Steps</Text>
      <View style={styles.stepsWrap}>
        {recipe.steps.map((step, index) => (
          <View key={`${step}-${index}`} style={styles.stepRow}>
            <View style={styles.stepNumWrap}>
              <Text style={styles.stepNum}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footerBar}>
        <Pressable style={styles.shopBtn} onPress={() => navigation.navigate("Shopping") }>
          <ShoppingBasket size={14} color={colors.text} />
          <Text style={styles.shopBtnText}>Shopping</Text>
        </Pressable>
        <Pressable style={styles.cookBtn} onPress={() => navigation.navigate("Cook", { id: recipe.id })}>
          <Text style={styles.cookBtnText}>Cook now</Text>
        </Pressable>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    marginTop: 4,
    height: 224,
    borderRadius: 18,
    backgroundColor: "#193C2B",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  heroEmoji: {
    fontSize: 90,
  },
  backBtn: {
    position: "absolute",
    left: 12,
    top: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F4FFF8",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 12,
    color: colors.text,
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 32,
  },
  pillsRow: {
    marginTop: 8,
    flexDirection: "row",
    gap: 8,
  },
  pill: {
    borderRadius: 999,
    backgroundColor: "#F1F5F3",
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pillText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "600",
  },
  sectionTitle: {
    marginTop: 16,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "700",
    fontSize: 11,
  },
  twoColRow: {
    gap: 8,
  },
  haveList: {
    marginTop: 8,
    gap: 8,
  },
  haveCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  haveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  haveMeta: {
    flex: 1,
  },
  haveName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  haveQty: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 2,
  },
  missingWrap: {
    marginTop: 8,
    gap: 8,
  },
  missingRow: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#60460C",
    backgroundColor: "#32260D",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  missingMeta: {
    flex: 1,
  },
  missingName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  missingQty: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  addBtn: {
    borderRadius: 999,
    backgroundColor: colors.text,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addBtnText: {
    color: colors.bg,
    fontSize: 11,
    fontWeight: "700",
  },
  stepsWrap: {
    marginTop: 8,
    gap: 8,
    paddingBottom: 90,
  },
  stepRow: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 10,
    flexDirection: "row",
    gap: 10,
  },
  stepNumWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: {
    color: "#F4FFF8",
    fontSize: 11,
    fontWeight: "700",
  },
  stepText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  footerBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 12,
    flexDirection: "row",
    gap: 8,
  },
  shopBtn: {
    flex: 1,
    minHeight: 50,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  shopBtnText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  cookBtn: {
    flex: 1,
    minHeight: 50,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  cookBtnText: {
    color: "#F4FFF8",
    fontSize: 13,
    fontWeight: "700",
  },
});
