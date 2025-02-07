import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { useUser } from './UserContext';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  error: string;
  text: string;
  textSecondary: string;
  border: string;
}

const lightColors: ThemeColors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  background: '#FFFFFF',
  surface: '#F2F2F7',
  error: '#FF3B30',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#C6C6C8',
};

const darkColors: ThemeColors = {
  primary: '#0A84FF',
  secondary: '#5E5CE6',
  background: '#000000',
  surface: '#1C1C1E',
  error: '#FF453A',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#38383A',
};

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

const spacing: ThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export interface ThemeRadii {
  sm: number;
  md: number;
  lg: number;
  full: number;
}

const radii: ThemeRadii = {
  sm: 4,
  md: 8,
  lg: 16,
  full: 9999,
};

export interface ThemeShadows {
  sm: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  md: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  lg: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

const shadows: ThemeShadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radii: ThemeRadii;
  shadows: ThemeShadows;
}

interface ThemeContextType {
  theme: Theme;
  colorMode: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const { settings } = useUser();
  const userTheme = settings?.theme || 'system';

  // Determine the active color mode based on user preference and system setting
  const colorMode = userTheme === 'system' ? (systemColorScheme || 'light') : userTheme;

  // Create the theme object based on the color mode
  const theme: Theme = {
    colors: colorMode === 'dark' ? darkColors : lightColors,
    spacing,
    radii,
    shadows,
  };

  const value = {
    theme,
    colorMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context.theme;
}

export function useColorMode(): 'light' | 'dark' {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useColorMode must be used within a ThemeProvider');
  }
  return context.colorMode;
}

// Helper hooks for specific theme properties
export function useColors(): ThemeColors {
  return useTheme().colors;
}

export function useSpacing(): ThemeSpacing {
  return useTheme().spacing;
}

export function useRadii(): ThemeRadii {
  return useTheme().radii;
}

export function useShadows(): ThemeShadows {
  return useTheme().shadows;
}