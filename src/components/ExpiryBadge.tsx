import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@rneui/themed";

import { colors } from "../theme/appTheme";

type Props = {
  status: "fresh" | "soon" | "expired";
  label: string;
};

export function ExpiryBadge({ status, label }: Props) {
  const tone =
    status === "expired"
      ? { bg: "#3F1A1A", text: "#FCA5A5" }
      : status === "soon"
        ? { bg: "#3C2A08", text: "#FCD34D" }
        : { bg: "#123025", text: "#86EFAC" };

  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
      <Text style={[styles.text, { color: tone.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
  },
});
