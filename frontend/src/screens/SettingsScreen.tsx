import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, Text, Switch, List, Button, Portal, Modal, Surface } from 'react-native-paper';
import { UserSettings } from '../types';
import { exportData } from '../utils/export';
import {
  TripStorage,
  EquipmentStorage,
  SafetyStorage,
  MaintenanceStorage,
} from '../utils/storage';

const defaultSettings: UserSettings = {
  theme: 'light',
  units: {
    speed: 'knots',
    distance: 'nm',
    temperature: 'celsius',
  },
  notifications: {
    enabled: true,
    tripStart: true,
    tripEnd: true,
    weather: true,
  },
};

interface ExportModalState {
  includeTrips: boolean;
  includeEquipment: boolean;
  includeSafetyChecks: boolean;
  includePhotos: boolean;
}

export const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportModalState>({
    includeTrips: true,
    includeEquipment: true,
    includeSafetyChecks: true,
    includePhotos: true,
  });
  const [isExporting, setIsExporting] = useState(false);

  const toggleDarkMode = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  };

  const toggleNotifications = (type: keyof UserSettings['notifications']) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type],
      },
    }));
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Fetch all necessary data
      const trips = exportOptions.includeTrips ? await TripStorage.getAll() : [];
      const equipment = exportOptions.includeEquipment ? await EquipmentStorage.getAll() : [];
      const safetyChecks = exportOptions.includeSafetyChecks ? await SafetyStorage.getChecks() : [];
      const maintenanceLogs = exportOptions.includeEquipment ? await MaintenanceStorage.getLogs() : [];

      await exportData(trips, equipment, safetyChecks, maintenanceLogs, exportOptions);
      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <List.Section>
        <List.Subheader>Appearance</List.Subheader>
        <List.Item
          title="Dark Mode"
          right={() => (
            <Switch
              value={settings.theme === 'dark'}
              onValueChange={toggleDarkMode}
            />
          )}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Notifications</List.Subheader>
        <List.Item
          title="Enable Notifications"
          right={() => (
            <Switch
              value={settings.notifications.enabled}
              onValueChange={() => toggleNotifications('enabled')}
            />
          )}
        />
        {settings.notifications.enabled && (
          <>
            <List.Item
              title="Trip Start"
              right={() => (
                <Switch
                  value={settings.notifications.tripStart}
                  onValueChange={() => toggleNotifications('tripStart')}
                />
              )}
            />
            <List.Item
              title="Trip End"
              right={() => (
                <Switch
                  value={settings.notifications.tripEnd}
                  onValueChange={() => toggleNotifications('tripEnd')}
                />
              )}
            />
            <List.Item
              title="Weather Updates"
              right={() => (
                <Switch
                  value={settings.notifications.weather}
                  onValueChange={() => toggleNotifications('weather')}
                />
              )}
            />
          </>
        )}
      </List.Section>

      <List.Section>
        <List.Subheader>Units</List.Subheader>
        <List.Item
          title="Distance"
          description={settings.units.distance.toUpperCase()}
          onPress={() => {
            setSettings(prev => ({
              ...prev,
              units: {
                ...prev.units,
                distance: prev.units.distance === 'nm' ? 'km' : 'nm',
              },
            }));
          }}
        />
        <List.Item
          title="Speed"
          description={settings.units.speed.toUpperCase()}
          onPress={() => {
            setSettings(prev => ({
              ...prev,
              units: {
                ...prev.units,
                speed: prev.units.speed === 'knots' ? 'kph' : 'knots',
              },
            }));
          }}
        />
        <List.Item
          title="Temperature"
          description={settings.units.temperature.toUpperCase()}
          onPress={() => {
            setSettings(prev => ({
              ...prev,
              units: {
                ...prev.units,
                temperature: prev.units.temperature === 'celsius' ? 'fahrenheit' : 'celsius',
              },
            }));
          }}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Data Management</List.Subheader>
        <List.Item
          title="Export Data"
          description="Export your logs and data"
          onPress={() => setShowExportModal(true)}
          right={props => <List.Icon {...props} icon="export" />}
        />
      </List.Section>

      <Portal>
        <Modal
          visible={showExportModal}
          onDismiss={() => setShowExportModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Surface style={styles.modalSurface}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Export Data
            </Text>
            <List.Item
              title="Include Trips"
              right={() => (
                <Switch
                  value={exportOptions.includeTrips}
                  onValueChange={(value) =>
                    setExportOptions(prev => ({ ...prev, includeTrips: value }))
                  }
                />
              )}
            />
            <List.Item
              title="Include Equipment"
              right={() => (
                <Switch
                  value={exportOptions.includeEquipment}
                  onValueChange={(value) =>
                    setExportOptions(prev => ({ ...prev, includeEquipment: value }))
                  }
                />
              )}
            />
            <List.Item
              title="Include Safety Checks"
              right={() => (
                <Switch
                  value={exportOptions.includeSafetyChecks}
                  onValueChange={(value) =>
                    setExportOptions(prev => ({ ...prev, includeSafetyChecks: value }))
                  }
                />
              )}
            />
            <List.Item
              title="Include Photos"
              right={() => (
                <Switch
                  value={exportOptions.includePhotos}
                  onValueChange={(value) =>
                    setExportOptions(prev => ({ ...prev, includePhotos: value }))
                  }
                />
              )}
            />
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowExportModal(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleExport}
                loading={isExporting}
                disabled={isExporting}
                style={styles.modalButton}
              >
                Export
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalContent: {
    padding: 20,
  },
  modalSurface: {
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    marginLeft: 8,
  },
});
