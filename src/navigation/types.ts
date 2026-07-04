import type { NavigatorScreenParams } from "@react-navigation/native";

export type VisionExtractItem = {
  itemName: string;
  quantity: number;
  unit: string;
  category: string;
  expiryDate: string;
};

export type VisionExtractResponse = {
  items: VisionExtractItem[];
};

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
  ScanResults: VisionExtractResponse | undefined;
  Profile: undefined;
  Shopping: undefined;
  Recipe: { id: string };
  Cook: { id: string };
};
