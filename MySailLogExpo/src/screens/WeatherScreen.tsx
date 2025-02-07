import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import LoadingScreen from '../components/LoadingScreen';

interface WeatherData {
  temperature: number;
  windSpeed: number;
  windDirection: string;
  conditions: string;
  humidity: number;
  pressure: number;
  visibility: number;
  timestamp: string;
}

export default function WeatherScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<string | null>(null);

  const { colors } = useTheme();
  const { settings } = useUser();
  const units = settings?.units || {
    distance: 'nm',
    speed: 'kts',
    temperature: 'C',
    pressure: 'hPa',
    windSpeed: 'kts',
  };

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    try {
      // TODO: Implement weather data fetching
      // For now, using mock data
      const mockData: WeatherData = {
        temperature: 22,
        windSpeed: 15,
        windDirection: 'NE',
        conditions: 'Partly Cloudy',
        humidity: 65,
        pressure: 1013,
        visibility: 10,
        timestamp: new Date().toISOString(),
      };

      setWeatherData(mockData);
      setLocation('Current Location');
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to load weather data. Please try again.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadWeatherData();
  };

  if (isLoading) {
    return <LoadingScreen message="Loading weather data..." />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.location, { color: colors.text }]}>
          {location}
        </Text>
        <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
          Last updated: {new Date(weatherData?.timestamp || '').toLocaleTimeString()}
        </Text>
      </View>

      <View style={[styles.mainCard, { backgroundColor: colors.surface }]}>
        <MaterialCommunityIcons
          name="weather-partly-cloudy"
          size={64}
          color={colors.primary}
        />
        <Text style={[styles.temperature, { color: colors.text }]}>
          {weatherData?.temperature}°{units.temperature}
        </Text>
        <Text style={[styles.conditions, { color: colors.text }]}>
          {weatherData?.conditions}
        </Text>
      </View>

      <View style={styles.detailsGrid}>
        <View style={[styles.detailCard, { backgroundColor: colors.surface }]}>
          <MaterialCommunityIcons
            name="weather-windy"
            size={32}
            color={colors.primary}
          />
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            Wind
          </Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {weatherData?.windSpeed} {units.windSpeed}
          </Text>
          <Text style={[styles.detailSubtext, { color: colors.textSecondary }]}>
            {weatherData?.windDirection}
          </Text>
        </View>

        <View style={[styles.detailCard, { backgroundColor: colors.surface }]}>
          <MaterialCommunityIcons
            name="water-percent"
            size={32}
            color={colors.primary}
          />
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            Humidity
          </Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {weatherData?.humidity}%
          </Text>
        </View>

        <View style={[styles.detailCard, { backgroundColor: colors.surface }]}>
          <MaterialCommunityIcons
            name="gauge"
            size={32}
            color={colors.primary}
          />
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            Pressure
          </Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {weatherData?.pressure} {units.pressure}
          </Text>
        </View>

        <View style={[styles.detailCard, { backgroundColor: colors.surface }]}>
          <MaterialCommunityIcons
            name="eye"
            size={32}
            color={colors.primary}
          />
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            Visibility
          </Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {weatherData?.visibility} {units.distance}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.forecastButton, { backgroundColor: colors.primary }]}
        onPress={() => {
          // TODO: Navigate to detailed forecast
          Alert.alert('Coming Soon', 'Detailed forecast will be available soon.');
        }}
      >
        <Text style={styles.forecastButtonText}>View 5-Day Forecast</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  location: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 14,
  },
  mainCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  conditions: {
    fontSize: 20,
    fontWeight: '500',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  detailCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    marginTop: 8,
  },
  detailValue: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 4,
  },
  detailSubtext: {
    fontSize: 14,
    marginTop: 2,
  },
  forecastButton: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forecastButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});