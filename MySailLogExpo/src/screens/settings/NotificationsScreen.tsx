import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';

interface NotificationSetting {
  key: keyof typeof notificationSettings;
  label: string;
  description: string;
  icon: string;
}

const notificationSettings = {
  enabled: {
    label: 'Enable Notifications',
    description: 'Receive important updates and alerts',
    icon: 'bell',
  },
  weatherAlerts: {
    label: 'Weather Alerts',
    description: 'Get notified about weather changes and warnings',
    icon: 'weather-lightning',
  },
  tripReminders: {
    label: 'Trip Reminders',
    description: 'Receive reminders about upcoming trips',
    icon: 'calendar-clock',
  },
} as const;

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { settings, updateSettings } = useUser();

  const handleToggle = async (key: keyof typeof notificationSettings) => {
    try {
      if (key === 'enabled') {
        await updateSettings({
          ...settings!,
          notifications: {
            ...settings!.notifications,
            enabled: !settings?.notifications.enabled,
          },
        });
      } else {
        // Only allow toggling other settings if notifications are enabled
        if (!settings?.notifications.enabled) {
          Alert.alert(
            'Notifications Disabled',
            'Please enable notifications first to change individual settings.'
          );
          return;
        }

        await updateSettings({
          ...settings!,
          notifications: {
            ...settings!.notifications,
            [key]: !settings?.notifications[key],
          },
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification settings.');
    }
  };

  const renderSetting = ({ key, label, description, icon }: NotificationSetting) => {
    const isEnabled = key === 'enabled' 
      ? settings?.notifications.enabled
      : settings?.notifications[key];
    const isDisabled = key !== 'enabled' && !settings?.notifications.enabled;

    return (
      <View
        key={key}
        style={[
          styles.settingContainer,
          { backgroundColor: colors.surface },
          isDisabled && { opacity: 0.5 },
        ]}
      >
        <View style={styles.settingContent}>
          <MaterialCommunityIcons
            name={icon as any}
            size={24}
            color={isEnabled ? colors.primary : colors.text}
            style={styles.icon}
          />
          <View style={styles.textContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              {label}
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {description}
            </Text>
          </View>
          <Switch
            value={isEnabled}
            onValueChange={() => handleToggle(key)}
            disabled={isDisabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          General
        </Text>
        {renderSetting({
          key: 'enabled',
          ...notificationSettings.enabled,
        })}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Types
        </Text>
        {renderSetting({
          key: 'weatherAlerts',
          ...notificationSettings.weatherAlerts,
        })}
        {renderSetting({
          key: 'tripReminders',
          ...notificationSettings.tripReminders,
        })}
      </View>

      <Text style={[styles.note, { color: colors.textSecondary }]}>
        Note: You may need to enable notifications in your device settings to
        receive alerts.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  note: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginHorizontal: 32,
    marginBottom: 24,
  },
});