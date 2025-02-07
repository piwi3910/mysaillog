import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import TripScreen from '../screens/TripScreen';
import TripHistoryScreen from '../screens/TripHistoryScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import VesselScreen from '../screens/VesselScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            switch (route.name) {
              case 'Home':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'Trip':
                iconName = focused ? 'navigate' : 'navigate-outline';
                break;
              case 'History':
                iconName = focused ? 'time' : 'time-outline';
                break;
              case 'Analytics':
                iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                break;
              case 'Vessels':
                iconName = focused ? 'boat' : 'boat-outline';
                break;
              case 'Settings':
                iconName = focused ? 'settings' : 'settings-outline';
                break;
              default:
                iconName = 'help-outline';
            }

            return <Ionicons name={iconName as any} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'MySailLog'
          }}
        />
        <Tab.Screen 
          name="Trip" 
          component={TripScreen}
          options={{
            title: 'Trip Log'
          }}
        />
        <Tab.Screen 
          name="History" 
          component={TripHistoryScreen}
          options={{
            title: 'History'
          }}
        />
        <Tab.Screen 
          name="Analytics" 
          component={AnalyticsScreen}
          options={{
            title: 'Analytics'
          }}
        />
        <Tab.Screen 
          name="Vessels" 
          component={VesselScreen}
          options={{
            title: 'Vessels'
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            title: 'Settings'
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;