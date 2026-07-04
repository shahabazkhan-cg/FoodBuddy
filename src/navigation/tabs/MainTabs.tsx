import React from "react";
import { StyleSheet, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "@rneui/themed";
import { Home, Salad, CalendarDays, BarChart3 } from "lucide-react-native";

import type { MainTabParamList } from "../types";
import { colors } from "../../theme/appTheme";
import { HomeScreen } from "../../screens/main/HomeScreen";
import { PantryScreen } from "../../screens/main/PantryScreen";
import { MealsScreen } from "../../screens/main/MealsScreen";
import { InsightsScreen } from "../../screens/main/InsightsScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({
  focused,
  IconComp,
  label,
}: {
  focused: boolean;
  IconComp: typeof Home;
  label: string;
}) {
  return (
    <View style={styles.tabIconWrap}>
      <IconComp color={focused ? colors.primary : colors.muted} size={19} />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} IconComp={Home} label="Home" />
          ),
        }}
      />
      <Tab.Screen
        name="Pantry"
        component={PantryScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} IconComp={Salad} label="Pantry" />
          ),
        }}
      />
      <Tab.Screen
        name="Meals"
        component={MealsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} IconComp={CalendarDays} label="Meals" />
          ),
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} IconComp={BarChart3} label="Insights" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 26,
    height: 72,
    paddingTop: 9,
    paddingBottom: 8,
  },
  tabIconWrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    width: 62,
    marginTop: 4,
  },
  tabLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
  },
  tabLabelActive: {
    color: colors.primary,
  },
});
