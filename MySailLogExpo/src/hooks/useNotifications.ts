import { useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { WeatherRecord } from '../models/types';
import { getBeaufortScale } from '../utils/helpers';

// Configure default notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface NotificationHookResult {
  hasPermission: boolean;
  isLoading: boolean;
  error: string | null;
  requestPermissions: () => Promise<boolean>;
  scheduleMaintenanceReminder: (vesselId: string, vesselName: string, maintenanceDate: Date) => Promise<string>;
  cancelMaintenanceReminder: (notificationId: string) => Promise<boolean>;
  showTripStartNotification: () => Promise<void>;
  showTripEndNotification: (duration: string, distance: string) => Promise<void>;
  showWeatherAlert: (weather: WeatherRecord) => Promise<void>;
}

export const useNotifications = (): NotificationHookResult => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      setHasPermission(existingStatus === 'granted');
    } catch (err) {
      console.error('Error checking notification permissions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: true,
        },
      });

      const granted = status === 'granted';
      setHasPermission(granted);
      return granted;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request notification permissions';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleMaintenanceReminder = async (
    vesselId: string,
    vesselName: string,
    maintenanceDate: Date
  ): Promise<string> => {
    try {
      if (!hasPermission) {
        const granted = await requestPermissions();
        if (!granted) throw new Error('Notification permission required');
      }

      // Schedule notification for 1 day before maintenance
      const trigger = new Date(maintenanceDate);
      trigger.setDate(trigger.getDate() - 1);
      trigger.setHours(9, 0, 0); // 9 AM

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Maintenance Reminder',
          body: `Scheduled maintenance for ${vesselName} is due tomorrow`,
          data: { vesselId },
        },
        trigger,
      });

      return notificationId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to schedule maintenance reminder';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const cancelMaintenanceReminder = async (notificationId: string): Promise<boolean> => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel maintenance reminder';
      setError(errorMessage);
      return false;
    }
  };

  const showTripStartNotification = async (): Promise<void> => {
    if (!hasPermission) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Trip Started',
          body: 'Your sailing trip has started. Safe travels!',
        },
        trigger: null, // Show immediately
      });
    } catch (err) {
      console.error('Error showing trip start notification:', err);
    }
  };

  const showTripEndNotification = async (
    duration: string,
    distance: string
  ): Promise<void> => {
    if (!hasPermission) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Trip Completed',
          body: `Trip completed successfully!\nDuration: ${duration}\nDistance: ${distance}`,
        },
        trigger: null, // Show immediately
      });
    } catch (err) {
      console.error('Error showing trip end notification:', err);
    }
  };

  const showWeatherAlert = async (weather: WeatherRecord): Promise<void> => {
    if (!hasPermission || !weather.wind_speed) return;

    try {
      const beaufort = getBeaufortScale(weather.wind_speed);
      
      // Show alerts for strong winds (Beaufort force 6 or higher)
      if (beaufort.force >= 6) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Weather Alert',
            body: `Current conditions: ${beaufort.description}\nWind speed: ${weather.wind_speed} knots`,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: null, // Show immediately
        });
      }
    } catch (err) {
      console.error('Error showing weather alert:', err);
    }
  };

  return {
    hasPermission,
    isLoading,
    error,
    requestPermissions,
    scheduleMaintenanceReminder,
    cancelMaintenanceReminder,
    showTripStartNotification,
    showTripEndNotification,
    showWeatherAlert,
  };
};