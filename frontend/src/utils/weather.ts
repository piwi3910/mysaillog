import { WeatherData, GeoPoint } from '../types';

const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY || '';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const fetchWeatherData = async (location: GeoPoint): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${location.latitude}&lon=${location.longitude}&units=metric&appid=${API_KEY}`,
    );

    if (!response.ok) {
      throw new Error('Weather data fetch failed');
    }

    const data = await response.json();

    return {
      timestamp: new Date(),
      temperature: Math.round(data.main.temp),
      windSpeed: Math.round(data.wind.speed * 1.944), // Convert m/s to knots
      windDirection: data.wind.deg,
      pressure: data.main.pressure,
      notes: data.weather[0].description,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Return default weather data if API fails
    return {
      timestamp: new Date(),
      temperature: 0,
      windSpeed: 0,
      windDirection: 0,
      pressure: 1013,
      notes: 'Weather data unavailable',
    };
  }
};

export const getBeaufortScale = (windSpeed: number): number => {
  const beaufortScale = [
    { force: 0, maxSpeed: 1 }, // Calm
    { force: 1, maxSpeed: 3 }, // Light air
    { force: 2, maxSpeed: 6 }, // Light breeze
    { force: 3, maxSpeed: 10 }, // Gentle breeze
    { force: 4, maxSpeed: 16 }, // Moderate breeze
    { force: 5, maxSpeed: 21 }, // Fresh breeze
    { force: 6, maxSpeed: 27 }, // Strong breeze
    { force: 7, maxSpeed: 33 }, // Near gale
    { force: 8, maxSpeed: 40 }, // Gale
    { force: 9, maxSpeed: 47 }, // Strong gale
    { force: 10, maxSpeed: 55 }, // Storm
    { force: 11, maxSpeed: 63 }, // Violent storm
    { force: 12, maxSpeed: 999 }, // Hurricane
  ];

  return beaufortScale.findIndex(scale => windSpeed <= scale.maxSpeed);
};

export const getWindDescription = (windSpeed: number): string => {
  const beaufortForce = getBeaufortScale(windSpeed);
  const descriptions = [
    'Calm',
    'Light air',
    'Light breeze',
    'Gentle breeze',
    'Moderate breeze',
    'Fresh breeze',
    'Strong breeze',
    'Near gale',
    'Gale',
    'Strong gale',
    'Storm',
    'Violent storm',
    'Hurricane',
  ];

  return descriptions[beaufortForce];
};

export const getSeaState = (windSpeed: number): string => {
  const beaufortForce = getBeaufortScale(windSpeed);
  const seaStates = [
    'Sea like a mirror',
    'Ripples with appearance of scales',
    'Small wavelets',
    'Large wavelets, crests begin to break',
    'Small waves, becoming longer',
    'Moderate waves, many whitecaps',
    'Large waves, white foam crests extensive',
    'Sea heaps up, foam blown in streaks',
    'Moderately high waves, crests break into spindrift',
    'High waves, dense streaks of foam',
    'Very high waves, surface white with foam',
    'Exceptionally high waves',
    'Air filled with foam and spray',
  ];

  return seaStates[beaufortForce];
};

export const getWindDirectionText = (degrees: number): string => {
  const directions = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};
