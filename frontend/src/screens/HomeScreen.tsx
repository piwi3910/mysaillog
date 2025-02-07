import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Surface, Text, Button, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, Vessel, TripStats } from '../types';
import { calculateTripStats, formatDistance, formatDuration, formatSpeed } from '../utils/tripUtils';
import { WeatherDisplay } from '../components/WeatherDisplay';

export const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [stats, setStats] = useState<{
    totalTrips: number;
    totalDistance: number;
    totalDuration: number;
  }>({
    totalTrips: 0,
    totalDistance: 0,
    totalDuration: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tripsData, vesselsData] = await Promise.all([
        AsyncStorage.getItem('trips'),
        AsyncStorage.getItem('vessels'),
      ]);

      const trips: Trip[] = tripsData ? JSON.parse(tripsData) : [];
      const vessels: Vessel[] = vesselsData ? JSON.parse(vesselsData) : [];

      setRecentTrips(trips.slice(-5));
      setVessels(vessels);

      // Calculate overall stats
      const tripStats = trips.map(trip => calculateTripStats(trip));
      setStats({
        totalTrips: trips.length,
        totalDistance: tripStats.reduce((sum, stat) => sum + stat.distance, 0),
        totalDuration: tripStats.reduce((sum, stat) => sum + stat.duration, 0),
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const getVesselName = (vesselId: string): string => {
    const vessel = vessels.find(v => v.id === vesselId);
    return vessel ? vessel.name : 'Unknown Vessel';
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.statsCard} elevation={1}>
        <Text variant="titleLarge" style={styles.cardTitle}>Overall Statistics</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text variant="headlineMedium">{stats.totalTrips}</Text>
            <Text variant="bodyMedium">Total Trips</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="headlineMedium">{formatDistance(stats.totalDistance)}</Text>
            <Text variant="bodyMedium">Distance</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="headlineMedium">{formatDuration(stats.totalDuration)}</Text>
            <Text variant="bodyMedium">Duration</Text>
          </View>
        </View>
      </Surface>

      <Text variant="titleLarge" style={styles.sectionTitle}>Recent Trips</Text>
      {recentTrips.map((trip) => {
        const tripStats = calculateTripStats(trip);
        return (
          <Surface key={trip.id} style={styles.tripCard} elevation={1}>
            <View style={styles.tripHeader}>
              <Text variant="titleMedium">{getVesselName(trip.vesselId)}</Text>
              <Text variant="bodyMedium">
                {new Date(trip.startTime).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.tripStats}>
              <View style={styles.statItem}>
                <Text variant="bodyLarge">{formatDistance(tripStats.distance)}</Text>
                <Text variant="bodySmall">Distance</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="bodyLarge">{formatDuration(tripStats.duration)}</Text>
                <Text variant="bodySmall">Duration</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="bodyLarge">{formatSpeed(tripStats.averageSpeed)}</Text>
                <Text variant="bodySmall">Avg Speed</Text>
              </View>
            </View>

            {trip.weatherLog && trip.weatherLog.length > 0 && (
              <WeatherDisplay weather={trip.weatherLog[trip.weatherLog.length - 1]} />
            )}
          </Surface>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  statsCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  cardTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sectionTitle: {
    marginBottom: 16,
  },
  tripCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tripStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
});

export default HomeScreen;
