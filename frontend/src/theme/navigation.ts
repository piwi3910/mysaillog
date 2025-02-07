import { DefaultTheme } from '@react-navigation/native';
import { MD3Theme } from 'react-native-paper';

export const createNavigationTheme = (theme: MD3Theme) => ({
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.onSurface,
    border: theme.colors.outline,
    notification: theme.colors.error,
  },
});