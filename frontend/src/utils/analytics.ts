import { Trip, WeatherData } from '../types';

export interface SailingStats {
  totalTrips: number;
  totalDistance: number;
  totalDuration: number;
  averageSpeed: number;
  maxSpeed: number;
  averageTripLength: number;
  mostFrequentConditions: {
    windSpeed: number;
    windDirection: number;
    temperature: number;
  };
  monthlyActivity: {
    [key: string]: {
      trips: number;
      distance: number;
      duration: number;
    };
  };
  timeOfDay: {
    morning: number; // 6-12
    afternoon: number; // 12-18
    evening: number; // 18-24
    night: number; // 0-6
  };
}

export const calculateSailingStats = (trips: Trip[]): SailingStats => {
  const stats: SailingStats = {
    totalTrips: trips.length,
    totalDistance: 0,
    totalDuration: 0,
    averageSpeed: 0,
    maxSpeed: 0,
    averageTripLength: 0,
    mostFrequentConditions: {
      windSpeed: 0,
      windDirection: 0,
      temperature: 0,
    },
    monthlyActivity: {},
    timeOfDay: {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    },
  };

  // Weather condition aggregates
  let totalWindSpeed = 0;
  let totalWindDirection = 0;
  let totalTemperature = 0;
  let weatherDataPoints = 0;

  trips.forEach(trip => {
    // Calculate trip duration
    const startTime = new Date(trip.startTime);
    const endTime = trip.endTime ? new Date(trip.endTime) : new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60); // minutes
    stats.totalDuration += duration;

    // Calculate distance and speed
    let tripDistance = 0;
    for (let i = 1; i < trip.route.length; i++) {
      const distance = calculateDistance(
        trip.route[i - 1].latitude,
        trip.route[i - 1].longitude,
        trip.route[i].latitude,
        trip.route[i].longitude,
      );
      tripDistance += distance;
    }
    stats.totalDistance += tripDistance;

    // Track monthly activity
    const monthKey = startTime.toISOString().slice(0, 7); // YYYY-MM
    if (!stats.monthlyActivity[monthKey]) {
      stats.monthlyActivity[monthKey] = {
        trips: 0,
        distance: 0,
        duration: 0,
      };
    }
    stats.monthlyActivity[monthKey].trips++;
    stats.monthlyActivity[monthKey].distance += tripDistance;
    stats.monthlyActivity[monthKey].duration += duration;

    // Track time of day
    const hour = startTime.getHours();
    if (hour >= 6 && hour < 12) stats.timeOfDay.morning++;
    else if (hour >= 12 && hour < 18) stats.timeOfDay.afternoon++;
    else if (hour >= 18 && hour < 24) stats.timeOfDay.evening++;
    else stats.timeOfDay.night++;

    // Aggregate weather data
    trip.weatherConditions.forEach((weather: WeatherData) => {
      totalWindSpeed += weather.windSpeed;
      totalWindDirection += weather.windDirection;
      totalTemperature += weather.temperature;
      weatherDataPoints++;

      // Track max speed if available in weather data
      if (weather.windSpeed > stats.maxSpeed) {
        stats.maxSpeed = weather.windSpeed;
      }
    });
  });

  // Calculate averages
  if (weatherDataPoints > 0) {
    stats.mostFrequentConditions = {
      windSpeed: totalWindSpeed / weatherDataPoints,
      windDirection: totalWindDirection / weatherDataPoints,
      temperature: totalTemperature / weatherDataPoints,
    };
  }

  if (stats.totalTrips > 0) {
    stats.averageTripLength = stats.totalDistance / stats.totalTrips;
    stats.averageSpeed = stats.totalDistance / (stats.totalDuration / 60); // Convert duration to hours
  }

  return stats;
};

export const getWindRose = (trips: Trip[]) => {
  const directions = Array(16).fill(0); // 16 cardinal directions
  let totalReadings = 0;

  trips.forEach(trip => {
    trip.weatherConditions.forEach(weather => {
      const index = Math.round(weather.windDirection / 22.5) % 16;
      directions[index]++;
      totalReadings++;
    });
  });

  return directions.map(count => (totalReadings > 0 ? count / totalReadings : 0));
};

export const getPopularSailingTimes = (trips: Trip[]) => {
  const hours = Array(24).fill(0);

  trips.forEach(trip => {
    const startHour = new Date(trip.startTime).getHours();
    hours[startHour]++;
  });

  return hours;
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return (R * c) / 1852; // Convert meters to nautical miles
};
