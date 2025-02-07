import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import VesselListScreen from '../screens/vessels/VesselListScreen';
import VesselDetailScreen from '../screens/vessels/VesselDetailScreen';
import AddVesselScreen from '../screens/vessels/AddVesselScreen';
import EditVesselScreen from '../screens/vessels/EditVesselScreen';
import { VesselStackParamList } from './types';

const Stack = createNativeStackNavigator<VesselStackParamList>();

const VesselNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="VesselList"
        component={VesselListScreen}
        options={{
          title: 'My Vessels',
        }}
      />
      <Stack.Screen
        name="VesselDetail"
        component={VesselDetailScreen}
        options={{
          title: 'Vessel Details',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="AddVessel"
        component={AddVesselScreen}
        options={{
          title: 'Add Vessel',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="EditVessel"
        component={EditVesselScreen}
        options={{
          title: 'Edit Vessel',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
};

export default VesselNavigator;