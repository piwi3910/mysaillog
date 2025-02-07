import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeProvider';
import { initializeSync } from './src/utils/sync';

const AppContent = () => {
  const { theme } = useAppTheme();

  return (
    <NavigationContainer theme={theme.dark ? DarkTheme : DefaultTheme}>
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
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
