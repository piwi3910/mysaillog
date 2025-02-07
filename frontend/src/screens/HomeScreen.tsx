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
      const sortedTrips = loadedTrips.sort((a: Trip, b: Trip) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
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
            <Text style={styles.statsText}>
              Total Distance: {totalDistance.toFixed(1)} nm
            </Text>
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
              recentTrips.map((trip) => {
                const vessel = vessels.find(v => v.id === trip.vesselId);
                const stats = calculateTripStats(trip);
                return (
                  <TouchableOpacity
                    key={trip.id}
                    style={styles.tripCard}
                    onPress={() => navigation.navigate('History' as never)}
                  >
                    <View style={styles.tripInfo}>
                      <Text style={styles.tripDate}>
                        {formatDate(trip.startTime)}
                      </Text>
                      <Text style={styles.vesselName}>{vessel?.name}</Text>
                    </View>
                    <View style={styles.tripStats}>
                      <Text style={styles.tripDistance}>
                        {stats.totalDistance.toFixed(1)} nm
                      </Text>
                      <Text style={styles.tripDuration}>
                        {stats.duration} min
                      </Text>
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
              vessels.map((vessel) => (
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
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statsText: {
    fontSize: 16,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  quickActionButton: {
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    width: (Dimensions.get('window').width - 60) / 3,
  },
  quickActionLabel: {
    marginTop: 5,
    fontSize: 12,
    color: '#007AFF',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  tripCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  tripInfo: {
    flex: 1,
  },
  tripDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  vesselName: {
    fontSize: 14,
    color: '#666',
  },
  tripStats: {
    alignItems: 'flex-end',
  },
  tripDistance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  tripDuration: {
    fontSize: 14,
    color: '#666',
  },
  vesselCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  vesselCardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  vesselDetails: {
    fontSize: 14,
    color: '#666',
  },
  noTripsText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  noVesselsText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default HomeScreen;