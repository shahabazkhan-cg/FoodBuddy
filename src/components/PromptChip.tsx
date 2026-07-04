import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Text } from "@rneui/themed";

import { colors } from "../theme/appTheme";

type Props = {
  label: string;
  onPress: () => void;
};

export function PromptChip({ label, onPress }: Props) {
  return (
    <Pressable style={styles.chip} onPress={onPress}>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  text: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
});
