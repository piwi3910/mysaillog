import { useCallback } from 'react';
import { Alert } from 'react-native';

interface ErrorHandlerResult {
  handleError: (error: unknown, context?: string) => void;
}

export function useErrorHandler(): ErrorHandlerResult {
  const handleError = useCallback((error: unknown, context?: string) => {
    // Log the error
    console.error(`[Error${context ? ` in ${context}` : ''}]:`, error);

    // In development, show detailed error information
    if (__DEV__) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;

      Alert.alert(
        'Error',
        `${message}\n\n${stack ? `Stack trace:\n${stack}` : ''}`,
        [{ text: 'OK' }]
      );
    } else {
      // In production, show a user-friendly message
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  return { handleError };
}