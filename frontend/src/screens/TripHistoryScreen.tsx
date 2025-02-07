import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Surface, Text, Button, Portal, Modal, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, Vessel, Weather } from '../types';
import { WeatherDisplay } from '../components/WeatherDisplay';
import { calculateTripStats, formatDistance, formatDuration, formatSpeed } from '../utils/tripUtils';

export const TripHistoryScreen: React.FC = () => {
  const theme = useTheme();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showTripModal, setShowTripModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tripsData, vesselsData] = await Promise.all([
        AsyncStorage.getItem('trips'),
        AsyncStorage.getItem('vessels'),
      ]);

      const loadedTrips: Trip[] = tripsData ? JSON.parse(tripsData) : [];
      const loadedVessels: Vessel[] = vesselsData ? JSON.parse(vesselsData) : [];

      setTrips(loadedTrips.sort((a, b) => b.startTime - a.startTime));
      setVessels(loadedVessels);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const getVesselName = (vesselId: string): string => {
    const vessel = vessels.find(v => v.id === vesselId);
    return vessel ? vessel.name : 'Unknown Vessel';
  };

  const handleTripPress = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowTripModal(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {trips.map((trip) => {
          const stats = calculateTripStats(trip);
          return (
            <Surface
              key={trip.id}
              style={styles.tripCard}
              elevation={1}
            >
              <View style={styles.tripHeader}>
                <Text variant="titleMedium">{getVesselName(trip.vesselId)}</Text>
                <Text variant="bodyMedium">
                  {new Date(trip.startTime).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.tripStats}>
                <View style={styles.statItem}>
                  <Text variant="bodyLarge">{formatDistance(stats.distance)}</Text>
                  <Text variant="bodySmall">Distance</Text>
                </View>
                <View style={styles.statItem}>
                  <Text variant="bodyLarge">{formatDuration(stats.duration)}</Text>
                  <Text variant="bodySmall">Duration</Text>
                </View>
                <View style={styles.statItem}>
                  <Text variant="bodyLarge">{formatSpeed(stats.averageSpeed)}</Text>
                  <Text variant="bodySmall">Avg Speed</Text>
                </View>
              </View>

              <Button
                mode="outlined"
                onPress={() => handleTripPress(trip)}
                style={styles.detailsButton}
              >
                View Details
              </Button>
            </Surface>
          );
        })}
      </ScrollView>

      <Portal>
        <Modal
          visible={showTripModal}
          onDismiss={() => setShowTripModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedTrip && (
            <Surface style={styles.modalSurface} elevation={2}>
              <Text variant="titleLarge" style={styles.modalTitle}>
                Trip Details
              </Text>

              <Text variant="titleMedium">
                {getVesselName(selectedTrip.vesselId)}
              </Text>

              <View style={styles.dateContainer}>
                <Text variant="bodyMedium">
                  Start: {new Date(selectedTrip.startTime).toLocaleString()}
                </Text>
                <Text variant="bodyMedium">
                  End: {new Date(selectedTrip.endTime).toLocaleString()}
                </Text>
              </View>

              <View style={styles.crewSection}>
                <Text variant="titleMedium">Crew</Text>
                {selectedTrip.crew.map((member, index) => (
                  <Text key={index} variant="bodyMedium">
                    {member.name} - {member.role}
                  </Text>
                ))}
              </View>

              <View style={styles.weatherSection}>
                <Text variant="titleMedium">Weather Log</Text>
                {selectedTrip.weatherLog.map((weather, index) => (
                  <WeatherDisplay key={index} weather={weather} />
                ))}
              </View>

              <Button
                mode="contained"
                onPress={() => setShowTripModal(false)}
                style={styles.closeButton}
              >
                Close
              </Button>
            </Surface>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  tripCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
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
  detailsButton: {
    marginTop: 8,
  },
  modalContent: {
    padding: 20,
  },
  modalSurface: {
    padding: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  dateContainer: {
    marginVertical: 16,
  },
  crewSection: {
    marginVertical: 16,
  },
  weatherSection: {
    marginVertical: 16,
  },
  closeButton: {
    marginTop: 16,
  },
});

export default TripHistoryScreen;
