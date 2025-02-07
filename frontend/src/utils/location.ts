import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';
import { GeoPoint } from '../types';

const openLocationSettings = async () => {
  if (Platform.OS === 'ios') {
    await Linking.openURL('app-settings:');
  } else {
    await Linking.openSettings();
  }
};

export const requestLocationPermissions = async (): Promise<boolean> => {
  try {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus !== 'granted') {
      Alert.alert(
        'Location Permission Required',
        'MySailLog needs location access to track your sailing trips. Please enable location services in your device settings.',
        [
          { text: 'Open Settings', onPress: openLocationSettings },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return false;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      Alert.alert(
        'Background Location',
        'Background location access helps track your entire trip. Without it, tracking may be interrupted when the app is in the background.',
        [
          { text: 'Open Settings', onPress: openLocationSettings },
          { text: 'Continue Anyway', style: 'cancel' }
        ]
      );
    }

    return true;
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    return false;
  }
};

export const getCurrentLocation = async (): Promise<GeoPoint | null> => {
  try {
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    Alert.alert(
      'Location Error',
      'Unable to get your current location. Please check your device settings and ensure you have a clear view of the sky.'
    );
    return null;
  }
};

export const startLocationTracking = async (
  onLocationUpdate: (location: GeoPoint) => void
): Promise<() => void> => {
  const hasPermission = await requestLocationPermissions();
  if (!hasPermission) {
    throw new Error('Location permission not granted');
  }

  const subscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 10,
    },
    (location) => {
      onLocationUpdate({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  );

  return () => subscription.remove();
};

export const calculateDistance = (start: GeoPoint, end: GeoPoint): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371e3; // Earth's radius in meters

  const φ1 = toRad(start.latitude);
  const φ2 = toRad(end.latitude);
  const Δφ = toRad(end.latitude - start.latitude);
  const Δλ = toRad(end.longitude - start.longitude);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return (R * c) / 1852; // Convert meters to nautical miles
};