import { UserSettings } from '../models/types';

// Date and Time Formatting
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString();
};

export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString();
};

export const formatDateTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

export const formatDuration = (startTime: number, endTime?: number): string => {
  if (!endTime) return 'In Progress';
  const duration = endTime - startTime;
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

// Unit Conversions
export const convertDistance = (
  meters: number,
  unit: UserSettings['distance_unit']
): string => {
  switch (unit) {
    case 'nautical_miles':
      return `${(meters / 1852).toFixed(1)} NM`;
    case 'kilometers':
      return `${(meters / 1000).toFixed(1)} km`;
    case 'miles':
      return `${(meters / 1609.34).toFixed(1)} mi`;
    default:
      return `${meters.toFixed(1)} m`;
  }
};

export const convertSpeed = (
  metersPerSecond: number,
  unit: UserSettings['speed_unit']
): string => {
  switch (unit) {
    case 'knots':
      return `${(metersPerSecond * 1.944).toFixed(1)} kts`;
    case 'kph':
      return `${(metersPerSecond * 3.6).toFixed(1)} km/h`;
    case 'mph':
      return `${(metersPerSecond * 2.237).toFixed(1)} mph`;
    default:
      return `${metersPerSecond.toFixed(1)} m/s`;
  }
};

export const convertTemperature = (
  celsius: number,
  unit: UserSettings['temperature_unit']
): string => {
  switch (unit) {
    case 'fahrenheit':
      return `${((celsius * 9/5) + 32).toFixed(1)}°F`;
    default:
      return `${celsius.toFixed(1)}°C`;
  }
};

export const convertPressure = (
  hectopascals: number,
  unit: UserSettings['pressure_unit']
): string => {
  switch (unit) {
    case 'inHg':
      return `${(hectopascals * 0.02953).toFixed(2)} inHg`;
    default:
      return `${hectopascals.toFixed(1)} hPa`;
  }
};

// Validation Functions
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
};

export const isValidLatitude = (latitude: number): boolean => {
  return latitude >= -90 && latitude <= 90;
};

export const isValidLongitude = (longitude: number): boolean => {
  return longitude >= -180 && longitude <= 180;
};

// Wind Direction to Cardinal Points
export const degreesToCardinal = (degrees: number): string => {
  const cardinals = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW'
  ];
  const index = Math.round(((degrees % 360) / 22.5));
  return cardinals[index % 16];
};

// Beaufort Scale
export const getBeaufortScale = (windSpeed: number): {
  force: number;
  description: string;
} => {
  // Wind speed in knots
  if (windSpeed < 1) return { force: 0, description: 'Calm' };
  if (windSpeed < 4) return { force: 1, description: 'Light air' };
  if (windSpeed < 7) return { force: 2, description: 'Light breeze' };
  if (windSpeed < 11) return { force: 3, description: 'Gentle breeze' };
  if (windSpeed < 17) return { force: 4, description: 'Moderate breeze' };
  if (windSpeed < 22) return { force: 5, description: 'Fresh breeze' };
  if (windSpeed < 28) return { force: 6, description: 'Strong breeze' };
  if (windSpeed < 34) return { force: 7, description: 'Near gale' };
  if (windSpeed < 41) return { force: 8, description: 'Gale' };
  if (windSpeed < 48) return { force: 9, description: 'Strong gale' };
  if (windSpeed < 56) return { force: 10, description: 'Storm' };
  if (windSpeed < 64) return { force: 11, description: 'Violent storm' };
  return { force: 12, description: 'Hurricane force' };
};

// Error Messages
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
};