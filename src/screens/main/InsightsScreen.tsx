import React from "react";
import { StyleSheet, View } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Card, Text } from "@rneui/themed";

import type { MainTabParamList } from "../../navigation/types";
import { AppScreen } from "../../components/AppScreen";
import { colors } from "../../theme/appTheme";

type Props = BottomTabScreenProps<MainTabParamList, "Insights">;

const BARS = [55, 72, 48, 90, 66, 82, 75];
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricHint}>{hint}</Text>
    </View>
  );
}

export function InsightsScreen(_props: Props) {
  return (
    <AppScreen>
      <Text style={styles.kicker}>Insights</Text>
      <Text style={styles.title}>This week in your kitchen</Text>

      <View style={styles.metricsGrid}>
        <Metric label="Money saved" value="$42" hint="vs last week" />
        <Metric label="Waste prevented" value="1.4 kg" hint="3 items rescued" />
        <Metric label="Meals cooked" value="9" hint="Goal 10" />
        <Metric label="Pantry health" value="89" hint="Excellent" />
      </View>

      <Card containerStyle={styles.chartCard}>
        <Text style={styles.chartTitle}>Nutrition · 7 days</Text>
        <View style={styles.barRow}>
          {BARS.map((height, index) => (
            <View key={`${DAYS[index]}-${index}`} style={styles.barCol}>
              <View style={[styles.bar, { height: `${height}%` }]} />
              <Text style={styles.barLabel}>{DAYS[index]}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card containerStyle={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Buddy Summary</Text>
        <Text style={styles.summaryText}>
          You cooked 9 meals this week and saved $42 by using ingredients before they expired.
          Protein is trending up. Next week Buddy will suggest two lower-carb dinners.
        </Text>
      </Card>
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
  metricsGrid: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    width: "48.5%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 12,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  metricValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
    marginTop: 6,
  },
  metricHint: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 4,
  },
  chartCard: {
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderColor: colors.border,
    padding: 14,
  },
  chartTitle: {
    color: colors.muted,
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 1,
  },
  barRow: {
    marginTop: 12,
    height: 130,
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: colors.primary,
  },
  barLabel: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 6,
  },
  summaryCard: {
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: "#E8F7EE",
    borderColor: "#7CCB98",
    padding: 14,
  },
  summaryTitle: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  summaryText: {
    marginTop: 8,
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
  },
});
