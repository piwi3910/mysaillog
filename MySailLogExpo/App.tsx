import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { UserProvider } from './src/contexts/UserContext';
import { ThemeProvider, useTheme, useColorMode } from './src/contexts/ThemeContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import LoadingScreen from './src/components/LoadingScreen';
import { initializeDatabaseAsync } from './src/services/database';
import { useAnalytics } from './src/hooks/useAnalytics';
import { RootStackParamList } from './src/navigation/types';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

function Navigation() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { colors } = useTheme();

  if (isAuthLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      {user ? (
        <Stack.Screen
          name="Main"
          component={MainNavigator}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}

function AppContent() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { trackEvent } = useAnalytics();
  const { colors } = useTheme();
  const colorMode = useColorMode();

  useEffect(() => {
    async function initialize() {
      try {
        // Initialize the database
        await initializeDatabaseAsync();

        // Track app start
        void trackEvent('app_start', {
          timestamp: new Date().toISOString(),
        });

        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize app'));
      }
    }

    void initialize();

    // Track app lifecycle events
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        void trackEvent('app_foreground', {
          timestamp: new Date().toISOString(),
        });
      } else if (nextAppState === 'background') {
        void trackEvent('app_background', {
          timestamp: new Date().toISOString(),
        });
      }
    };

    // Add app state change listener
    // Note: In a real app, you would use AppState.addEventListener
    // and clean it up in the useEffect cleanup function

    return () => {
      // Clean up app state listener
    };
  }, [trackEvent]);

  if (error) {
    return (
      <ErrorBoundary>
        <LoadingScreen
          message="Something went wrong while initializing the app. Please try again."
          spinnerSize="large"
        />
      </ErrorBoundary>
    );
  }

  if (!isInitialized) {
    return (
      <LoadingScreen
        message="Initializing..."
        spinnerSize="large"
      />
    );
  }

  const theme = {
    ...(colorMode === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.error,
    },
  };

  return (
    <NavigationContainer theme={theme}>
      <Navigation />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <UserProvider>
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </UserProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}