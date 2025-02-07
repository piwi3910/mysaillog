import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeProvider';
import { initializeSync } from './src/utils/sync';

const AppContent = () => {
  const { theme } = useAppTheme();

  return (
    <NavigationContainer>
      <PaperProvider theme={theme}>
        <AppNavigator />
      </PaperProvider>
    </NavigationContainer>
  );
};

export default function App() {
  useEffect(() => {
    // Initialize sync system when app starts
    initializeSync();
  }, []);

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
