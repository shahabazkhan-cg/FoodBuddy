import type { NavigatorScreenParams } from "@react-navigation/native";

export type MainTabParamList = {
  Home: undefined;
  Pantry: undefined;
  Meals: undefined;
  Insights: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Onboarding: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Chat: { q?: string } | undefined;
  Scan: undefined;
  ScanResults: undefined;
  Profile: undefined;
  Shopping: undefined;
  Recipe: { id: string };
  Cook: { id: string };
};
