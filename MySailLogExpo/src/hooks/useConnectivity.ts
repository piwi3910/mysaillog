import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import { useAnalytics } from './useAnalytics';

interface ConnectionQuality {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  strength: 'unknown' | 'poor' | 'good' | 'excellent';
  details: {
    isConnectionExpensive?: boolean;
    cellularGeneration?: string;
    carrier?: string;
    strength?: number;
    ssid?: string;
    frequency?: number;
  };
}

interface ConnectivityHookResult {
  isOnline: boolean;
  isInternetReachable: boolean;
  connectionQuality: ConnectionQuality;
  lastOnline: Date | null;
  checkConnection: () => Promise<boolean>;
  waitForConnection: () => Promise<void>;
}

type ConnectionStrength = 'unknown' | 'poor' | 'good' | 'excellent';

const getConnectionStrength = (state: NetInfoState): ConnectionStrength => {
  if (!state.isConnected) return 'poor';
  
  if (state.type === 'wifi') {
    // For WiFi, we can use the strength property
    const strength = (state.details as any)?.strength;
    if (typeof strength === 'number') {
      if (strength >= -50) return 'excellent';
      if (strength >= -70) return 'good';
      return 'poor';
    }
  } else if (state.type === 'cellular') {
    // For cellular, we can use the generation
    const generation = (state.details as any)?.cellularGeneration;
    switch (generation) {
      case '5g':
        return 'excellent';
      case '4g':
        return 'good';
      case '3g':
        return 'poor';
      default:
        return 'poor';
    }
  }
  
  return 'unknown';
};

export const useConnectivity = (): ConnectivityHookResult => {
  const [isOnline, setIsOnline] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);
  const [lastOnline, setLastOnline] = useState<Date | null>(new Date());
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
    strength: 'unknown',
    details: {}
  });

  const { trackEvent } = useAnalytics();

  const updateConnectionQuality = useCallback((state: NetInfoState) => {
    const quality: ConnectionQuality = {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? false,
      type: state.type,
      strength: getConnectionStrength(state),
      details: {
        isConnectionExpensive: state.details?.isConnectionExpensive,
        ...(state.type === 'cellular' && {
          cellularGeneration: (state.details as any)?.cellularGeneration,
          carrier: (state.details as any)?.carrier
        }),
        ...(state.type === 'wifi' && {
          strength: (state.details as any)?.strength,
          ssid: (state.details as any)?.ssid,
          frequency: (state.details as any)?.frequency
        })
      }
    };

    setConnectionQuality(quality);
    setIsOnline(state.isConnected ?? false);
    setIsInternetReachable(state.isInternetReachable ?? false);

    if (state.isConnected) {
      setLastOnline(new Date());
    }

    // Track significant connectivity changes
    trackEvent('app_connectivity_change' as any, {
      isConnected: state.isConnected,
      type: state.type,
      quality: quality.strength,
      isInternetReachable: state.isInternetReachable
    });
  }, [trackEvent]);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const state = await NetInfo.fetch();
      updateConnectionQuality(state);
      return state.isConnected ?? false;
    } catch (error) {
      console.error('Error checking connection:', error);
      return false;
    }
  }, [updateConnectionQuality]);

  const waitForConnection = useCallback(async (): Promise<void> => {
    return new Promise((resolve) => {
      if (isOnline && isInternetReachable) {
        resolve();
        return;
      }

      const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
        if (state.isConnected && state.isInternetReachable) {
          unsubscribe();
          resolve();
        }
      });
    });
  }, [isOnline, isInternetReachable]);

  useEffect(() => {
    // Initial connection check
    checkConnection();

    // Subscribe to connection changes
    const unsubscribe: NetInfoSubscription = NetInfo.addEventListener(updateConnectionQuality);

    // Periodic connection checks (every 30 seconds)
    const intervalId = setInterval(() => {
      checkConnection();
    }, 30000);

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [checkConnection, updateConnectionQuality]);

  return {
    isOnline,
    isInternetReachable,
    connectionQuality,
    lastOnline,
    checkConnection,
    waitForConnection
  };
};