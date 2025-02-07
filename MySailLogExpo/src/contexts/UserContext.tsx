import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserSettings } from '../models/types';
import { useAuth } from './AuthContext';
import * as settingsService from '../services/settings';
import { useAnalytics } from '../hooks/useAnalytics';

interface UserContextType {
  settings: UserSettings | null;
  isLoading: boolean;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    if (user) {
      loadUserSettings();
    } else {
      setSettings(null);
      setIsLoading(false);
    }
  }, [user]);

  async function loadUserSettings() {
    if (!user) return;

    try {
      setIsLoading(true);
      const userSettings = await settingsService.getUserSettings(user.id);
      setSettings(userSettings);
    } catch (error) {
      console.error('Failed to load user settings:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateSettings(updates: Partial<UserSettings>) {
    if (!user || !settings) {
      throw new Error('No user logged in or settings not loaded');
    }

    try {
      setIsLoading(true);
      const updatedSettings = await settingsService.updateUserSettings(user.id, updates);
      setSettings(updatedSettings);

      void trackEvent('settings_changed', {
        userId: user.id,
        updatedFields: Object.keys(updates),
      });

      // Track specific setting changes
      if (updates.theme) {
        void trackEvent('theme_change', {
          userId: user.id,
          value: updates.theme,
        });
      }

      if (updates.notifications?.enabled !== undefined) {
        void trackEvent('notification_toggle', {
          userId: user.id,
          value: updates.notifications.enabled,
        });
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const value = {
    settings,
    isLoading,
    updateSettings,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Helper hooks for specific settings
export function useTheme() {
  const { settings } = useUser();
  return settings?.theme || 'system';
}

export function useUnits() {
  const { settings } = useUser();
  return settings?.units || {
    distance: 'nm',
    speed: 'kts',
    temperature: 'C',
    pressure: 'hPa',
    windSpeed: 'kts',
  };
}

export function useNotificationSettings() {
  const { settings } = useUser();
  return settings?.notifications || {
    enabled: true,
    weatherAlerts: true,
    tripReminders: true,
  };
}

export function useSyncSettings() {
  const { settings } = useUser();
  return settings?.sync || {
    autoBackup: true,
    backupFrequency: 'daily',
  };
}

export function usePrivacySettings() {
  const { settings } = useUser();
  return settings?.privacy || {
    shareLocation: true,
    shareWeather: true,
    publicProfile: false,
  };
}

export function useDisplaySettings() {
  const { settings } = useUser();
  return settings?.display || {
    showGrid: true,
    compactView: false,
    dateFormat: 'local',
    timeFormat: '24h',
  };
}