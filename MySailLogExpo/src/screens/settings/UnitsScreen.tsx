import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';

interface UnitOption {
  value: string;
  label: string;
  icon?: string;
}

interface UnitSetting {
  key: keyof typeof unitOptions;
  label: string;
  icon: string;
}

const unitOptions = {
  distance: [
    { value: 'nm', label: 'Nautical Miles', icon: 'map-marker-distance' },
    { value: 'km', label: 'Kilometers', icon: 'ruler' },
    { value: 'mi', label: 'Miles', icon: 'map-marker-path' },
  ],
  speed: [
    { value: 'kts', label: 'Knots', icon: 'speedometer' },
    { value: 'kmh', label: 'km/h', icon: 'speedometer-medium' },
    { value: 'mph', label: 'mph', icon: 'speedometer-slow' },
  ],
  temperature: [
    { value: 'C', label: 'Celsius', icon: 'thermometer' },
    { value: 'F', label: 'Fahrenheit', icon: 'thermometer-lines' },
  ],
  pressure: [
    { value: 'hPa', label: 'Hectopascals', icon: 'gauge' },
    { value: 'mb', label: 'Millibars', icon: 'gauge-empty' },
    { value: 'inHg', label: 'Inches of Mercury', icon: 'gauge-low' },
  ],
  windSpeed: [
    { value: 'kts', label: 'Knots', icon: 'weather-windy' },
    { value: 'kmh', label: 'km/h', icon: 'weather-windy-variant' },
    { value: 'mph', label: 'mph', icon: 'tailwind' },
  ],
} as const;

const unitSettings: UnitSetting[] = [
  { key: 'distance', label: 'Distance', icon: 'map-marker-distance' },
  { key: 'speed', label: 'Speed', icon: 'speedometer' },
  { key: 'temperature', label: 'Temperature', icon: 'thermometer' },
  { key: 'pressure', label: 'Pressure', icon: 'gauge' },
  { key: 'windSpeed', label: 'Wind Speed', icon: 'weather-windy' },
];

export default function UnitsScreen() {
  const { colors } = useTheme();
  const { settings, updateSettings } = useUser();

  const handleUnitChange = async (
    settingKey: keyof typeof unitOptions,
    value: string
  ) => {
    try {
      await updateSettings({
        ...settings!,
        units: {
          ...settings!.units,
          [settingKey]: value,
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update unit settings.');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {unitSettings.map((setting) => (
        <View key={setting.key} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {setting.label}
          </Text>
          <View style={[styles.optionsContainer, { backgroundColor: colors.surface }]}>
            {unitOptions[setting.key].map((option, index) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  index < unitOptions[setting.key].length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                  settings?.units[setting.key] === option.value && {
                    backgroundColor: colors.primary + '20',
                  },
                ]}
                onPress={() => handleUnitChange(setting.key, option.value)}
              >
                <View style={styles.optionContent}>
                  <MaterialCommunityIcons
                    name={option.icon as any}
                    size={24}
                    color={
                      settings?.units[setting.key] === option.value
                        ? colors.primary
                        : colors.text
                    }
                    style={styles.optionIcon}
                  />
                  <View style={styles.optionTextContainer}>
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color:
                            settings?.units[setting.key] === option.value
                              ? colors.primary
                              : colors.text,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text
                      style={[styles.optionValue, { color: colors.textSecondary }]}
                    >
                      {option.value}
                    </Text>
                  </View>
                  {settings?.units[setting.key] === option.value && (
                    <MaterialCommunityIcons
                      name="check"
                      size={24}
                      color={colors.primary}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
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
  optionsContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  optionValue: {
    fontSize: 14,
  },
});