import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, SafeAreaView } from 'react-native';
import { UserSettings } from '../types';

export const SettingsScreen = () => {
  const [settings, setSettings] = useState<UserSettings>({
    darkMode: false,
    units: {
      speed: 'knots',
      distance: 'nautical',
      temperature: 'celsius',
    },
  });

  const toggleDarkMode = () => {
    setSettings(prev => ({
      ...prev,
      darkMode: !prev.darkMode,
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
            <Switch value={settings.darkMode} onValueChange={toggleDarkMode} />
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
    backgroundColor: '#fff',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    color: '#666',
    fontSize: 16,
  },
});

export default SettingsScreen;
