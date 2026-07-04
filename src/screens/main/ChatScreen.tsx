import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from "@rneui/themed";
import { ArrowUp, ChevronLeft, Mic } from "lucide-react-native";

import type { RootStackParamList } from "../../navigation/types";
import { AppScreen } from "../../components/AppScreen";
import { PromptChip } from "../../components/PromptChip";
import { RECIPES, SUGGESTED_PROMPTS } from "../../data/foodBuddyData";
import { colors } from "../../theme/appTheme";

type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

type Msg = { role: "me" | "ai"; text: string; recipeId?: string };

export function ChatScreen({ navigation, route }: Props) {
  const initialQ = route.params?.q ?? "";
  const [messageText, setMessageText] = useState(initialQ);

  const messages = useMemo<Msg[]>(() => {
    if (!initialQ) {
      return [
        {
          role: "ai",
          text: "Hey Sarvaa. I know your pantry, tastes, and what is expiring. Ask me anything.",
        },
      ];
    }

    return [
      { role: "me", text: initialQ },
      {
        role: "ai",
        text: "Based on your pantry and tonight's expiring cilantro, here is my top pick.",
        recipeId: RECIPES[0].id,
      },
    ];
  }, [initialQ]);

  return (
    <AppScreen withBottomPad={false}>
      <View style={styles.header}>
        <Pressable style={styles.circleBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={18} color={colors.text} />
        </Pressable>
        <View>
          <Text style={styles.headerTop}>Ask</Text>
          <Text style={styles.headerTitle}>Buddy</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent}>
        {messages.map((msg, index) => (
          <View
            key={`${msg.role}-${index}`}
            style={[styles.bubbleRow, msg.role === "me" ? styles.rightAlign : styles.leftAlign]}
          >
            <View style={[styles.bubble, msg.role === "me" ? styles.userBubble : styles.aiBubble]}>
              <Text style={[styles.bubbleText, msg.role === "me" && styles.userBubbleText]}>{msg.text}</Text>
              {msg.recipeId ? (
                <Pressable
                  style={styles.recipeCard}
                  onPress={() => navigation.navigate("Recipe", { id: msg.recipeId as string })}
                >
                  <Text style={styles.recipeEmoji}>{RECIPES[0].emoji}</Text>
                  <View style={styles.recipeMeta}>
                    <Text style={styles.recipeTitle}>{RECIPES[0].title}</Text>
                    <Text style={styles.recipeHint}>25 min · 480 kcal · 8/10 pantry</Text>
                  </View>
                </Pressable>
              ) : null}
            </View>
          </View>
        ))}

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {SUGGESTED_PROMPTS.slice(0, 4).map((prompt) => (
            <PromptChip
              key={prompt}
              label={prompt}
              onPress={() => setMessageText(prompt)}
            />
          ))}
        </ScrollView>
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Ask Buddy anything..."
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <Pressable style={styles.softAction}>
          <Mic size={15} color={colors.text} />
        </Pressable>
        <Pressable style={styles.primaryAction}>
          <ArrowUp size={15} color="#F4FFF8" />
        </Pressable>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1C2A22",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTop: {
    color: colors.muted,
    fontSize: 11,
    textTransform: "uppercase",
    textAlign: "center",
  },
  headerTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  chatArea: {
    marginTop: 14,
  },
  chatContent: {
    paddingBottom: 20,
    gap: 10,
  },
  bubbleRow: {
    flexDirection: "row",
  },
  leftAlign: {
    justifyContent: "flex-start",
  },
  rightAlign: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "88%",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  aiBubble: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userBubble: {
    backgroundColor: colors.primary,
  },
  bubbleText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  userBubbleText: {
    color: "#F4FFF8",
  },
  recipeCard: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  recipeEmoji: {
    fontSize: 28,
  },
  recipeMeta: {
    flex: 1,
  },
  recipeTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  recipeHint: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  inputBar: {
    marginBottom: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  softAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1C2A22",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
