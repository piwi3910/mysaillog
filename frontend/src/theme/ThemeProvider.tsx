import React, { ReactNode } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, useTheme } from 'react-native-paper';
import { theme } from './theme';
import { createNavigationTheme } from './navigation';

type ThemeProviderProps = {
  children: ReactNode;
};

const NavigationThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const paperTheme = useTheme();
  const navigationTheme = createNavigationTheme(paperTheme);

  return (
    <NavigationContainer theme={navigationTheme}>
      {children}
    </NavigationContainer>
  );
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <PaperProvider theme={theme}>
      <NavigationThemeProvider>
        {children}
      </NavigationThemeProvider>
    </PaperProvider>
  );
};
