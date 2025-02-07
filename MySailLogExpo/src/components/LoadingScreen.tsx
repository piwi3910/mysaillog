import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  message?: string;
  style?: ViewStyle;
  messageStyle?: TextStyle;
  spinnerSize?: number | 'small' | 'large';
  spinnerColor?: string;
}

export function LoadingScreen({
  message = 'Loading...',
  style,
  messageStyle,
  spinnerSize = 'large',
  spinnerColor,
}: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, style]}>
      <ActivityIndicator
        size={spinnerSize}
        color={spinnerColor || colors.primary}
        style={styles.spinner}
      />
      {message && (
        <Text
          style={[
            styles.message,
            { color: colors.text },
            messageStyle,
          ]}
        >
          {message}
        </Text>
      )}
    </View>
  );
}

interface LoadingOverlayProps extends Props {
  visible: boolean;
}

export function LoadingOverlay({
  visible,
  ...props
}: LoadingOverlayProps) {
  const { colors } = useTheme();

  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.overlay, { backgroundColor: colors.background + '80' }]}>
      <LoadingScreen {...props} style={styles.overlayContent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 32,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayContent: {
    backgroundColor: 'transparent',
  },
});

export default LoadingScreen;