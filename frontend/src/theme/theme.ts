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
    // Primary colors
    primary: '#66b3ff', // Lighter blue for better visibility
    onPrimary: '#000000',
    primaryContainer: '#004c99', // Darker blue for containers
    onPrimaryContainer: '#d1e4ff',
    
    // Secondary colors
    secondary: '#03dac6',
    onSecondary: '#000000',
    secondaryContainer: '#018786',
    onSecondaryContainer: '#89ffff',
    
    // Background colors
    background: '#000000', // True black background
    onBackground: '#ffffff',
    
    // Surface colors
    surface: '#000000', // True black surface
    onSurface: '#ffffff',
    surfaceVariant: '#1a1a1a', // Slightly lighter than black for contrast
    onSurfaceVariant: '#e0e0e0',
    
    // Error colors
    error: '#ff5252',
    onError: '#000000',
    errorContainer: '#cf6679',
    onErrorContainer: '#ffffff',
    
    // Elevation levels
    elevation: {
      level0: '#000000',
      level1: '#1a1a1a',
      level2: '#222222',
      level3: '#272727',
      level4: '#2c2c2c',
      level5: '#333333',
    },
    
    // Disabled states
    surfaceDisabled: '#1a1a1a',
    onSurfaceDisabled: 'rgba(255, 255, 255, 0.38)',
    backdrop: 'rgba(0, 0, 0, 0.8)',
    
    // Outline colors
    outline: '#666666',
    outlineVariant: '#444444',
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