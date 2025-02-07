import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Surface, Text, useTheme, MD3Theme } from 'react-native-paper';
import { LineChart, PieChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, WindRoseData, PopularSailingTime } from '../types';
import { calculateTripStats, formatDistance, formatDuration, formatSpeed } from '../utils/tripUtils';

const screenWidth = Dimensions.get('window').width;

export const AnalyticsScreen: React.FC = () => {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [windRoseData, setWindRoseData] = useState<WindRoseData[]>([]);
  const [popularTimes, setPopularTimes] = useState<PopularSailingTime[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const tripsData = await AsyncStorage.getItem('trips');
      if (tripsData) {
        const loadedTrips: Trip[] = JSON.parse(tripsData);
        setTrips(loadedTrips);
        analyzeTrips(loadedTrips);
      }
    } catch (error) {
      console.error('Error loading trips:', error);
    }
  };

  const analyzeTrips = (trips: Trip[]) => {
    const tripStats = trips.map(calculateTripStats);
    const totalDistance = tripStats.reduce((sum, stat) => sum + stat.distance, 0);
    const totalDuration = tripStats.reduce((sum, stat) => sum + stat.duration, 0);
    const averageSpeed = totalDistance / (totalDuration / 60);

    // Wind rose data
    const windData = calculateWindRoseData(trips);
    setWindRoseData(windData);

    // Popular sailing times
    const timeData = calculatePopularTimes(trips);
    setPopularTimes(timeData);
  };

  const calculateWindRoseData = (trips: Trip[]): WindRoseData[] => {
    const windDirections: { [key: string]: { count: number; totalSpeed: number } } = {};

    trips.forEach(trip => {
      trip.weatherLog.forEach(weather => {
        const direction = Math.round(weather.windDirection / 45) * 45;
        const dirKey = direction.toString();
        if (!windDirections[dirKey]) {
          windDirections[dirKey] = { count: 0, totalSpeed: 0 };
        }
        windDirections[dirKey].count++;
        windDirections[dirKey].totalSpeed += weather.windSpeed;
      });
    });

    return Object.entries(windDirections).map(([direction, data]) => ({
      direction: parseInt(direction),
      frequency: data.count,
      speed: data.totalSpeed / data.count,
    }));
  };

  const calculatePopularTimes = (trips: Trip[]): PopularSailingTime[] => {
    const hourCounts = new Array(24).fill(0);

    trips.forEach(trip => {
      const startHour = new Date(trip.startTime).getHours();
      hourCounts[startHour]++;
    });

    return hourCounts.map((count, hour) => ({
      hour,
      frequency: (count / trips.length) * 100,
    }));
  };

  const chartConfig = {
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    color: (opacity = 1) => theme.colors.primary,
    labelColor: (opacity = 1) => theme.colors.onSurface,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 12,
    },
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.card} elevation={1}>
        <Text variant="titleLarge" style={styles.cardTitle}>Trip Statistics</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text variant="headlineMedium">{trips.length}</Text>
            <Text variant="bodyMedium">Total Trips</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="headlineMedium">
              {formatDistance(trips.reduce((sum, trip) => {
                const stats = calculateTripStats(trip);
                return sum + stats.distance;
              }, 0))}
            </Text>
            <Text variant="bodyMedium">Total Distance</Text>
          </View>
        </View>
      </Surface>

      <Surface style={styles.card} elevation={1}>
        <Text variant="titleLarge" style={styles.cardTitle}>Popular Sailing Times</Text>
        <LineChart
          data={{
            labels: popularTimes.filter((_, i) => i % 3 === 0).map(t => `${t.hour}h`),
            datasets: [{
              data: popularTimes.map(t => t.frequency),
            }],
          }}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={false}
          withOuterLines={true}
          withVerticalLines={false}
          withHorizontalLines={true}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          fromZero={true}
        />
      </Surface>

      <Surface style={styles.card} elevation={1}>
        <Text variant="titleLarge" style={styles.cardTitle}>Wind Conditions</Text>
        <PieChart
          data={windRoseData.map(data => ({
            name: `${data.direction}°`,
            population: data.frequency,
            color: theme.colors.primary,
            legendFontColor: theme.colors.onSurface,
          }))}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[screenWidth / 4, 0]}
          absolute
        />
      </Surface>
    </ScrollView>
  );
};

const createStyles = (theme: MD3Theme) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
  },
  cardTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
});

export default AnalyticsScreen;
