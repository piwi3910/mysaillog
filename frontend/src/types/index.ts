export interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
  speed?: number;
}

export type GeoPoint = Location;
export type RoutePoint = Location;

export interface Weather {
  timestamp: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  temperature?: number;
  notes: string;
}

export type WeatherData = Weather;

export interface CrewMember {
  name: string;
  role: string;
}

export interface Trip {
  id: string;
  startTime: number; // Unix timestamp in milliseconds
  endTime: number; // Unix timestamp in milliseconds
  route: Location[];
  weatherLog: Weather[];
  weatherConditions?: Weather[]; // For backward compatibility
  crew: CrewMember[];
  crewMembers?: CrewMember[]; // For backward compatibility
  vesselId: string;
  equipment?: string[]; // Optional equipment IDs
}

export interface Vessel {
  id: string;
  name: string;
  type: string;
  length: number;
  registrationNumber: string;
  homePort: string;
  userId?: string;
  equipment?: string[]; // Optional equipment IDs
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  lastMaintenance: number; // Unix timestamp in milliseconds
  nextMaintenance: number; // Unix timestamp in milliseconds
  notes: string;
}

export interface TripStats {
  duration: number; // In minutes
  distance: number; // In nautical miles
  averageSpeed: number; // In knots
  maxSpeed: number; // In knots
  startTime: number; // Unix timestamp in milliseconds
  endTime: number; // Unix timestamp in milliseconds
}

export interface WindRoseData {
  direction: number; // In degrees
  frequency: number; // Percentage
  speed: number; // In knots
}

export interface PopularSailingTime {
  hour: number; // 0-23
  frequency: number; // Percentage
}

export interface AnalyticsData {
  totalTrips: number;
  totalDistance: number; // In nautical miles
  totalDuration: number; // In minutes
  averageTripLength: number; // In nautical miles
  averageDuration: number; // In minutes
  windRose: WindRoseData[];
  popularTimes: PopularSailingTime[];
}

export interface UserSettings {
  theme: 'light' | 'dark';
  darkMode?: boolean; // For backward compatibility
  units: {
    distance: 'nm' | 'km' | 'nautical';
    speed: 'knots' | 'kph';
    temperature: 'celsius' | 'fahrenheit';
  };
  notifications: {
    enabled: boolean;
    tripStart: boolean;
    tripEnd: boolean;
    weather: boolean;
  };
}

// Helper functions for date/time conversions
export const dateToTimestamp = (date: Date): number => date.getTime();
export const timestampToDate = (timestamp: number): Date => new Date(timestamp);
