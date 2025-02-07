import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, SafeAreaView } from 'react-native';
import { UserSettings } from '../types';

export const SettingsScreen = () => {
  const [settings, setSettings] = useState<UserSettings>({
    darkMode: false,
    units: {
      speed: 'knots',
      distance: 'nautical',
      temperature: 'celsius'
    }
  });

  const toggleDarkMode = () => {
    setSettings(prev => ({
      ...prev,
      darkMode: !prev.darkMode
    }));
    // TODO: Implement dark mode persistence
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch
              value={settings.darkMode}
              onValueChange={toggleDarkMode}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Units</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Speed</Text>
            <Text style={styles.settingValue}>{settings.units?.speed}</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Distance</Text>
            <Text style={styles.settingValue}>{settings.units?.distance}</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Temperature</Text>
            <Text style={styles.settingValue}>{settings.units?.temperature}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Version</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
  },
});

export default SettingsScreen;