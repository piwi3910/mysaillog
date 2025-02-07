import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TripStackParamList } from './types';
import { useTheme } from '../contexts/ThemeContext';

import TripListScreen from '../screens/trips/TripListScreen';
import TripDetailsScreen from '../screens/trips/TripDetailsScreen';
import NewTripScreen from '../screens/trips/NewTripScreen';
import EditTripScreen from '../screens/trips/EditTripScreen';
import VesselSelectorScreen from '../screens/trips/VesselSelectorScreen';

const Stack = createNativeStackNavigator<TripStackParamList>();

export default function TripNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
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
      <Stack.Screen
        name="TripList"
        component={TripListScreen}
        options={{ title: 'Trips' }}
      />
      <Stack.Screen
        name="TripDetails"
        component={TripDetailsScreen}
        options={{ title: 'Trip Details' }}
      />
      <Stack.Screen
        name="NewTrip"
        component={NewTripScreen}
        options={{ title: 'New Trip' }}
      />
      <Stack.Screen
        name="EditTrip"
        component={EditTripScreen}
        options={{ title: 'Edit Trip' }}
      />
      <Stack.Screen
        name="VesselSelector"
        component={VesselSelectorScreen}
        options={{ title: 'Select Vessel' }}
      />
    </Stack.Navigator>
  );
}