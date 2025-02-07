import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { useErrorHandler } from './useErrorHandler';
import { Location as LocationType } from '../models/types';

export interface LocationHookResult {
  getCurrentLocation: () => Promise<LocationType | null>;
  getLocationPermission: () => Promise<boolean>;
  startLocationUpdates: (onUpdate: (location: LocationType) => void) => Promise<void>;
  stopLocationUpdates: () => void;
  isTracking: boolean;
}

export function useLocation(): LocationHookResult {
  const { handleError } = useErrorHandler();
  const [isTracking, setIsTracking] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);

  const getLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        handleError(new Error('Location permission denied'));
        return false;
      }
      return true;
    } catch (error) {
      handleError(error, 'Failed to request location permission');
      return false;
    }
  }, [handleError]);

  const getCurrentLocation = useCallback(async (): Promise<LocationType | null> => {
    try {
      const hasPermission = await getLocationPermission();
      if (!hasPermission) return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date(location.timestamp).toISOString(),
      };
    } catch (error) {
      handleError(error, 'Failed to get current location');
      return null;
    }
  }, [getLocationPermission, handleError]);

  const startLocationUpdates = useCallback(async (onUpdate: (location: LocationType) => void) => {
    try {
      const hasPermission = await getLocationPermission();
      if (!hasPermission) return;

      await Location.startLocationUpdatesAsync('location-tracking', {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          onUpdate({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: new Date(location.timestamp).toISOString(),
          });
        }
      );

      setLocationSubscription(subscription);
      setIsTracking(true);
    } catch (error) {
      handleError(error, 'Failed to start location updates');
    }
  }, [getLocationPermission, handleError]);

  const stopLocationUpdates = useCallback(() => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    void Location.stopLocationUpdatesAsync('location-tracking');
    setIsTracking(false);
  }, [locationSubscription]);

  return {
    getCurrentLocation,
    getLocationPermission,
    startLocationUpdates,
    stopLocationUpdates,
    isTracking,
  };
}