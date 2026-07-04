import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from "@rneui/themed";
import { ArrowUp, ChevronLeft, Mic, Square } from "lucide-react-native";

import type { RootStackParamList } from "../../navigation/types";
import { AppScreen } from "../../components/AppScreen";
import { PromptChip } from "../../components/PromptChip";
import { RECIPES, SUGGESTED_PROMPTS } from "../../data/foodBuddyData";
import { colors } from "../../theme/appTheme";
import { useAppSelector } from "../../store/hooks";
import { useChatStream } from "../../hooks/useChatStream";

type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

export function ChatScreen({ navigation, route }: Props) {
  const initialQ = route.params?.q ?? "";
  const [inputText, setInputText] = useState("give me butter chicken recipe");

  const messages = useAppSelector((state) => state.chat.messages);
  const { sendMessage, cancelStream, isStreaming, error, resetChat } = useChatStream();

  const scrollRef = useRef<ScrollView>(null);
  const hasAutoSent = useRef(false);

  // When opened with a prompt (e.g. from a chip on HomeScreen), reset the
  // conversation and fire the query automatically on first render.
  useEffect(() => {
    if (initialQ && !hasAutoSent.current) {
      hasAutoSent.current = true;
      resetChat();
      // Defer one tick so the clearChat action settles before sending.
      setTimeout(() => sendMessage(initialQ), 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the scroll pinned to the bottom as new tokens arrive.
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || isStreaming) return;
    setInputText("");
    sendMessage(text);
  };

  const handlePromptChip = (prompt: string) => {
    if (isStreaming) return;
    sendMessage(prompt);
  };

  // Resolve a recipe from local mock data (swap for RTK Query when backend is ready).
  const resolveRecipe = (recipeId: string) =>
    RECIPES.find((r) => r.id === recipeId) ?? RECIPES[0];

  return (
    <AppScreen withBottomPad={false}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
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

      {/* ── Message list ───────────────────────────────────────────────────── */}
      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.bubbleRow,
              msg.role === "user" ? styles.rightAlign : styles.leftAlign,
            ]}
          >
            <View
              style={[
                styles.bubble,
                msg.role === "user" ? styles.userBubble : styles.aiBubble,
              ]}
            >
              {/* Message text — show typing dots while the assistant bubble is empty */}
              {msg.isStreaming && msg.content === "" ? (
                <ActivityIndicator size="small" color={colors.muted} />
              ) : (
                <Text
                  style={[
                    styles.bubbleText,
                    msg.role === "user" && styles.userBubbleText,
                  ]}
                >
                  {msg.content}
                  {msg.isStreaming ? (
                    <Text style={styles.streamCursor}>▋</Text>
                  ) : null}
                </Text>
              )}

              {/* Optional recipe card attached to an AI message */}
              {msg.recipeId ? (
                <Pressable
                  style={styles.recipeCard}
                  onPress={() =>
                    navigation.navigate("Recipe", {
                      id: msg.recipeId as string,
                    })
                  }
                >
                  <Text style={styles.recipeEmoji}>
                    {resolveRecipe(msg.recipeId).emoji}
                  </Text>
                  <View style={styles.recipeMeta}>
                    <Text style={styles.recipeTitle}>
                      {resolveRecipe(msg.recipeId).title}
                    </Text>
                    <Text style={styles.recipeHint}>
                      {resolveRecipe(msg.recipeId).minutes} min ·{" "}
                      {resolveRecipe(msg.recipeId).kcal} kcal ·{" "}
                      {resolveRecipe(msg.recipeId).uses}/
                      {resolveRecipe(msg.recipeId).total} pantry
                    </Text>
                  </View>
                </Pressable>
              ) : null}
            </View>
          </View>
        ))}

        {/* Error banner */}
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Suggested prompt chips — hidden while streaming */}
        {!isStreaming && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {SUGGESTED_PROMPTS.slice(0, 4).map((prompt) => (
              <PromptChip
                key={prompt}
                label={prompt}
                onPress={() => handlePromptChip(prompt)}
              />
            ))}
          </ScrollView>
        )}
      </ScrollView>

      {/* ── Input bar ──────────────────────────────────────────────────────── */}
      <View style={styles.inputBar}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
          placeholder="Ask Buddy anything..."
          placeholderTextColor={colors.muted}
          style={styles.input}
          returnKeyType="send"
          editable={!isStreaming}
        />
        <Pressable style={styles.softAction}>
          <Mic size={15} color={colors.text} />
        </Pressable>
        {isStreaming ? (
          // Stop button — cancels the in-flight SSE stream
          <Pressable style={styles.stopAction} onPress={cancelStream}>
            <Square size={14} color="#F4FFF8" fill="#F4FFF8" />
          </Pressable>
        ) : (
          <Pressable
            style={[styles.primaryAction, !inputText.trim() && styles.primaryActionDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <ArrowUp size={15} color="#F4FFF8" />
          </Pressable>
        )}
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
    backgroundColor: "#F1F5F3",
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
    backgroundColor: "#F1F5F3",
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
  primaryActionDisabled: {
    opacity: 0.4,
  },
  stopAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.warning,
    alignItems: "center",
    justifyContent: "center",
  },
  streamCursor: {
    color: colors.primary,
    fontWeight: "700",
  },
  errorBanner: {
    marginHorizontal: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#2A1515",
    borderWidth: 1,
    borderColor: "#5C2020",
  },
  errorText: {
    color: "#F87171",
    fontSize: 13,
  },
});
