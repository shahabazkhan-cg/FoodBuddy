import { createTheme } from "@rneui/themed";

export const colors = {
  bg: "#F8FAF9",          // Main background
  card: "#FFFFFF",        // Cards
  border: "#DDE7E1",      // Light border
  text: "#16211B",        // Primary text
  muted: "#667A70",       // Secondary text
  primary: "#2E9E5A",     // Brand green (slightly darker for contrast)
  primarySoft: "#E8F7EE", // Soft green background
  warning: "#D97706",     // Amber
  success: "#16A34A",     // Success green
};

export const appTheme = createTheme({
  mode: "dark",
  darkColors: {
    primary: colors.primary,
    background: colors.bg,
    black: colors.text,
    grey0: colors.card,
    grey5: colors.muted,
  },
  components: {
    Button: {
      radius: "lg",
      buttonStyle: { minHeight: 52 },
      titleStyle: { fontWeight: "700" },
    },
    Card: {
      containerStyle: {
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderRadius: 16,
        margin: 0,
      },
    },
  },
});
