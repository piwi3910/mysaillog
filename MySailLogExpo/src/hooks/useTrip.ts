import { useCallback, useState } from 'react';
import { Trip, TripStatus } from '../models/types';
import * as tripService from '../services/trip';
import { useAuth } from '../contexts/AuthContext';
import { useAnalytics } from './useAnalytics';
import { useErrorHandler } from './useErrorHandler';
import { BaseTripData } from '../types/analytics';

interface TripHookResult {
  trips: Trip[];
  isLoading: boolean;
  loadTrips: () => Promise<void>;
  getTrip: (tripId: string) => Promise<Trip | null>;
  startTrip: (tripData: BaseTripData) => Promise<Trip>;
  endTrip: (tripId: string) => Promise<Trip>;
  updateTrip: (tripId: string, updates: Partial<Trip>) => Promise<Trip>;
  deleteTrip: (tripId: string) => Promise<void>;
}

export function useTrip(): TripHookResult {
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { handleError } = useErrorHandler();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadTrips = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const loadedTrips = await tripService.getTrips(user.id);
      setTrips(loadedTrips);
      void trackEvent('trip_updated', {
        action: 'load',
        count: loadedTrips.length,
      });
    } catch (error) {
      handleError(error, 'Failed to load trips');
    } finally {
      setIsLoading(false);
    }
  }, [user, trackEvent, handleError]);

  const getTrip = useCallback(async (tripId: string) => {
    try {
      const trip = await tripService.getTrip(tripId);
      return trip;
    } catch (error) {
      handleError(error, 'Failed to get trip');
      return null;
    }
  }, [handleError]);

  const startTrip = useCallback(async (tripData: BaseTripData) => {
    if (!user) throw new Error('User must be logged in to start a trip');

    try {
      const trip = await tripService.startTrip({
        ...tripData,
        status: 'active' as TripStatus,
      });

      void trackEvent('trip_started', {
        tripId: trip.id,
        vesselId: trip.vesselId,
      });

      setTrips(prev => [trip, ...prev]);
      return trip;
    } catch (error) {
      handleError(error, 'Failed to start trip');
      throw error;
    }
  }, [user, trackEvent, handleError]);

  const endTrip = useCallback(async (tripId: string) => {
    try {
      const trip = await tripService.endTrip(tripId);

      void trackEvent('trip_ended', {
        tripId: trip.id,
        vesselId: trip.vesselId,
        tripDuration: trip.duration ?? undefined,
        distance: trip.distance ?? undefined,
      });

      setTrips(prev => prev.map(t => t.id === tripId ? trip : t));
      return trip;
    } catch (error) {
      handleError(error, 'Failed to end trip');
      throw error;
    }
  }, [trackEvent, handleError]);

  const updateTrip = useCallback(async (tripId: string, updates: Partial<Trip>) => {
    try {
      const trip = await tripService.updateTrip(tripId, updates);

      void trackEvent('trip_updated', {
        tripId: trip.id,
        vesselId: trip.vesselId,
        action: 'update',
        updatedFields: Object.keys(updates),
      });

      setTrips(prev => prev.map(t => t.id === tripId ? trip : t));
      return trip;
    } catch (error) {
      handleError(error, 'Failed to update trip');
      throw error;
    }
  }, [trackEvent, handleError]);

  const deleteTrip = useCallback(async (tripId: string) => {
    try {
      await tripService.deleteTrip(tripId);
      void trackEvent('trip_deleted', { tripId });
      setTrips(prev => prev.filter(t => t.id !== tripId));
    } catch (error) {
      handleError(error, 'Failed to delete trip');
      throw error;
    }
  }, [trackEvent, handleError]);

  return {
    trips,
    isLoading,
    loadTrips,
    getTrip,
    startTrip,
    endTrip,
    updateTrip,
    deleteTrip,
  };
}