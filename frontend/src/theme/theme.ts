import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

declare global {
  namespace ReactNativePaper {
    interface MD3Colors {
      warning: string;
    }
  }
}

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    warning: '#FFA726', // Orange
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    warning: '#FFB74D', // Light Orange
  },
};