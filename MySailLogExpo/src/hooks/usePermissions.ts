import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Alert, Platform } from 'react-native';

interface PermissionStatus {
  location: boolean;
  backgroundLocation: boolean;
  storage: boolean;
}

interface PermissionsHookResult {
  permissions: PermissionStatus;
  isLoading: boolean;
  error: string | null;
  checkPermissions: () => Promise<boolean>;
  requestPermissions: () => Promise<boolean>;
  requestLocationPermission: () => Promise<boolean>;
  requestBackgroundLocationPermission: () => Promise<boolean>;
  requestStoragePermission: () => Promise<boolean>;
}

export const usePermissions = (): PermissionsHookResult => {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    location: false,
    backgroundLocation: false,
    storage: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkPermissions = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // Check location permission
      const locationStatus = await Location.getForegroundPermissionsAsync();
      
      // Check background location permission
      const backgroundLocationStatus = await Location.getBackgroundPermissionsAsync();

      // Check storage permission
      let storagePermission = false;
      if (Platform.OS === 'ios') {
        // iOS doesn't need explicit storage permission
        storagePermission = true;
      } else {
        const mediaStatus = await MediaLibrary.getPermissionsAsync();
        storagePermission = mediaStatus.status === 'granted';
      }

      setPermissions({
        location: locationStatus.status === 'granted',
        backgroundLocation: backgroundLocationStatus.status === 'granted',
        storage: storagePermission
      });

      return locationStatus.status === 'granted' &&
        (Platform.OS === 'ios' || storagePermission);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check permissions';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      
      setPermissions(prev => ({
        ...prev,
        location: granted
      }));

      if (!granted) {
        Alert.alert(
          'Location Permission Required',
          'MySailLog needs location access to track your sailing trips. Please enable location access in your device settings.'
        );
      }

      return granted;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request location permission';
      setError(errorMessage);
      return false;
    }
  };

  const requestBackgroundLocationPermission = async (): Promise<boolean> => {
    try {
      // Background location requires foreground location permission first
      if (!permissions.location) {
        const granted = await requestLocationPermission();
        if (!granted) return false;
      }

      const { status } = await Location.requestBackgroundPermissionsAsync();
      const granted = status === 'granted';
      
      setPermissions(prev => ({
        ...prev,
        backgroundLocation: granted
      }));

      if (!granted) {
        Alert.alert(
          'Background Location',
          'Background location access allows MySailLog to track your trips even when the app is not active. This is recommended for accurate trip logging.'
        );
      }

      return granted;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request background location permission';
      setError(errorMessage);
      return false;
    }
  };

  const requestStoragePermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'ios') {
        // iOS doesn't need explicit storage permission
        setPermissions(prev => ({
          ...prev,
          storage: true
        }));
        return true;
      }

      const { status } = await MediaLibrary.requestPermissionsAsync();
      const granted = status === 'granted';
      
      setPermissions(prev => ({
        ...prev,
        storage: granted
      }));

      if (!granted) {
        Alert.alert(
          'Storage Permission Required',
          'MySailLog needs storage access to save trip data and backups. Please enable storage access in your device settings.'
        );
      }

      return granted;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request storage permission';
      setError(errorMessage);
      return false;
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const locationGranted = await requestLocationPermission();
      if (!locationGranted) return false;

      // Request background location if foreground location was granted
      await requestBackgroundLocationPermission();

      const storageGranted = await requestStoragePermission();
      if (!storageGranted && Platform.OS === 'android') return false;

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permissions';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, []);

  return {
    permissions,
    isLoading,
    error,
    checkPermissions,
    requestPermissions,
    requestLocationPermission,
    requestBackgroundLocationPermission,
    requestStoragePermission
  };
};