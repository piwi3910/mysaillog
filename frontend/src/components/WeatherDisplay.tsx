import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WeatherData } from '../types';
import { getWindDescription, getSeaState, getWindDirectionText } from '../utils/weather';

interface WeatherDisplayProps {
  weather: WeatherData;
  compact?: boolean;
}

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weather, compact = false }) => {
  const getWindIcon = (speed: number) => {
    if (speed < 5) return 'leaf-outline';
    if (speed < 10) return 'water-outline';
    if (speed < 20) return 'thunderstorm-outline';
    return 'warning-outline';
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactRow}>
          <Ionicons name="thermometer-outline" size={20} color="#007AFF" />
          <Text style={styles.compactText}>{weather.temperature}°C</Text>
        </View>
        <View style={styles.compactRow}>
          <Ionicons name={getWindIcon(weather.windSpeed)} size={20} color="#007AFF" />
          <Text style={styles.compactText}>{weather.windSpeed} kts</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mainInfo}>
        <View style={styles.row}>
          <View style={styles.infoBlock}>
            <Ionicons name="thermometer-outline" size={24} color="#007AFF" />
            <Text style={styles.value}>{weather.temperature}°C</Text>
            <Text style={styles.label}>Temperature</Text>
          </View>
          <View style={styles.infoBlock}>
            <Ionicons name={getWindIcon(weather.windSpeed)} size={24} color="#007AFF" />
            <Text style={styles.value}>{weather.windSpeed} kts</Text>
            <Text style={styles.label}>Wind Speed</Text>
          </View>
          <View style={styles.infoBlock}>
            <Ionicons name="compass-outline" size={24} color="#007AFF" />
            <Text style={styles.value}>{getWindDirectionText(weather.windDirection)}</Text>
            <Text style={styles.label}>Direction</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>Wind: {getWindDescription(weather.windSpeed)}</Text>
        <Text style={styles.detailText}>Sea State: {getSeaState(weather.windSpeed)}</Text>
        <Text style={styles.detailText}>Pressure: {weather.pressure} hPa</Text>
        {weather.notes && <Text style={styles.detailText}>Conditions: {weather.notes}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  compactContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  compactRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  compactText: {
    fontSize: 16,
    fontWeight: '500',
  },
  container: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginVertical: 10,
    padding: 15,
  },
  detailText: {
    color: '#444',
    fontSize: 14,
  },
  detailsContainer: {
    borderTopColor: '#eee',
    borderTopWidth: 1,
    gap: 5,
    paddingTop: 15,
  },
  infoBlock: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  mainInfo: {
    marginBottom: 15,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 5,
  },
});

export default WeatherDisplay;
