import { Trip, Location, TripStats } from '../types';

export const calculateTripStats = (trip: Trip): TripStats => {
  const duration = calculateDuration(trip);
  const distance = calculateDistance(trip.route);
  const maxSpeed = calculateMaxSpeed(trip.route);
  const averageSpeed = calculateAverageSpeed(distance, duration);

  return {
    duration,
    distance,
    averageSpeed,
    maxSpeed,
    startTime: trip.startTime,
    endTime: trip.endTime,
  };
};

const calculateDuration = (trip: Trip): number => {
  if (!trip.endTime) return 0;
  // Convert milliseconds to minutes
  return Math.round((trip.endTime - trip.startTime) / (1000 * 60));
};

const calculateDistance = (route: Location[]): number => {
  let totalDistance = 0;
  for (let i = 1; i < route.length; i++) {
    totalDistance += getDistanceBetweenPoints(
      route[i - 1].latitude,
      route[i - 1].longitude,
      route[i].latitude,
      route[i].longitude
    );
  }
  return totalDistance;
};

const calculateMaxSpeed = (route: Location[]): number => {
  return Math.max(
    0,
    ...route
      .filter(point => point.speed !== undefined)
      .map(point => point.speed || 0)
  );
};

const calculateAverageSpeed = (distance: number, duration: number): number => {
  if (duration === 0) return 0;
  // Convert duration from minutes to hours and calculate speed in knots
  return distance / (duration / 60);
};

const getDistanceBetweenPoints = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3440.065; // Earth's radius in nautical miles
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}min`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};

export const formatDistance = (distance: number): string => {
  return `${distance.toFixed(1)} nm`;
};

export const formatSpeed = (speed: number): string => {
  return `${speed.toFixed(1)} kts`;
};
