import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabParamList, TripStackParamList, VesselStackParamList, SettingsStackParamList } from './types';
import { useTheme } from '../contexts/ThemeContext';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator<MainTabParamList>();
const TripStack = createNativeStackNavigator<TripStackParamList>();
const VesselStack = createNativeStackNavigator<VesselStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

function TripNavigator() {
  const { colors } = useTheme();

  return (
    <TripStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <TripStack.Screen
        name="TripList"
        getComponent={() => require('../screens/trips/TripListScreen').default}
        options={{ title: 'Trips' }}
      />
      <TripStack.Screen
        name="TripDetails"
        getComponent={() => require('../screens/trips/TripDetailsScreen').default}
        options={{ title: 'Trip Details' }}
      />
      <TripStack.Screen
        name="NewTrip"
        getComponent={() => require('../screens/trips/NewTripScreen').default}
        options={{ title: 'New Trip' }}
      />
      <TripStack.Screen
        name="EditTrip"
        getComponent={() => require('../screens/trips/EditTripScreen').default}
        options={{ title: 'Edit Trip' }}
      />
    </TripStack.Navigator>
  );
}

function VesselNavigator() {
  const { colors } = useTheme();

  return (
    <VesselStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <VesselStack.Screen
        name="VesselList"
        getComponent={() => require('../screens/vessels/VesselListScreen').default}
        options={{ title: 'Vessels' }}
      />
      <VesselStack.Screen
        name="VesselDetails"
        getComponent={() => require('../screens/vessels/VesselDetailsScreen').default}
        options={{ title: 'Vessel Details' }}
      />
      <VesselStack.Screen
        name="NewVessel"
        getComponent={() => require('../screens/vessels/NewVesselScreen').default}
        options={{ title: 'New Vessel' }}
      />
      <VesselStack.Screen
        name="EditVessel"
        getComponent={() => require('../screens/vessels/EditVesselScreen').default}
        options={{ title: 'Edit Vessel' }}
      />
    </VesselStack.Navigator>
  );
}

function SettingsNavigator() {
  const { colors } = useTheme();

  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <SettingsStack.Screen
        name="SettingsList"
        getComponent={() => require('../screens/settings/SettingsListScreen').default}
        options={{ title: 'Settings' }}
      />
      <SettingsStack.Screen
        name="Profile"
        getComponent={() => require('../screens/settings/ProfileScreen').default}
        options={{ title: 'Profile' }}
      />
      <SettingsStack.Screen
        name="Notifications"
        getComponent={() => require('../screens/settings/NotificationsScreen').default}
        options={{ title: 'Notifications' }}
      />
      <SettingsStack.Screen
        name="Units"
        getComponent={() => require('../screens/settings/UnitsScreen').default}
        options={{ title: 'Units' }}
      />
      <SettingsStack.Screen
        name="Privacy"
        getComponent={() => require('../screens/settings/PrivacyScreen').default}
        options={{ title: 'Privacy' }}
      />
      <SettingsStack.Screen
        name="About"
        getComponent={() => require('../screens/settings/AboutScreen').default}
        options={{ title: 'About' }}
      />
    </SettingsStack.Navigator>
  );
}

export default function MainNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        getComponent={() => require('../screens/HomeScreen').default}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Trips"
        component={TripNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="sail-boat" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Vessels"
        component={VesselNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="ferry" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Weather"
        getComponent={() => require('../screens/WeatherScreen').default}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="weather-partly-cloudy" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}