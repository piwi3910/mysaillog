import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { useTheme } from '../contexts/ThemeContext';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
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
        name="Login"
        getComponent={() => require('../screens/auth/LoginScreen').default}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        getComponent={() => require('../screens/auth/RegisterScreen').default}
        options={{
          title: 'Create Account',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        getComponent={() => require('../screens/auth/ForgotPasswordScreen').default}
        options={{
          title: 'Reset Password',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
}