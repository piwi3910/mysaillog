export interface User {
  id: string;
  username: string;
  created: Date;
  settings: UserSettings;
}

export interface UserSettings {
  darkMode?: boolean;
  units?: {
    speed: 'knots' | 'kph' | 'mph';
    distance: 'nautical' | 'metric' | 'imperial';
    temperature: 'celsius' | 'fahrenheit';
  };
}

export interface Vessel {
  id: string;
  userId: string;
  name: string;
  type: string;
  length: number;
  registrationNumber?: string;
  equipment: Equipment[];
}

export interface Equipment {
  id: string;
  vesselId: string;
  name: string;
  type: string;
  lastMaintenance?: Date;
  notes: string;
}

export interface Trip {
  id: string;
  vesselId: string;
  startTime: Date;
  endTime?: Date;
  startLocation: GeoPoint;
  endLocation?: GeoPoint;
  crewMembers: CrewMember[];
  weatherConditions: WeatherData[];
  engineHours?: number;
  fuelUsage?: number;
  notes?: string;
  route: RoutePoint[];
}

export interface CrewMember {
  name: string;
  role: string;
}

export interface WeatherData {
  timestamp: Date;
  temperature: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  notes: string;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface RoutePoint extends GeoPoint {
  id: string;
  tripId: string;
  timestamp: Date;
  speed?: number;
  heading?: number;
}
