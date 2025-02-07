import { useState, useEffect, useCallback } from 'react';
import { UserSettings } from '../models/types';
import SettingsService from '../services/settings';
import { useUser } from '../contexts/UserContext';
import {
  convertDistance,
  convertSpeed,
  convertTemperature,
  convertPressure
} from '../utils/helpers';

interface SettingsHookResult {
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
  updateSettings: (updates: Partial<UserSettings>) => Promise<boolean>;
  formatDistance: (meters: number) => string;
  formatSpeed: (metersPerSecond: number) => string;
  formatTemperature: (celsius: number) => string;
  formatPressure: (hectopascals: number) => string;
}

const defaultSettings: UserSettings = {
  distance_unit: 'nautical_miles',
  speed_unit: 'knots',
  temperature_unit: 'celsius',
  wind_speed_unit: 'knots',
  pressure_unit: 'hPa',
  theme: 'light',
  auto_backup: false
};

export const useSettings = (): SettingsHookResult => {
  const { user } = useUser();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    if (!user) {
      setSettings(defaultSettings);
      setIsLoading(false);
      return;
    }

    try {
      const settingsService = SettingsService.getInstance();
      const result = await settingsService.getUserSettings(user.id);

      if (result.success && result.data) {
        setSettings(result.data);
      } else {
        // If no settings exist, create default settings
        await settingsService.updateSettings(user.id, defaultSettings);
        setSettings(defaultSettings);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      console.error('Error loading settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = async (updates: Partial<UserSettings>): Promise<boolean> => {
    if (!user) return false;

    try {
      setIsLoading(true);
      const settingsService = SettingsService.getInstance();
      const result = await settingsService.updateSettings(user.id, updates);

      if (result.success && result.data) {
        setSettings(result.data);
        setError(null);
        return true;
      } else {
        throw new Error(result.error || 'Failed to update settings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Format values according to user preferences
  const formatDistance = useCallback(
    (meters: number) => convertDistance(meters, settings.distance_unit),
    [settings.distance_unit]
  );

  const formatSpeed = useCallback(
    (metersPerSecond: number) => convertSpeed(metersPerSecond, settings.speed_unit),
    [settings.speed_unit]
  );

  const formatTemperature = useCallback(
    (celsius: number) => convertTemperature(celsius, settings.temperature_unit),
    [settings.temperature_unit]
  );

  const formatPressure = useCallback(
    (hectopascals: number) => convertPressure(hectopascals, settings.pressure_unit),
    [settings.pressure_unit]
  );

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    formatDistance,
    formatSpeed,
    formatTemperature,
    formatPressure
  };
};