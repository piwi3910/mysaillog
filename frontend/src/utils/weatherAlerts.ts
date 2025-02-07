import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentWeather } from './weather';
import { Location } from '../types';

const ALERT_THRESHOLDS = {
  WIND_SPEED: 20, // knots
  PRESSURE_DROP: 5, // mb/hour
  VISIBILITY: 1000, // meters
};

const STORAGE_KEYS = {
  WEATHER_HISTORY: 'weather_history',
  ALERT_SETTINGS: 'alert_settings',
};

export interface WeatherAlertSettings {
  enabled: boolean;
  windSpeedThreshold: number;
  pressureDropThreshold: number;
  visibilityThreshold: number;
  notifyOnStorm: boolean;
  notifyOnGale: boolean;
}

interface WeatherHistoryEntry {
  timestamp: number;
  pressure: number;
  windSpeed: number;
}

interface WeatherAlert {
  title: string;
  body: string;
}

const defaultSettings: WeatherAlertSettings = {
  enabled: true,
  windSpeedThreshold: ALERT_THRESHOLDS.WIND_SPEED,
  pressureDropThreshold: ALERT_THRESHOLDS.PRESSURE_DROP,
  visibilityThreshold: ALERT_THRESHOLDS.VISIBILITY,
  notifyOnStorm: true,
  notifyOnGale: true,
};

export const setupNotifications = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('weather-alerts', {
      name: 'Weather Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    throw new Error('Permission to receive notifications was denied');
  }
};

export const getAlertSettings = async (): Promise<WeatherAlertSettings> => {
  const settings = await AsyncStorage.getItem(STORAGE_KEYS.ALERT_SETTINGS);
  return settings ? JSON.parse(settings) : defaultSettings;
};

export const updateAlertSettings = async (settings: Partial<WeatherAlertSettings>) => {
  const currentSettings = await getAlertSettings();
  const updatedSettings = { ...currentSettings, ...settings };
  await AsyncStorage.setItem(STORAGE_KEYS.ALERT_SETTINGS, JSON.stringify(updatedSettings));
  return updatedSettings;
};

export const checkWeatherConditions = async (location: Location) => {
  const settings = await getAlertSettings();
  if (!settings.enabled) return;

  const weather = await getCurrentWeather(location);
  const history = await getWeatherHistory();

  // Add current weather to history
  history.push({
    timestamp: Date.now(),
    pressure: weather.pressure,
    windSpeed: weather.windSpeed,
  });

  // Keep only last 24 hours of data
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentHistory = history.filter((entry: WeatherHistoryEntry) => entry.timestamp > dayAgo);
  await AsyncStorage.setItem(STORAGE_KEYS.WEATHER_HISTORY, JSON.stringify(recentHistory));

  // Check for conditions that warrant alerts
  const alerts: WeatherAlert[] = [];

  // Wind speed alert
  if (weather.windSpeed >= settings.windSpeedThreshold) {
    alerts.push({
      title: 'High Wind Alert',
      body: `Wind speed has reached ${weather.windSpeed.toFixed(1)} knots`,
    });
  }

  // Pressure drop alert
  if (recentHistory.length > 1) {
    const hourAgo = Date.now() - 60 * 60 * 1000;
    const recentPressures = recentHistory
      .filter((entry: WeatherHistoryEntry) => entry.timestamp > hourAgo)
      .map((entry: WeatherHistoryEntry) => entry.pressure);

    if (recentPressures.length > 1) {
      const pressureDrop = recentPressures[0] - recentPressures[recentPressures.length - 1];
      if (pressureDrop >= settings.pressureDropThreshold) {
        alerts.push({
          title: 'Pressure Drop Alert',
          body: `Barometric pressure has dropped ${pressureDrop.toFixed(1)} mb in the last hour`,
        });
      }
    }
  }

  // Send notifications for alerts
  for (const alert of alerts) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: alert.title,
        body: alert.body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });
  }

  return alerts;
};

const getWeatherHistory = async (): Promise<WeatherHistoryEntry[]> => {
  const history = await AsyncStorage.getItem(STORAGE_KEYS.WEATHER_HISTORY);
  return history ? JSON.parse(history) : [];
};

export const startWeatherMonitoring = async (location: Location) => {
  await setupNotifications();
  
  // Check weather conditions immediately
  await checkWeatherConditions(location);

  // Set up periodic weather checks
  const INTERVAL = 15 * 60 * 1000; // 15 minutes
  setInterval(() => checkWeatherConditions(location), INTERVAL);
};

export const stopWeatherMonitoring = () => {
  // Clean up any active intervals or subscriptions
};