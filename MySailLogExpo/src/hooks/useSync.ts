import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from './useSettings';
import { useUser } from '../contexts/UserContext';
import DatabaseService from '../services/database';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

const BACKUP_KEY = '@last_backup_timestamp';
const BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface SyncHookResult {
  isSyncing: boolean;
  lastBackupDate: Date | null;
  error: string | null;
  createBackup: () => Promise<boolean>;
  restoreBackup: (uri: string) => Promise<boolean>;
  exportData: () => Promise<string | null>;
  importData: (data: string) => Promise<boolean>;
}

export const useSync = (): SyncHookResult => {
  const { user } = useUser();
  const { settings } = useSettings();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastBackupDate, setLastBackupDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load last backup date
  useEffect(() => {
    const loadLastBackupDate = async () => {
      try {
        const timestamp = await AsyncStorage.getItem(BACKUP_KEY);
        if (timestamp) {
          setLastBackupDate(new Date(parseInt(timestamp, 10)));
        }
      } catch (err) {
        console.error('Error loading last backup date:', err);
      }
    };

    loadLastBackupDate();
  }, []);

  // Check and create automatic backup if needed
  useEffect(() => {
    const checkAutoBackup = async () => {
      if (!settings.auto_backup || !user) return;

      const now = Date.now();
      if (!lastBackupDate || (now - lastBackupDate.getTime()) > BACKUP_INTERVAL) {
        await createBackup();
      }
    };

    checkAutoBackup();
  }, [settings.auto_backup, lastBackupDate, user]);

  const createBackup = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      setIsSyncing(true);
      setError(null);

      // Export database
      const data = await exportData();
      if (!data) throw new Error('Failed to export data');

      // Create backup directory if it doesn't exist
      const backupDir = `${FileSystem.documentDirectory}backups`;
      const dirInfo = await FileSystem.getInfoAsync(backupDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(backupDir);
      }

      // Save backup file
      const timestamp = Date.now();
      const filename = `mysaillog_backup_${timestamp}.json`;
      const fileUri = `${backupDir}/${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, data);

      // Update last backup date
      await AsyncStorage.setItem(BACKUP_KEY, timestamp.toString());
      setLastBackupDate(new Date(timestamp));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create backup';
      setError(errorMessage);
      Alert.alert('Backup Error', errorMessage);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const restoreBackup = async (uri: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setIsSyncing(true);
      setError(null);

      // Read backup file
      const data = await FileSystem.readAsStringAsync(uri);
      
      // Import data
      const success = await importData(data);
      if (!success) throw new Error('Failed to import data');

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore backup';
      setError(errorMessage);
      Alert.alert('Restore Error', errorMessage);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const exportData = async (): Promise<string | null> => {
    if (!user) return null;

    try {
      const db = DatabaseService.getInstance();
      const tables = [
        'vessels',
        'trips',
        'trip_waypoints',
        'weather_records',
        'crew_members',
        'user_settings'
      ];

      const exportData: { [key: string]: any[] } = {};

      // Export each table
      for (const table of tables) {
        const result = await db.executeSql(
          `SELECT * FROM ${table} WHERE user_id = ?`,
          [user.id]
        );
        exportData[table] = result.rows._array;
      }

      return JSON.stringify(exportData);
    } catch (err) {
      console.error('Export error:', err);
      return null;
    }
  };

  const importData = async (data: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const db = DatabaseService.getInstance();
      const importData = JSON.parse(data);

      await db.transaction(async (tx) => {
        // Clear existing data
        const tables = Object.keys(importData);
        for (const table of tables) {
          await db.executeSql(
            `DELETE FROM ${table} WHERE user_id = ?`,
            [user.id]
          );
        }

        // Import new data
        for (const [table, rows] of Object.entries(importData)) {
          for (const row of rows as any[]) {
            const columns = Object.keys(row).join(', ');
            const values = Object.values(row);
            const placeholders = values.map(() => '?').join(', ');
            
            await db.executeSql(
              `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`,
              values
            );
          }
        }
      });

      return true;
    } catch (err) {
      console.error('Import error:', err);
      return false;
    }
  };

  return {
    isSyncing,
    lastBackupDate,
    error,
    createBackup,
    restoreBackup,
    exportData,
    importData
  };
};