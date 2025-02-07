import { useState, useEffect, useCallback } from 'react';
import { Platform, Alert, Linking } from 'react-native';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAnalytics } from './useAnalytics';
import { EventName } from '../types/analytics';

interface UpdateInfo {
  currentVersion: string;
  latestVersion: string | null;
  updateAvailable: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
}

interface AppUpdateHookResult {
  updateInfo: UpdateInfo;
  checkForUpdates: () => Promise<boolean>;
  downloadUpdate: () => Promise<boolean>;
  applyUpdate: () => Promise<void>;
  checkAppStoreVersion: () => Promise<boolean>;
}

const LAST_UPDATE_CHECK_KEY = '@MySailLog:lastUpdateCheck';
const UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export const useAppUpdate = (): AppUpdateHookResult => {
  const { trackEvent } = useAnalytics();
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({
    currentVersion: Constants.expoConfig?.version || '1.0.0',
    latestVersion: null,
    updateAvailable: false,
    isChecking: false,
    lastChecked: null
  });

  // Load last check time
  useEffect(() => {
    const loadLastCheckTime = async () => {
      try {
        const lastChecked = await AsyncStorage.getItem(LAST_UPDATE_CHECK_KEY);
        if (lastChecked) {
          setUpdateInfo(prev => ({
            ...prev,
            lastChecked: new Date(parseInt(lastChecked, 10))
          }));
        }
      } catch (error) {
        console.error('Error loading last update check time:', error);
      }
    };

    loadLastCheckTime();
  }, []);

  // Check for OTA updates using Expo Updates
  const checkForUpdates = useCallback(async (): Promise<boolean> => {
    try {
      setUpdateInfo(prev => ({ ...prev, isChecking: true }));

      // Check if we should perform the update check
      const lastChecked = updateInfo.lastChecked?.getTime() || 0;
      const now = Date.now();
      if (now - lastChecked < UPDATE_CHECK_INTERVAL) {
        return updateInfo.updateAvailable;
      }

      const update = await Updates.checkForUpdateAsync();
      const hasUpdate = update.isAvailable;

      setUpdateInfo(prev => ({
        ...prev,
        updateAvailable: hasUpdate,
        lastChecked: new Date()
      }));

      // Save last check time
      await AsyncStorage.setItem(LAST_UPDATE_CHECK_KEY, Date.now().toString());

      if (hasUpdate) {
        void trackEvent('update_available', {
          currentVersion: updateInfo.currentVersion
        });

        Alert.alert(
          'Update Available',
          'A new version of MySailLog is available. Would you like to update now?',
          [
            {
              text: 'Later',
              style: 'cancel'
            },
            {
              text: 'Update',
              onPress: () => downloadUpdate()
            }
          ]
        );
      }

      return hasUpdate;
    } catch (error) {
      console.error('Error checking for updates:', error);
      void trackEvent('update_check_error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    } finally {
      setUpdateInfo(prev => ({ ...prev, isChecking: false }));
    }
  }, [updateInfo.lastChecked, updateInfo.currentVersion, trackEvent]);

  // Download OTA update
  const downloadUpdate = useCallback(async (): Promise<boolean> => {
    try {
      void trackEvent('update_download_start', {
        currentVersion: updateInfo.currentVersion
      });

      await Updates.fetchUpdateAsync();
      
      void trackEvent('update_download_success', {
        currentVersion: updateInfo.currentVersion
      });

      Alert.alert(
        'Update Downloaded',
        'The update has been downloaded. Would you like to restart the app to apply the update?',
        [
          {
            text: 'Later',
            style: 'cancel'
          },
          {
            text: 'Restart',
            onPress: () => applyUpdate()
          }
        ]
      );

      return true;
    } catch (error) {
      console.error('Error downloading update:', error);
      void trackEvent('update_download_error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }, [updateInfo.currentVersion, trackEvent]);

  // Apply downloaded update
  const applyUpdate = async (): Promise<void> => {
    try {
      void trackEvent('update_apply');
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error applying update:', error);
      void trackEvent('update_apply_error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Check App/Play Store version
  const checkAppStoreVersion = useCallback(async (): Promise<boolean> => {
    try {
      setUpdateInfo(prev => ({ ...prev, isChecking: true }));

      // In a real app, you would implement an API call to your backend
      // to check the latest version in the stores
      // For now, we'll simulate this
      const storeVersion = '1.0.0'; // This would come from your API

      const hasUpdate = storeVersion > updateInfo.currentVersion;
      
      if (hasUpdate) {
        void trackEvent('store_update_available', {
          currentVersion: updateInfo.currentVersion,
          storeVersion
        });

        setUpdateInfo(prev => ({
          ...prev,
          latestVersion: storeVersion,
          updateAvailable: true
        }));

        Alert.alert(
          'Update Available',
          'A new version of MySailLog is available in the store. Would you like to update now?',
          [
            {
              text: 'Later',
              style: 'cancel'
            },
            {
              text: 'Update',
              onPress: () => {
                const storeUrl = Platform.select({
                  ios: 'itms-apps://apps.apple.com/app/YOUR_APP_ID',
                  android: 'market://details?id=YOUR_PACKAGE_NAME'
                });
                
                if (storeUrl) {
                  Linking.openURL(storeUrl);
                }
              }
            }
          ]
        );
      }

      return hasUpdate;
    } catch (error) {
      console.error('Error checking store version:', error);
      void trackEvent('store_update_check_error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    } finally {
      setUpdateInfo(prev => ({ ...prev, isChecking: false }));
    }
  }, [updateInfo.currentVersion, trackEvent]);

  return {
    updateInfo,
    checkForUpdates,
    downloadUpdate,
    applyUpdate,
    checkAppStoreVersion
  };
};