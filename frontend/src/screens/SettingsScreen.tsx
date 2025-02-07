import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, Text, Switch, List } from 'react-native-paper';
import { UserSettings } from '../types';

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

export const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
