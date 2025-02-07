import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { colors } from './colors';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: colors.white,
    primaryContainer: '#E3F2FD',
    onPrimaryContainer: '#004D90',
    secondary: colors.secondary,
    onSecondary: colors.white,
    secondaryContainer: '#D1F2D3',
    onSecondaryContainer: '#004D1C',
    background: colors.white,
    onBackground: colors.black,
    surface: colors.white,
    onSurface: colors.black,
    surfaceVariant: colors.grey[100],
    onSurfaceVariant: colors.grey[700],
    error: colors.danger,
    onError: colors.white,
    errorContainer: '#FFEBEE',
    onErrorContainer: '#D32F2F',
    outline: colors.grey[400],
    outlineVariant: colors.grey[300],
    elevation: {
      level0: 'transparent',
      level1: colors.white,
      level2: colors.grey[100],
      level3: colors.grey[200],
      level4: colors.grey[300],
      level5: colors.grey[400],
    },
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#4D9FFF', // Lighter blue for better visibility
    onPrimary: colors.black,
    primaryContainer: '#004C99',
    onPrimaryContainer: '#D1E4FF',
    secondary: '#50E070',
    onSecondary: colors.black,
    secondaryContainer: '#005321',
    onSecondaryContainer: '#95F5A8',
    background: colors.black,
    onBackground: colors.white,
    surface: colors.black,
    onSurface: colors.white,
    surfaceVariant: '#1A1A1A',
    onSurfaceVariant: colors.grey[300],
    error: '#FF5252',
    onError: colors.black,
    errorContainer: '#CF6679',
    onErrorContainer: colors.white,
    outline: colors.grey[600],
    outlineVariant: colors.grey[700],
    elevation: {
      level0: colors.black,
      level1: '#1A1A1A',
      level2: '#222222',
      level3: '#272727',
      level4: '#2C2C2C',
      level5: '#333333',
    },
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
  },
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
  },
};