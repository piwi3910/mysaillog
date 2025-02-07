import { useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAnalytics } from './useAnalytics';
import { useSync } from './useSync';
import { useConnectivity } from './useConnectivity';
import { useSettings } from './useSettings';
import { EventName } from '../types/analytics';

interface AppLifecycleHookResult {
  appState: AppStateStatus;
  lastActiveAt: Date | null;
  isActive: boolean;
}

export const useAppLifecycle = (): AppLifecycleHookResult => {
  const { trackEvent } = useAnalytics();
  const { createBackup } = useSync();
  const { checkConnection } = useConnectivity();
  const { settings } = useSettings();
  
  const appState = useRef(AppState.currentState);
  const lastActiveAt = useRef<Date | null>(new Date());
  const isActive = useRef(true);

  const handleAppStateChange = useCallback(async (nextAppState: AppStateStatus) => {
    const previousState = appState.current;
    appState.current = nextAppState;

    // Track state changes
    if (previousState !== nextAppState) {
      if (nextAppState === 'active') {
        // App came to foreground
        isActive.current = true;
        lastActiveAt.current = new Date();
        
        void trackEvent('app_open', {
          previousState,
          timestamp: Date.now()
        });

        // Check connection when app becomes active
        await checkConnection();

      } else if (nextAppState.match(/inactive|background/)) {
        // App went to background
        isActive.current = false;
        
        void trackEvent('app_close', {
          previousState,
          activeTime: lastActiveAt.current 
            ? Date.now() - lastActiveAt.current.getTime()
            : 0,
          timestamp: Date.now()
        });

        // Create backup if enabled and app is going to background
        if (settings.auto_backup && nextAppState === 'background') {
          try {
            await createBackup();
          } catch (error) {
            console.error('Failed to create backup on app background:', error);
          }
        }
      }
    }
  }, [trackEvent, checkConnection, createBackup, settings.auto_backup]);

  // Handle memory warnings
  const handleMemoryWarning = useCallback(() => {
    void trackEvent('app_error', {
      type: 'memory_warning',
      timestamp: Date.now(),
      appState: appState.current
    });

    // Perform cleanup
    if (global.gc) {
      try {
        global.gc();
      } catch (error) {
        console.error('Failed to run garbage collection:', error);
      }
    }
  }, [trackEvent]);

  useEffect(() => {
    // Subscribe to app state changes
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Subscribe to memory warnings
    const memoryWarningSubscription = AppState.addEventListener('memoryWarning', handleMemoryWarning);

    // Track initial app open
    void trackEvent('app_open', {
      previousState: 'unknown',
      timestamp: Date.now()
    });

    return () => {
      // Clean up subscriptions
      appStateSubscription.remove();
      memoryWarningSubscription.remove();

      // Track app close on unmount
      void trackEvent('app_close', {
        previousState: appState.current,
        activeTime: lastActiveAt.current 
          ? Date.now() - lastActiveAt.current.getTime()
          : 0,
        timestamp: Date.now()
      });
    };
  }, [handleAppStateChange, handleMemoryWarning, trackEvent]);

  return {
    appState: appState.current,
    lastActiveAt: lastActiveAt.current,
    isActive: isActive.current
  };
};