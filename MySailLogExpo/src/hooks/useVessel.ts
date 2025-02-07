import { useCallback, useState } from 'react';
import { Vessel } from '../models/types';
import * as vesselService from '../services/vessel';
import { useAuth } from '../contexts/AuthContext';
import { useAnalytics } from './useAnalytics';
import { useErrorHandler } from './useErrorHandler';

interface VesselHookResult {
  vessels: Vessel[];
  isLoading: boolean;
  loadVessels: () => Promise<void>;
  getVessel: (vesselId: string) => Promise<Vessel | null>;
  createVessel: (vesselData: Omit<Vessel, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Vessel>;
  updateVessel: (vesselId: string, updates: Partial<Omit<Vessel, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<Vessel>;
  deleteVessel: (vesselId: string) => Promise<void>;
}

export function useVessel(): VesselHookResult {
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { handleError } = useErrorHandler();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadVessels = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await vesselService.getVessels(user.id);
      if (response.success && response.data) {
        setVessels(response.data);
        void trackEvent('vessel_list_loaded', {
          count: response.data.length,
        });
      }
    } catch (error) {
      handleError(error, 'Failed to load vessels');
    } finally {
      setIsLoading(false);
    }
  }, [user, trackEvent, handleError]);

  const getVessel = useCallback(async (vesselId: string): Promise<Vessel | null> => {
    try {
      const response = await vesselService.getVessel(vesselId);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      handleError(error, 'Failed to get vessel');
      return null;
    }
  }, [handleError]);

  const createVessel = useCallback(async (vesselData: Omit<Vessel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vessel> => {
    if (!user) throw new Error('User must be logged in to create a vessel');

    try {
      const response = await vesselService.createVessel({
        ...vesselData,
        ownerId: user.id,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create vessel');
      }

      void trackEvent('vessel_list_updated', {
        action: 'create',
        vesselId: response.data.id,
        vesselType: response.data.type,
      });

      setVessels(prev => [response.data!, ...prev]);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to create vessel');
      throw error;
    }
  }, [user, trackEvent, handleError]);

  const updateVessel = useCallback(async (
    vesselId: string,
    updates: Partial<Omit<Vessel, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Vessel> => {
    try {
      const response = await vesselService.updateVessel(vesselId, updates);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update vessel');
      }

      void trackEvent('vessel_list_updated', {
        action: 'update',
        vesselId,
        updatedFields: Object.keys(updates),
      });

      setVessels(prev => prev.map(v => v.id === vesselId ? response.data! : v));
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to update vessel');
      throw error;
    }
  }, [trackEvent, handleError]);

  const deleteVessel = useCallback(async (vesselId: string): Promise<void> => {
    try {
      const response = await vesselService.deleteVessel(vesselId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete vessel');
      }

      void trackEvent('vessel_list_updated', {
        action: 'delete',
        vesselId,
      });

      setVessels(prev => prev.filter(v => v.id !== vesselId));
    } catch (error) {
      handleError(error, 'Failed to delete vessel');
      throw error;
    }
  }, [trackEvent, handleError]);

  return {
    vessels,
    isLoading,
    loadVessels,
    getVessel,
    createVessel,
    updateVessel,
    deleteVessel,
  };
}