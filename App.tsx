import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "@rneui/themed";
import { Provider as ReduxProvider } from "react-redux";

import { RootNavigator } from "./src/navigation/RootNavigator";
import { appTheme } from "./src/theme/appTheme";
import { store } from "./src/store";

const queryClient = new QueryClient();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#0B0F0D",
    card: "#111714",
    text: "#E9F2EC",
    border: "#F1F5F3",
    primary: "#3FBF6F",
  },
};

export default function App() {
  return (
    <ReduxProvider store={store}>
      <SafeAreaProvider>
        <ThemeProvider theme={appTheme}>
          <QueryClientProvider client={queryClient}>
            <NavigationContainer theme={navTheme}>
              <StatusBar barStyle="light-content" />
              <RootNavigator />
            </NavigationContainer>
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ReduxProvider>
  );
}
