import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Trip, Vessel } from '../types';
import { calculateTripStats } from '../utils/tripUtils';

export const HomeScreen = () => {
  const navigation = useNavigation();
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [totalDistance, setTotalDistance] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tripsData, vesselsData] = await Promise.all([
        AsyncStorage.getItem('trips'),
        AsyncStorage.getItem('vessels'),
      ]);

      const loadedTrips = tripsData ? JSON.parse(tripsData) : [];
      const loadedVessels = vesselsData ? JSON.parse(vesselsData) : [];

      // Get recent trips
      const sortedTrips = loadedTrips.sort(
        (a: Trip, b: Trip) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
      );
      setRecentTrips(sortedTrips.slice(0, 3));

      // Calculate total distance
      const total = loadedTrips.reduce((acc: number, trip: Trip) => {
        const stats = calculateTripStats(trip);
        return acc + stats.totalDistance;
      }, 0);
      setTotalDistance(total);

      setVessels(loadedVessels);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const QuickActionButton = ({ icon, label, onPress }: any) => (
    <TouchableOpacity style={styles.quickActionButton} onPress={onPress}>
      <Ionicons name={icon} size={24} color="#007AFF" />
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Welcome to MySailLog</Text>
            <Text style={styles.statsText}>Total Distance: {totalDistance.toFixed(1)} nm</Text>
          </View>

          <View style={styles.quickActions}>
            <QuickActionButton
              icon="navigate"
              label="New Trip"
              onPress={() => navigation.navigate('Trip' as never)}
            />
            <QuickActionButton
              icon="boat"
              label="Vessels"
              onPress={() => navigation.navigate('Vessels' as never)}
            />
            <QuickActionButton
              icon="time"
              label="History"
              onPress={() => navigation.navigate('History' as never)}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Trips</Text>
            {recentTrips.length > 0 ? (
              recentTrips.map(trip => {
                const vessel = vessels.find(v => v.id === trip.vesselId);
                const stats = calculateTripStats(trip);
                return (
                  <TouchableOpacity
                    key={trip.id}
                    style={styles.tripCard}
                    onPress={() => navigation.navigate('History' as never)}
                  >
                    <View style={styles.tripInfo}>
                      <Text style={styles.tripDate}>{formatDate(trip.startTime)}</Text>
                      <Text style={styles.vesselName}>{vessel?.name}</Text>
                    </View>
                    <View style={styles.tripStats}>
                      <Text style={styles.tripDistance}>{stats.totalDistance.toFixed(1)} nm</Text>
                      <Text style={styles.tripDuration}>{stats.duration} min</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={styles.noTripsText}>No trips recorded yet</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Vessels</Text>
            {vessels.length > 0 ? (
              vessels.map(vessel => (
                <TouchableOpacity
                  key={vessel.id}
                  style={styles.vesselCard}
                  onPress={() => navigation.navigate('Vessels' as never)}
                >
                  <Text style={styles.vesselCardName}>{vessel.name}</Text>
                  <Text style={styles.vesselDetails}>
                    {vessel.type} - {vessel.length}m
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noVesselsText}>No vessels added yet</Text>
            )}
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
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  noTripsText: {
    color: '#666',
    fontSize: 16,
    fontStyle: 'italic',
  },
  noVesselsText: {
    color: '#666',
    fontSize: 16,
    fontStyle: 'italic',
  },
  quickActionButton: {
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    width: (Dimensions.get('window').width - 60) / 3,
  },
  quickActionLabel: {
    color: '#007AFF',
    fontSize: 12,
    marginTop: 5,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsText: {
    color: '#666',
    fontSize: 16,
  },
  tripCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 15,
  },
  tripDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  tripDistance: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tripDuration: {
    color: '#666',
    fontSize: 14,
  },
  tripInfo: {
    flex: 1,
  },
  tripStats: {
    alignItems: 'flex-end',
  },
  vesselCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
  },
  vesselCardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  vesselDetails: {
    color: '#666',
    fontSize: 14,
  },
  vesselName: {
    color: '#666',
    fontSize: 14,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default HomeScreen;
