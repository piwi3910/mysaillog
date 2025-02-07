import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import {
  Trip,
  Vessel,
  Equipment,
  CrewMember,
} from '../types';
import {
  SafetyCheck,
  MaintenanceLog,
} from './storage';

const SYNC_KEYS = {
  LAST_SYNC: 'last_sync_timestamp',
  PENDING_UPLOADS: 'pending_uploads',
  SYNC_IN_PROGRESS: 'sync_in_progress',
};

interface PendingUpload {
  type: 'trip' | 'vessel' | 'equipment' | 'safety' | 'maintenance' | 'photo';
  id: string;
  action: 'create' | 'update' | 'delete';
  data?: any;
  timestamp: number;
}

// Track changes that need to be synced
export const trackChange = async (
  type: PendingUpload['type'],
  id: string,
  action: PendingUpload['action'],
  data?: any
) => {
  try {
    const pendingUploadsStr = await AsyncStorage.getItem(SYNC_KEYS.PENDING_UPLOADS);
    const pendingUploads: PendingUpload[] = pendingUploadsStr 
      ? JSON.parse(pendingUploadsStr)
      : [];

    pendingUploads.push({
      type,
      id,
      action,
      data,
      timestamp: Date.now(),
    });

    await AsyncStorage.setItem(SYNC_KEYS.PENDING_UPLOADS, JSON.stringify(pendingUploads));
  } catch (error) {
    console.error('Error tracking change:', error);
  }
};

// Check if sync is needed
const shouldSync = async (): Promise<boolean> => {
  try {
    const syncInProgress = await AsyncStorage.getItem(SYNC_KEYS.SYNC_IN_PROGRESS);
    if (syncInProgress === 'true') return false;

    const pendingUploadsStr = await AsyncStorage.getItem(SYNC_KEYS.PENDING_UPLOADS);
    const pendingUploads = pendingUploadsStr ? JSON.parse(pendingUploadsStr) : [];
    
    return pendingUploads.length > 0;
  } catch (error) {
    console.error('Error checking sync status:', error);
    return false;
  }
};

// Upload a file to the backend
const uploadFile = async (uri: string, type: string): Promise<string> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) throw new Error('File does not exist');

    const formData = new FormData();
    formData.append('file', {
      uri: fileInfo.uri,
      type: 'image/jpeg',
      name: uri.split('/').pop(),
    } as any);

    const response = await fetch('YOUR_BACKEND_URL/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) throw new Error('Upload failed');
    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Sync photos with backend
const syncPhotos = async (pendingUploads: PendingUpload[]) => {
  const photoUploads = pendingUploads.filter(upload => upload.type === 'photo');
  
  for (const upload of photoUploads) {
    try {
      if (upload.action === 'create' || upload.action === 'update') {
        const remoteUrl = await uploadFile(upload.data.uri, upload.data.type);
        // Update local reference with remote URL
        // This would be handled by your data model
      }
    } catch (error) {
      console.error('Error syncing photo:', error);
    }
  }
};

// Sync data with backend
const syncData = async (pendingUploads: PendingUpload[]) => {
  const dataUploads = pendingUploads.filter(upload => upload.type !== 'photo');
  
  for (const upload of dataUploads) {
    try {
      const endpoint = `YOUR_BACKEND_URL/${upload.type}s/${upload.id}`;
      const method = upload.action === 'create' ? 'POST' 
        : upload.action === 'update' ? 'PUT'
        : 'DELETE';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: upload.action !== 'delete' ? JSON.stringify(upload.data) : undefined,
      });

      if (!response.ok) throw new Error(`Sync failed for ${upload.type} ${upload.id}`);
    } catch (error) {
      console.error('Error syncing data:', error);
    }
  }
};

// Main sync function
export const syncWithBackend = async () => {
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected || !netInfo.isInternetReachable) return;

  if (!await shouldSync()) return;

  try {
    // Mark sync as in progress
    await AsyncStorage.setItem(SYNC_KEYS.SYNC_IN_PROGRESS, 'true');

    // Get pending uploads
    const pendingUploadsStr = await AsyncStorage.getItem(SYNC_KEYS.PENDING_UPLOADS);
    const pendingUploads: PendingUpload[] = pendingUploadsStr 
      ? JSON.parse(pendingUploadsStr)
      : [];

    // Sync photos first
    await syncPhotos(pendingUploads);

    // Then sync other data
    await syncData(pendingUploads);

    // Clear pending uploads and update last sync time
    await AsyncStorage.setItem(SYNC_KEYS.PENDING_UPLOADS, JSON.stringify([]));
    await AsyncStorage.setItem(SYNC_KEYS.LAST_SYNC, Date.now().toString());
  } catch (error) {
    console.error('Error during sync:', error);
  } finally {
    // Mark sync as complete
    await AsyncStorage.setItem(SYNC_KEYS.SYNC_IN_PROGRESS, 'false');
  }
};

// Start periodic sync
export const startPeriodicSync = (intervalMs: number = 5 * 60 * 1000) => {
  // Initial sync
  syncWithBackend();

  // Set up periodic sync
  setInterval(syncWithBackend, intervalMs);

  // Set up network change listener
  NetInfo.addEventListener((state: NetInfoState) => {
    if (state.isConnected && state.isInternetReachable) {
      syncWithBackend();
    }
  });
};

// Initialize sync system
export const initializeSync = () => {
  startPeriodicSync();
};