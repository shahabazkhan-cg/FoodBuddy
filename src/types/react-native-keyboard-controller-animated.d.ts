declare module "react-native-keyboard-controller/lib/module/animated" {
  import type React from "react";

  export type KeyboardProviderProps = {
    children: React.ReactNode;
    statusBarTranslucent?: boolean;
    navigationBarTranslucent?: boolean;
    preserveEdgeToEdge?: boolean;
    enabled?: boolean;
    preload?: boolean;
  };

  export const KeyboardProvider: (
    props: KeyboardProviderProps
  ) => React.JSX.Element;
}
