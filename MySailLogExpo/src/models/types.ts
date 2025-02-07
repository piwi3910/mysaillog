export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Vessel {
  id: string;
  ownerId: string;
  name: string;
  type: string;
  length: number;
  homePort?: string;
  registrationNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  ownerId: string;
  vesselId: string;
  name: string;
  status: TripStatus;
  startTime: string;
  endTime?: string | null;
  distance?: number | null;
  duration?: number | null;
  notes?: string | null;
  startLocation?: Location | null;
  endLocation?: Location | null;
  waypoints: Waypoint[];
  weatherRecords: WeatherRecord[];
  crewMembers: CrewMember[];
  createdAt: string;
  updatedAt: string;
}

export type TripStatus = 'active' | 'completed';

export interface Location {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface Waypoint extends Location {
  timestamp: string;
  notes?: string;
}

export interface WeatherRecord {
  timestamp: string;
  temperature: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  conditions: string;
}

export interface CrewMember {
  name: string;
  role: string;
  notes?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  units: {
    distance: DistanceUnit;
    speed: SpeedUnit;
    temperature: TemperatureUnit;
    pressure: PressureUnit;
    windSpeed: WindSpeedUnit;
  };
  notifications: {
    enabled: boolean;
    weatherAlerts: boolean;
    tripReminders: boolean;
  };
  sync: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
  };
  privacy: {
    shareLocation: boolean;
    shareWeather: boolean;
    publicProfile: boolean;
  };
  display: {
    showGrid: boolean;
    compactView: boolean;
    dateFormat: 'local' | 'iso';
    timeFormat: '12h' | '24h';
  };
}

export type DistanceUnit = 'nm' | 'km' | 'mi';
export type SpeedUnit = 'kts' | 'kmh' | 'mph';
export type TemperatureUnit = 'C' | 'F';
export type PressureUnit = 'hPa' | 'mb' | 'inHg';
export type WindSpeedUnit = 'kts' | 'kmh' | 'mph';