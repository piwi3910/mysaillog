import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import HomeScreen from '../screens/HomeScreen';
import TripScreen from '../screens/TripScreen';
import TripHistoryScreen from '../screens/TripHistoryScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SafetyScreen from '../screens/SafetyScreen';
import EquipmentScreen from '../screens/EquipmentScreen';
import VesselsScreen from '../screens/VesselsScreen';
import VesselDetailsScreen from '../screens/VesselDetailsScreen';
import AddVesselScreen from '../screens/AddVesselScreen';
import CrewScreen from '../screens/CrewScreen';
import CrewMemberDetailsScreen from '../screens/CrewMemberDetailsScreen';
import AddCrewMemberScreen from '../screens/AddCrewMemberScreen';
import { VesselStackParamList, CrewStackParamList } from '../types/navigation';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const VesselStack = createStackNavigator<VesselStackParamList>();
const CrewStack = createStackNavigator<CrewStackParamList>();

function VesselStackNavigator() {
  return (
    <VesselStack.Navigator>
      <VesselStack.Screen
        name="VesselsList"
        component={VesselsScreen}
        options={{ headerShown: false }}
      />
      <VesselStack.Screen
        name="VesselDetails"
        component={VesselDetailsScreen}
        options={{ title: 'Vessel Details' }}
      />
      <VesselStack.Screen
        name="AddVessel"
        component={AddVesselScreen}
        options={({ route }) => ({
          title: route.params?.vessel ? 'Edit Vessel' : 'Add New Vessel'
        })}
      />
    </VesselStack.Navigator>
  );
}

function CrewStackNavigator() {
  return (
    <CrewStack.Navigator>
      <CrewStack.Screen
        name="CrewList"
        component={CrewScreen}
        options={{ headerShown: false }}
      />
      <CrewStack.Screen
        name="CrewMemberDetails"
        component={CrewMemberDetailsScreen}
        options={{ title: 'Crew Member Details' }}
      />
      <CrewStack.Screen
        name="AddCrewMember"
        component={AddCrewMemberScreen}
        options={({ route }) => ({
          title: route.params?.crewMember ? 'Edit Crew Member' : 'Add New Crew Member'
        })}
      />
    </CrewStack.Navigator>
  );
}

function TabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Trip':
              iconName = focused ? 'boat' : 'boat-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Trip" component={TripScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
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
        name="Main"
        component={TabNavigator}
        options={{
          title: 'MySailLog',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="boat-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Vessels"
        component={VesselStackNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="boat-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Crew"
        component={CrewStackNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
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
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}
