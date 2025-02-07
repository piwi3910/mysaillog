import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import SettingsScreen from '../screens/SettingsScreen';
import TripHistoryScreen from '../screens/TripHistoryScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SafetyScreen from '../screens/SafetyScreen';
import EquipmentScreen from '../screens/EquipmentScreen';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const theme = useTheme();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        drawerStyle: {
          backgroundColor: theme.colors.surface,
        },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.onSurfaceVariant,
      }}
    >
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Trip History"
        component={TripHistoryScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Safety"
        component={SafetyScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Equipment"
        component={EquipmentScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="build-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}