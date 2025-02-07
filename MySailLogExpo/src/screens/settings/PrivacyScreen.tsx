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

interface PrivacySetting {
  key: keyof typeof privacySettings;
  label: string;
  description: string;
  icon: string;
}

const privacySettings = {
  shareLocation: {
    label: 'Share Location',
    description: 'Allow sharing your location during trips',
    icon: 'map-marker',
  },
  shareWeather: {
    label: 'Share Weather Data',
    description: 'Contribute weather data from your trips',
    icon: 'weather-cloudy',
  },
  publicProfile: {
    label: 'Public Profile',
    description: 'Make your profile visible to other users',
    icon: 'account-circle',
  },
} as const;

export default function PrivacyScreen() {
  const { colors } = useTheme();
  const { settings, updateSettings } = useUser();

  const handleToggle = async (key: keyof typeof privacySettings) => {
    try {
      await updateSettings({
        ...settings!,
        privacy: {
          ...settings!.privacy,
          [key]: !settings?.privacy[key],
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update privacy settings.');
    }
  };

  const renderSetting = ({ key, label, description, icon }: PrivacySetting) => {
    const isEnabled = settings?.privacy[key];

    return (
      <View
        key={key}
        style={[styles.settingContainer, { backgroundColor: colors.surface }]}
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
          Privacy Settings
        </Text>
        {Object.keys(privacySettings).map((key) => 
          renderSetting({
            key: key as keyof typeof privacySettings,
            ...privacySettings[key as keyof typeof privacySettings],
          })
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Data Collection
        </Text>
        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          <MaterialCommunityIcons
            name="information"
            size={24}
            color={colors.primary}
            style={styles.infoIcon}
          />
          <Text style={[styles.infoText, { color: colors.text }]}>
            We collect and process your data in accordance with our Privacy Policy.
            You can control what data is shared with other users and third-party
            services through these settings.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Data Export
        </Text>
        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          <MaterialCommunityIcons
            name="download"
            size={24}
            color={colors.primary}
            style={styles.infoIcon}
          />
          <Text style={[styles.infoText, { color: colors.text }]}>
            You can request a copy of your data at any time. This includes your
            trip logs, vessel information, and other data stored in your account.
            Contact support to request your data export.
          </Text>
        </View>
      </View>
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
  infoCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});