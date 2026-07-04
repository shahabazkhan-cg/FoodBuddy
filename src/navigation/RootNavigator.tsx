import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { RootStackParamList } from "./types";
import { MainTabs } from "./tabs/MainTabs";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { OnboardingScreen } from "../screens/auth/OnboardingScreen";
import { ChatScreen } from "../screens/main/ChatScreen";
import { ScanScreen } from "../screens/main/ScanScreen";
import { ScanResultsScreen } from "../screens/main/ScanResultsScreen";
import { ProfileScreen } from "../screens/main/ProfileScreen";
import { ShoppingScreen } from "../screens/main/ShoppingScreen";
import { RecipeScreen } from "../screens/main/RecipeScreen";
import { CookScreen } from "../screens/main/CookScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const isAuthenticated = false;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        </>
      ) : null}
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Scan" component={ScanScreen} />
      <Stack.Screen name="ScanResults" component={ScanResultsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Shopping" component={ShoppingScreen} />
      <Stack.Screen name="Recipe" component={RecipeScreen} />
      <Stack.Screen name="Cook" component={CookScreen} />
    </Stack.Navigator>
  );
}
