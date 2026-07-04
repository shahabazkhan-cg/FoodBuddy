import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from "@rneui/themed";
import { Check, ChevronLeft, CreditCard } from "lucide-react-native";

import type { RootStackParamList } from "../../navigation/types";
import { AppScreen } from "../../components/AppScreen";
import { SHOPPING_LIST } from "../../data/foodBuddyData";
import { colors } from "../../theme/appTheme";

type Props = NativeStackScreenProps<RootStackParamList, "Shopping">;

export function ShoppingScreen({ navigation }: Props) {
  const [done, setDone] = useState<string[]>([]);

  const all = useMemo(() => [...SHOPPING_LIST.today, ...SHOPPING_LIST.week], []);
  const total = useMemo(() => all.reduce((sum, item) => sum + item.price, 0), [all]);

  return (
    <AppScreen withBottomPad={false}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={18} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Smart shopping</Text>
        <View style={styles.sideSpacer} />
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Estimated total</Text>
        <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        <Text style={styles.totalHint}>{all.length} items · covers 3 recipes</Text>
      </View>

      <Group
        title="Need today"
        data={SHOPPING_LIST.today}
        done={done}
        setDone={setDone}
      />
      <Group
        title="Need this week"
        data={SHOPPING_LIST.week}
        done={done}
        setDone={setDone}
      />

      <View style={styles.footerBar}>
        <Pressable style={styles.checkoutBtn}>
          <CreditCard size={15} color="#F4FFF8" />
          <Text style={styles.checkoutText}>Checkout ${total.toFixed(2)}</Text>
        </Pressable>
      </View>
    </AppScreen>
  );
}

function Group({
  title,
  data,
  done,
  setDone,
}: {
  title: string;
  data: { name: string; qty: string; price: number; aisle: string }[];
  done: string[];
  setDone: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  return (
    <View style={styles.groupWrap}>
      <Text style={styles.groupTitle}>{title}</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.name}
        scrollEnabled={false}
        contentContainerStyle={styles.groupList}
        renderItem={({ item }) => {
          const active = done.includes(item.name);
          return (
            <Pressable
              onPress={() =>
                setDone((current) =>
                  active
                    ? current.filter((value) => value !== item.name)
                    : [...current, item.name],
                )
              }
              style={styles.itemRow}
            >
              <View style={[styles.checkCircle, active && styles.checkCircleActive]}>
                {active ? <Check size={12} color="#F4FFF8" /> : null}
              </View>
              <View style={styles.itemMeta}>
                <Text style={[styles.itemName, active && styles.itemNameDone]}>{item.name}</Text>
                <Text style={styles.itemHint}>{item.qty} · {item.aisle}</Text>
              </View>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            </Pressable>
          );
        }}
      />
    </View>
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
    backgroundColor: "#1C2A22",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: colors.muted,
    fontSize: 12,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  sideSpacer: {
    width: 40,
  },
  totalCard: {
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: colors.primary,
    padding: 14,
  },
  totalLabel: {
    color: "#DCFCE8",
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  totalValue: {
    marginTop: 6,
    color: "#F4FFF8",
    fontSize: 42,
    fontWeight: "700",
  },
  totalHint: {
    marginTop: 2,
    color: "#DCFCE8",
    fontSize: 12,
  },
  groupWrap: {
    marginTop: 14,
  },
  groupTitle: {
    color: colors.muted,
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 1,
  },
  groupList: {
    marginTop: 8,
    gap: 8,
  },
  itemRow: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#375245",
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  itemMeta: {
    flex: 1,
  },
  itemName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  itemNameDone: {
    textDecorationLine: "line-through",
    color: colors.muted,
  },
  itemHint: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  price: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  footerBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 12,
  },
  checkoutBtn: {
    minHeight: 50,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  checkoutText: {
    color: "#F4FFF8",
    fontSize: 14,
    fontWeight: "700",
  },
});
