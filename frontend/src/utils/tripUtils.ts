import { GeoPoint, RoutePoint, Trip } from '../types';

export const createRoutePoint = (
  geoPoint: GeoPoint,
  tripId: string,
  speed?: number,
  heading?: number
): RoutePoint => ({
  ...geoPoint,
  id: Date.now().toString(),
  tripId,
  timestamp: new Date(),
  speed,
  heading,
});

export const formatCoordinate = (coord: number): string => {
  return coord.toFixed(6);
};

export const calculateDistance = (point1: GeoPoint, point2: GeoPoint): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (point1.latitude * Math.PI) / 180;
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

export const calculateTripStats = (trip: Trip) => {
  let totalDistance = 0;
  let maxSpeed = 0;

  for (let i = 1; i < trip.route.length; i++) {
    const distance = calculateDistance(trip.route[i - 1], trip.route[i]);
    totalDistance += distance;

    if (trip.route[i].speed && trip.route[i].speed! > maxSpeed) {
      maxSpeed = trip.route[i].speed!;
    }
  }

  const duration = trip.endTime
    ? new Date(trip.endTime).getTime() - new Date(trip.startTime).getTime()
    : 0;

  return {
    totalDistance: totalDistance / 1852, // Convert meters to nautical miles
    maxSpeed,
    duration: Math.floor(duration / 1000 / 60), // Duration in minutes
  };
};