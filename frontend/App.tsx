import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { initializeSync } from './src/utils/sync';

export default function App() {
  useEffect(() => {
    // Initialize sync system when app starts
    initializeSync();
  }, []);

  return (
    <NavigationContainer>
      <ThemeProvider>
        <PaperProvider>
          <AppNavigator />
        </PaperProvider>
      </ThemeProvider>
    </NavigationContainer>
  );
}
