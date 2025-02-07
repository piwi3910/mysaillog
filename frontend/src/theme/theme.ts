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
    // Primary colors with better contrast
    primary: '#66B2FF',
    onPrimary: colors.black,
    primaryContainer: '#004C99',
    onPrimaryContainer: '#CCE5FF',
    
    // Secondary colors with better contrast
    secondary: '#50E070',
    onSecondary: colors.black,
    secondaryContainer: '#005321',
    onSecondaryContainer: '#95F5A8',
    
    // True black background
    background: colors.black,
    onBackground: colors.white,
    surface: colors.black,
    onSurface: colors.white,
    
    // Surface variants with better contrast
    surfaceVariant: '#121212',
    onSurfaceVariant: colors.grey[300],
    
    // Error colors with better contrast
    error: '#FF5252',
    onError: colors.black,
    errorContainer: '#CF6679',
    onErrorContainer: colors.white,
    
    // Outline colors
    outline: colors.grey[500],
    outlineVariant: colors.grey[700],
    
    // Elevation with true black base
    elevation: {
      level0: colors.black,
      level1: '#121212',
      level2: '#1E1E1E',
      level3: '#222222',
      level4: '#242424',
      level5: '#272727',
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