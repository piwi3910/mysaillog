import { MD3DarkTheme, MD3LightTheme, MD3Theme } from 'react-native-paper';
import { Theme } from '@react-navigation/native';

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0066cc',
    onPrimary: '#ffffff',
    primaryContainer: '#d1e4ff',
    onPrimaryContainer: '#001d36',
    secondary: '#03dac6',
    onSecondary: '#ffffff',
    secondaryContainer: '#cef6f0',
    onSecondaryContainer: '#002019',
    background: '#ffffff',
    onBackground: '#000000',
    surface: '#ffffff',
    onSurface: '#000000',
    surfaceVariant: '#f5f5f5',
    onSurfaceVariant: '#000000',
    error: '#B00020',
    onError: '#ffffff',
    errorContainer: '#ffdad6',
    onErrorContainer: '#410002',
    elevation: {
      level0: 'transparent',
      level1: '#fff',
      level2: '#f5f5f5',
      level3: '#e0e0e0',
      level4: '#d6d6d6',
      level5: '#cccccc',
    },
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#4d9fff',
    onPrimary: '#003258',
    primaryContainer: '#004881',
    onPrimaryContainer: '#d1e4ff',
    secondary: '#03dac6',
    onSecondary: '#00382f',
    secondaryContainer: '#005047',
    onSecondaryContainer: '#70f7e7',
    background: '#121212',
    onBackground: '#ffffff',
    surface: '#1e1e1e',
    onSurface: '#ffffff',
    surfaceVariant: '#2c2c2c',
    onSurfaceVariant: '#e0e0e0',
    error: '#cf6679',
    onError: '#680003',
    errorContainer: '#930006',
    onErrorContainer: '#ffdad6',
    elevation: {
      level0: '#121212',
      level1: '#1e1e1e',
      level2: '#232323',
      level3: '#252525',
      level4: '#272727',
      level5: '#2c2c2c',
    },
    surfaceDisabled: '#1e1e1e',
    onSurfaceDisabled: 'rgba(255, 255, 255, 0.38)',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};

// Navigation theme
export const navigationTheme = {
  light: {
    dark: false,
    colors: {
      primary: lightTheme.colors.primary,
      background: lightTheme.colors.background,
      card: lightTheme.colors.surface,
      text: lightTheme.colors.onSurface,
      border: lightTheme.colors.surfaceVariant,
      notification: lightTheme.colors.error,
    },
  } as Theme,
  dark: {
    dark: true,
    colors: {
      primary: darkTheme.colors.primary,
      background: darkTheme.colors.background,
      card: darkTheme.colors.surface,
      text: darkTheme.colors.onSurface,
      border: darkTheme.colors.surfaceVariant,
      notification: darkTheme.colors.error,
    },
  } as Theme,
};