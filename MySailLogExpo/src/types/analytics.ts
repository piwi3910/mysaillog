import { Trip } from '../models/types';

export type EventName =
  // Auth events
  | 'user_login'
  | 'user_logout'
  | 'user_register'
  | 'user_update'
  | 'password_reset'
  // Navigation events
  | 'screen_view'
  | 'deep_link_opened'
  | 'deep_link_not_found'
  | 'deep_link_invalid'
  | 'deep_link_navigation_failed'
  | 'deep_link_error'
  // App lifecycle events
  | 'app_start'
  | 'app_background'
  | 'app_foreground'
  | 'app_crash'
  | 'app_error'
  | 'app_update'
  | 'app_open'
  | 'app_close'
  // Performance events
  | 'performance_measurement_start'
  | 'performance_measurement_end'
  | 'performance_warning'
  | 'performance_app_startup'
  | 'performance_frame_drop'
  // Update events
  | 'update_available'
  | 'update_check_error'
  | 'update_download_start'
  | 'update_download_success'
  | 'update_download_error'
  | 'update_apply'
  | 'update_apply_error'
  | 'store_update_available'
  | 'store_update_check_error'
  // Settings events
  | 'settings_changed'
  | 'theme_change'
  | 'notification_toggle'
  // Trip events
  | 'trip_started'
  | 'trip_ended'
  | 'trip_updated'
  | 'trip_deleted'
  | 'trip_waypoint_added'
  | 'trip_weather_updated'
  | 'trip_crew_updated'
  // Vessel events
  | 'vessel_list_loaded'
  | 'vessel_list_updated'
  | 'vessels_loaded'
  | 'vessel_created'
  | 'vessel_updated'
  | 'vessel_deleted'
  // Weather events
  | 'weather_alert'
  | 'weather_update'
  // Sync events
  | 'sync_started'
  | 'sync_completed'
  | 'sync_failed'
  | 'backup_created'
  | 'backup_restored'
  // Connectivity events
  | 'connectivity_changed';

export type ConnectionQuality = 'unknown' | 'poor' | 'good' | 'excellent';
export type FrameDropSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ActionType = 'create' | 'update' | 'delete' | 'load';

export interface AnalyticsEventProperties {
  // Auth properties
  userId?: string;
  email?: string;
  method?: string;
  updatedFields?: string[];
  // Navigation properties
  screen?: string;
  previousScreen?: string;
  url?: string;
  params?: Record<string, unknown>;
  // App properties
  version?: string;
  platform?: string;
  error?: string;
  stack?: string;
  componentStack?: string;
  // Performance properties
  duration?: number;
  measurementId?: string;
  measurementName?: string;
  name?: string;
  startTime?: number;
  endTime?: number;
  frameTime?: number;
  frameCount?: number;
  droppedFrames?: number;
  totalFrames?: number;
  frameDropRate?: string;
  threshold?: number;
  // Update properties
  currentVersion?: string;
  newVersion?: string;
  storeVersion?: string;
  downloadSize?: number;
  downloadProgress?: number;
  // Trip properties
  tripId?: string;
  vesselId?: string;
  tripDuration?: number;
  distance?: number;
  waypoints?: number;
  crewCount?: number;
  // Vessel properties
  vesselType?: string;
  vesselLength?: number;
  count?: number;
  action?: ActionType;
  // Weather properties
  alertType?: string;
  severity?: string;
  conditions?: string;
  temperature?: number;
  windSpeed?: number;
  // Sync properties
  syncType?: string;
  itemCount?: number;
  backupSize?: number;
  // Connectivity properties
  isConnected?: boolean | null;
  connectionType?: string;
  type?: string;
  quality?: ConnectionQuality;
  isInternetReachable?: boolean;
  // Settings properties
  theme?: 'light' | 'dark' | 'system';
  enabled?: boolean;
  // Generic properties
  source?: string;
  value?: string | number | boolean;
  label?: string;
  success?: boolean;
  mode?: string;
  context?: string;
  timestamp?: string;
}

export interface AnalyticsHookResult {
  trackEvent: (name: EventName, properties?: Partial<AnalyticsEventProperties>) => Promise<void>;
  trackScreen: (screenName: string) => Promise<void>;
  trackError: (error: Error, context?: string) => Promise<void>;
}

export interface DeepLinkEvent {
  type: string;
  url: string;
  params?: Record<string, unknown>;
}

// Re-export for backward compatibility
export type { AnalyticsEventProperties as default };

// Helper types for trips
export type BaseTripData = Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'duration' | 'endTime' | 'distance' | 'status'>;
export type NewTripInput = BaseTripData & { ownerId: string };