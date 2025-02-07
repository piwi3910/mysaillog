import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, useTheme, Divider } from 'react-native-paper';
import { Weather } from '../types';
import { getWindDescription, getSeaState, getWindDirectionText } from '../utils/weather';

interface WeatherDisplayProps {
  weather: Weather;
}

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weather }) => {
  const theme = useTheme();

  return (
    <Surface style={styles.container} elevation={1}>
      <View style={styles.row}>
        <View style={styles.infoBlock}>
          <Text variant="titleMedium">Wind</Text>
          <Text variant="bodyMedium">
            {weather.windSpeed.toFixed(1)} kts
          </Text>
          <Text variant="bodyMedium">
            {getWindDirectionText(weather.windDirection)}
          </Text>
        </View>

        <View style={styles.infoBlock}>
          <Text variant="titleMedium">Conditions</Text>
          <Text variant="bodyMedium">
            {getWindDescription(weather.windSpeed)}
          </Text>
          <Text variant="bodyMedium">
            {getSeaState(weather.windSpeed)}
          </Text>
        </View>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.row}>
        <View style={styles.infoBlock}>
          <Text variant="titleMedium">Temperature</Text>
          <Text variant="bodyMedium">
            {weather.temperature?.toFixed(1)}°C
          </Text>
        </View>

        <View style={styles.infoBlock}>
          <Text variant="titleMedium">Pressure</Text>
          <Text variant="bodyMedium">
            {weather.pressure} hPa
          </Text>
        </View>
      </View>

      {weather.notes && (
        <>
          <Divider style={styles.divider} />
          <Text variant="bodyMedium" style={styles.notes}>
            {weather.notes}
          </Text>
        </>
      )}
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  infoBlock: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    marginVertical: 12,
  },
  notes: {
    textAlign: 'center',
  },
});
