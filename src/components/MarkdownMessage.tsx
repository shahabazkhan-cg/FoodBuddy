import React from "react";
import Markdown from "react-native-markdown-display";
import { StyleSheet } from "react-native";
import { colors } from "../theme/appTheme";

interface Props {
  content: string;
}

/**
 * Renders AI chat response content as formatted markdown.
 * Handles headings, bullet lists, numbered lists, bold/italic, code blocks, etc.
 */
export function MarkdownMessage({ content }: Props) {
  return (
    <Markdown style={markdownStyles}>{content}</Markdown>
  );
}

const markdownStyles = StyleSheet.create({
  // Base text
  body: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  // Headings
  heading1: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 4,
  },
  heading2: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 4,
  },
  heading3: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 6,
    marginBottom: 2,
  },
  // Paragraphs
  paragraph: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 0,
    marginBottom: 6,
  },
  // Strong / em
  strong: {
    fontWeight: "700",
    color: colors.text,
  },
  em: {
    fontStyle: "italic",
    color: colors.text,
  },
  // Bullet + ordered lists
  bullet_list: {
    marginBottom: 6,
  },
  ordered_list: {
    marginBottom: 6,
  },
  list_item: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 2,
  },
  bullet_list_icon: {
    color: colors.primary,
    fontSize: 16,
    lineHeight: 20,
    marginTop: 1,
  },
  ordered_list_icon: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 1,
  },
  // Inline code
  code_inline: {
    backgroundColor: colors.primarySoft,
    color: colors.primary,
    borderRadius: 4,
    paddingHorizontal: 4,
    fontFamily: "monospace",
    fontSize: 13,
  },
  // Code block
  fence: {
    backgroundColor: "#F1F5F3",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 6,
  },
  code_block: {
    backgroundColor: "#F1F5F3",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 6,
    fontFamily: "monospace",
    fontSize: 13,
    color: colors.text,
  },
  // Blockquote
  blockquote: {
    backgroundColor: colors.primarySoft,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingLeft: 10,
    paddingVertical: 4,
    marginVertical: 6,
    borderRadius: 4,
  },
  // Horizontal rule
  hr: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: 10,
  },
  // Links
  link: {
    color: colors.primary,
    textDecorationLine: "underline",
  },
});
