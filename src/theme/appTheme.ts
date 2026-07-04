import { createTheme } from "@rneui/themed";

export const colors = {
  bg: "#0B0F0D",
  card: "#111714",
  border: "#1C2A22",
  text: "#E9F2EC",
  muted: "#8FA79B",
  primary: "#3FBF6F",
  primarySoft: "#153321",
  warning: "#F59E0B",
  success: "#22C55E",
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
