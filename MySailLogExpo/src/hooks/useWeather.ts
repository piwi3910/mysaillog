import { useCallback, useState } from 'react';
import { Location, WeatherRecord } from '../models/types';
import { useErrorHandler } from './useErrorHandler';
import { useSettings } from './useSettings';
import { useAnalytics } from './useAnalytics';

const OPENWEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;

interface WeatherResponse {
  main: {
    temp: number;
    pressure: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
}

export interface WeatherHookResult {
  getWeatherForLocation: (location: Location) => Promise<WeatherRecord | null>;
  isLoading: boolean;
  error: Error | null;
}

export function useWeather(): WeatherHookResult {
  const { handleError } = useErrorHandler();
  const { settings } = useSettings();
  const { trackEvent } = useAnalytics();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getWeatherForLocation = useCallback(async (location: Location): Promise<WeatherRecord | null> => {
    if (!OPENWEATHER_API_KEY) {
      const error = new Error('OpenWeather API key not configured');
      handleError(error);
      setError(error);
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data: WeatherResponse = await response.json();

      const weatherRecord: WeatherRecord = {
        timestamp: location.timestamp || new Date().toISOString(),
        temperature: data.main.temp,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        pressure: data.main.pressure,
        conditions: data.weather[0].main,
      };

      void trackEvent('weather_update', {
        temperature: weatherRecord.temperature,
        windSpeed: weatherRecord.windSpeed,
        conditions: weatherRecord.conditions,
      });

      return weatherRecord;
    } catch (error) {
      handleError(error, 'Failed to fetch weather data');
      setError(error instanceof Error ? error : new Error('Failed to fetch weather data'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, trackEvent]);

  return {
    getWeatherForLocation,
    isLoading,
    error,
  };
}