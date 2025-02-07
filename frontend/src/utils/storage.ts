import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, Vessel, UserSettings, AnalyticsData } from '../types';

// Storage keys
const STORAGE_KEYS = {
  TRIPS: 'trips',
  VESSELS: 'vessels',
  EQUIPMENT: 'equipment',
  SETTINGS: 'settings',
  ANALYTICS: 'analytics',
  SAFETY_CHECKS: 'safety_checks',
  MAINTENANCE_LOGS: 'maintenance_logs',
  EMERGENCY_CONTACTS: 'emergency_contacts',
} as const;

// Error handling wrapper
const handleStorageOperation = async <T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    throw error;
  }
};

// Generic CRUD operations
const getItems = async <T>(key: string): Promise<T[]> => {
  return handleStorageOperation(async () => {
    const items = await AsyncStorage.getItem(key);
    return items ? JSON.parse(items) : [];
  }, `Error getting items from ${key}`);
};

const setItems = async <T>(key: string, items: T[]): Promise<void> => {
  return handleStorageOperation(async () => {
    await AsyncStorage.setItem(key, JSON.stringify(items));
  }, `Error setting items in ${key}`);
};

const addItem = async <T extends { id: string }>(
  key: string,
  item: T
): Promise<void> => {
  const items = await getItems<T>(key);
  await setItems(key, [...items, item]);
};

const updateItem = async <T extends { id: string }>(
  key: string,
  updatedItem: T
): Promise<void> => {
  const items = await getItems<T>(key);
  const updatedItems = items.map((item) =>
    item.id === updatedItem.id ? updatedItem : item
  );
  await setItems(key, updatedItems);
};

const deleteItem = async <T extends { id: string }>(
  key: string,
  itemId: string
): Promise<void> => {
  const items = await getItems<T>(key);
  await setItems(
    key,
    items.filter((item) => item.id !== itemId)
  );
};

// Specific storage operations
export const TripStorage = {
  getAll: () => getItems<Trip>(STORAGE_KEYS.TRIPS),
  add: (trip: Trip) => addItem(STORAGE_KEYS.TRIPS, trip),
  update: (trip: Trip) => updateItem(STORAGE_KEYS.TRIPS, trip),
  delete: (tripId: string) => deleteItem<Trip>(STORAGE_KEYS.TRIPS, tripId),
  getById: async (tripId: string): Promise<Trip | null> => {
    const trips = await getItems<Trip>(STORAGE_KEYS.TRIPS);
    return trips.find((trip) => trip.id === tripId) || null;
  },
};

export const VesselStorage = {
  getAll: () => getItems<Vessel>(STORAGE_KEYS.VESSELS),
  add: (vessel: Vessel) => addItem(STORAGE_KEYS.VESSELS, vessel),
  update: (vessel: Vessel) => updateItem(STORAGE_KEYS.VESSELS, vessel),
  delete: (vesselId: string) => deleteItem<Vessel>(STORAGE_KEYS.VESSELS, vesselId),
  getById: async (vesselId: string): Promise<Vessel | null> => {
    const vessels = await getItems<Vessel>(STORAGE_KEYS.VESSELS);
    return vessels.find((vessel) => vessel.id === vesselId) || null;
  },
};

// Equipment interfaces and storage
export interface Equipment {
  id: string;
  name: string;
  type: string;
  lastMaintenance: number; // Unix timestamp in milliseconds
  nextMaintenance: number; // Unix timestamp in milliseconds
  notes: string;
}

export const EquipmentStorage = {
  getAll: () => getItems<Equipment>(STORAGE_KEYS.EQUIPMENT),
  add: (equipment: Equipment) => addItem(STORAGE_KEYS.EQUIPMENT, equipment),
  update: (equipment: Equipment) => updateItem(STORAGE_KEYS.EQUIPMENT, equipment),
  delete: (equipmentId: string) => deleteItem<Equipment>(STORAGE_KEYS.EQUIPMENT, equipmentId),
  getByVessel: async (vesselId: string): Promise<Equipment[]> => {
    const vessel = await VesselStorage.getById(vesselId);
    if (!vessel?.equipment) return [];
    const allEquipment = await getItems<Equipment>(STORAGE_KEYS.EQUIPMENT);
    return allEquipment.filter((eq) => vessel.equipment?.includes(eq.id));
  },
};

// Safety checks storage
export interface SafetyCheck {
  id: string;
  vesselId: string;
  timestamp: number;
  items: Array<{
    name: string;
    checked: boolean;
    notes?: string;
  }>;
}

export const SafetyStorage = {
  getChecks: () => getItems<SafetyCheck>(STORAGE_KEYS.SAFETY_CHECKS),
  addCheck: (check: SafetyCheck) => addItem(STORAGE_KEYS.SAFETY_CHECKS, check),
  updateCheck: (check: SafetyCheck) => updateItem(STORAGE_KEYS.SAFETY_CHECKS, check),
  getByVessel: async (vesselId: string): Promise<SafetyCheck[]> => {
    const checks = await getItems<SafetyCheck>(STORAGE_KEYS.SAFETY_CHECKS);
    return checks.filter((check) => check.vesselId === vesselId);
  },
};

// Maintenance logs storage
export interface MaintenanceLog {
  id: string;
  equipmentId: string;
  timestamp: number;
  type: 'routine' | 'repair' | 'replacement';
  description: string;
  cost: number;
  nextDue: number;
}

export const MaintenanceStorage = {
  getLogs: () => getItems<MaintenanceLog>(STORAGE_KEYS.MAINTENANCE_LOGS),
  addLog: (log: MaintenanceLog) => addItem(STORAGE_KEYS.MAINTENANCE_LOGS, log),
  updateLog: (log: MaintenanceLog) => updateItem(STORAGE_KEYS.MAINTENANCE_LOGS, log),
  getByEquipment: async (equipmentId: string): Promise<MaintenanceLog[]> => {
    const logs = await getItems<MaintenanceLog>(STORAGE_KEYS.MAINTENANCE_LOGS);
    return logs.filter((log) => log.equipmentId === equipmentId);
  },
};

// Emergency contacts storage
export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  priority: number;
}

export const EmergencyStorage = {
  getContacts: () => getItems<EmergencyContact>(STORAGE_KEYS.EMERGENCY_CONTACTS),
  addContact: (contact: EmergencyContact) => addItem(STORAGE_KEYS.EMERGENCY_CONTACTS, contact),
  updateContact: (contact: EmergencyContact) => updateItem(STORAGE_KEYS.EMERGENCY_CONTACTS, contact),
  deleteContact: (contactId: string) => deleteItem<EmergencyContact>(STORAGE_KEYS.EMERGENCY_CONTACTS, contactId),
};

// Settings storage
export const SettingsStorage = {
  get: async (): Promise<UserSettings | null> => {
    const settings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : null;
  },
  set: async (settings: UserSettings): Promise<void> => {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },
};

// Analytics storage
export const AnalyticsStorage = {
  get: async (): Promise<AnalyticsData | null> => {
    const analytics = await AsyncStorage.getItem(STORAGE_KEYS.ANALYTICS);
    return analytics ? JSON.parse(analytics) : null;
  },
  set: async (analytics: AnalyticsData): Promise<void> => {
    await AsyncStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics));
  },
  update: async (updateFn: (current: AnalyticsData) => AnalyticsData): Promise<void> => {
    const current = await AnalyticsStorage.get();
    if (current) {
      await AnalyticsStorage.set(updateFn(current));
    }
  },
};