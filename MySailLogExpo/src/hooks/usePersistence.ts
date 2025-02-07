import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../contexts/UserContext';

interface PersistenceState {
  lastScreen?: string;
  lastVesselId?: string;
  lastTripId?: string;
  recentSearches?: string[];
  darkMode?: boolean;
  notificationsEnabled?: boolean;
  [key: string]: any;
}

interface PersistenceHookResult {
  state: PersistenceState;
  isLoading: boolean;
  error: string | null;
  setValue: <K extends keyof PersistenceState>(key: K, value: PersistenceState[K]) => Promise<void>;
  setValues: (updates: Partial<PersistenceState>) => Promise<void>;
  getValue: <K extends keyof PersistenceState>(key: K) => PersistenceState[K] | undefined;
  removeValue: (key: keyof PersistenceState) => Promise<void>;
  clearAll: () => Promise<void>;
}

const STATE_KEY_PREFIX = '@MySailLog:state:';

export const usePersistence = (): PersistenceHookResult => {
  const { user } = useUser();
  const [state, setState] = useState<PersistenceState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the storage key for the current user
  const getStorageKey = useCallback(() => {
    return user ? `${STATE_KEY_PREFIX}${user.id}` : STATE_KEY_PREFIX;
  }, [user]);

  // Load persisted state
  const loadState = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const storageKey = getStorageKey();
      const jsonValue = await AsyncStorage.getItem(storageKey);
      
      if (jsonValue) {
        const loadedState = JSON.parse(jsonValue);
        setState(loadedState);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load state';
      setError(errorMessage);
      console.error('Error loading persisted state:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getStorageKey]);

  // Save state to persistent storage
  const saveState = useCallback(async (newState: PersistenceState) => {
    try {
      const storageKey = getStorageKey();
      const jsonValue = JSON.stringify(newState);
      await AsyncStorage.setItem(storageKey, jsonValue);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save state';
      setError(errorMessage);
      console.error('Error saving state:', err);
      throw err;
    }
  }, [getStorageKey]);

  // Set a single value
  const setValue = useCallback(async <K extends keyof PersistenceState>(
    key: K,
    value: PersistenceState[K]
  ) => {
    try {
      setError(null);
      const newState = { ...state, [key]: value };
      setState(newState);
      await saveState(newState);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set value';
      setError(errorMessage);
      throw err;
    }
  }, [state, saveState]);

  // Set multiple values at once
  const setValues = useCallback(async (updates: Partial<PersistenceState>) => {
    try {
      setError(null);
      const newState = { ...state, ...updates };
      setState(newState);
      await saveState(newState);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set values';
      setError(errorMessage);
      throw err;
    }
  }, [state, saveState]);

  // Get a value
  const getValue = useCallback(<K extends keyof PersistenceState>(
    key: K
  ): PersistenceState[K] | undefined => {
    return state[key];
  }, [state]);

  // Remove a value
  const removeValue = useCallback(async (key: keyof PersistenceState) => {
    try {
      setError(null);
      const newState = { ...state };
      delete newState[key];
      setState(newState);
      await saveState(newState);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove value';
      setError(errorMessage);
      throw err;
    }
  }, [state, saveState]);

  // Clear all state
  const clearAll = useCallback(async () => {
    try {
      setError(null);
      const storageKey = getStorageKey();
      await AsyncStorage.removeItem(storageKey);
      setState({});
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear state';
      setError(errorMessage);
      throw err;
    }
  }, [getStorageKey]);

  // Load state when user changes
  useEffect(() => {
    loadState();
  }, [loadState, user]);

  return {
    state,
    isLoading,
    error,
    setValue,
    setValues,
    getValue,
    removeValue,
    clearAll
  };
};