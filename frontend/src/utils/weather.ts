import { Location, Weather } from '../types';

export const getCurrentWeather = async (location: Location): Promise<Weather> => {
  const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${API_KEY}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const weather: Weather = {
      timestamp: Date.now(),
      windSpeed: convertMpsToKnots(data.wind.speed),
      windDirection: data.wind.deg,
      pressure: data.main.pressure,
      temperature: data.main.temp,
      notes: getWeatherDescription(data.weather[0].description, data.wind.speed),
    };

    return weather;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return {
      timestamp: Date.now(),
      windSpeed: 0,
      windDirection: 0,
      pressure: 1013,
      temperature: 20,
      notes: 'Weather data unavailable',
    };
  }
};

export const getWindDescription = (windSpeed: number): string => {
  return getBeaufortScale(windSpeed);
};

export const getSeaState = (windSpeed: number): string => {
  if (windSpeed < 1) return 'Calm (rippled)';
  if (windSpeed < 4) return 'Calm (wavelets)';
  if (windSpeed < 7) return 'Smooth wavelets';
  if (windSpeed < 11) return 'Slight';
  if (windSpeed < 17) return 'Moderate';
  if (windSpeed < 22) return 'Rough';
  if (windSpeed < 28) return 'Very rough';
  if (windSpeed < 34) return 'High';
  if (windSpeed < 41) return 'Very high';
  if (windSpeed < 48) return 'Phenomenal';
  if (windSpeed < 56) return 'Phenomenal';
  if (windSpeed < 64) return 'Phenomenal';
  return 'Phenomenal';
};

export const getWindDirectionText = (degrees: number): string => {
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW'
  ];
  const index = Math.round(((degrees % 360) / 22.5));
  return directions[index % 16];
};

const convertMpsToKnots = (mps: number): number => {
  return mps * 1.944;
};

const getWeatherDescription = (description: string, windSpeed: number): string => {
  const beaufortScale = getBeaufortScale(windSpeed);
  return `${description}, ${beaufortScale}`;
};

const getBeaufortScale = (windSpeedMps: number): string => {
  const windSpeedKnots = convertMpsToKnots(windSpeedMps);

  if (windSpeedKnots < 1) return 'Calm';
  if (windSpeedKnots < 4) return 'Light air';
  if (windSpeedKnots < 7) return 'Light breeze';
  if (windSpeedKnots < 11) return 'Gentle breeze';
  if (windSpeedKnots < 17) return 'Moderate breeze';
  if (windSpeedKnots < 22) return 'Fresh breeze';
  if (windSpeedKnots < 28) return 'Strong breeze';
  if (windSpeedKnots < 34) return 'Near gale';
  if (windSpeedKnots < 41) return 'Gale';
  if (windSpeedKnots < 48) return 'Strong gale';
  if (windSpeedKnots < 56) return 'Storm';
  if (windSpeedKnots < 64) return 'Violent storm';
  return 'Hurricane';
};
