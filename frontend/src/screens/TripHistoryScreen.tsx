import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Share,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Trip, Vessel } from '../types';
import { calculateTripStats } from '../utils/tripUtils';
import ShareTripModal from '../components/ShareTripModal';

export const TripHistoryScreen = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vessels, setVessels] = useState<Record<string, Vessel>>({});
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showTripModal, setShowTripModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    loadTripsAndVessels();
  }, []);

  const loadTripsAndVessels = async () => {
    try {
      const [tripsData, vesselsData] = await Promise.all([
        AsyncStorage.getItem('trips'),
        AsyncStorage.getItem('vessels'),
      ]);

      const loadedTrips = tripsData ? JSON.parse(tripsData) : [];
      const loadedVessels = vesselsData ? JSON.parse(vesselsData) : [];

      setTrips(
        loadedTrips.sort(
          (a: Trip, b: Trip) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
        ),
      );

      const vesselsMap = loadedVessels.reduce((acc: Record<string, Vessel>, vessel: Vessel) => {
        acc[vessel.id] = vessel;
        return acc;
      }, {});
      setVessels(vesselsMap);
    } catch (error) {
      console.error('Error loading trips and vessels:', error);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTripModal = () => {
    if (!selectedTrip) return null;

    const stats = calculateTripStats(selectedTrip);
    const vessel = vessels[selectedTrip.vesselId];
    const startLocation = selectedTrip.route[0];
    const endLocation = selectedTrip.route[selectedTrip.route.length - 1];

    return (
      <Modal visible={showTripModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Trip Details</Text>

              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: startLocation.latitude,
                    longitude: startLocation.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }}
                >
                  <Marker coordinate={startLocation} pinColor="green" />
                  <Marker coordinate={endLocation} pinColor="red" />
                  <Polyline
                    coordinates={selectedTrip.route}
                    strokeColor="#007AFF"
                    strokeWidth={3}
                  />
                </MapView>
              </View>

              <View style={styles.detailsContainer}>
                <Text style={styles.detailTitle}>Vessel</Text>
                <Text style={styles.detailText}>
                  {vessel?.name} ({vessel?.type})
                </Text>

                <Text style={styles.detailTitle}>Date</Text>
                <Text style={styles.detailText}>{formatDate(selectedTrip.startTime)}</Text>

                <Text style={styles.detailTitle}>Time</Text>
                <Text style={styles.detailText}>
                  {formatTime(selectedTrip.startTime)} -{' '}
                  {selectedTrip.endTime ? formatTime(selectedTrip.endTime) : 'N/A'}
                </Text>

                <Text style={styles.detailTitle}>Statistics</Text>
                <Text style={styles.detailText}>
                  Distance: {stats.totalDistance.toFixed(1)} nm{'\n'}
                  Duration: {stats.duration} minutes{'\n'}
                  Max Speed: {stats.maxSpeed.toFixed(1)} knots
                </Text>

                <Text style={styles.detailTitle}>Weather Conditions</Text>
                {selectedTrip.weatherConditions.map((weather, index) => (
                  <Text key={index} style={styles.detailText}>
                    Temperature: {weather.temperature}°C{'\n'}
                    Wind: {weather.windSpeed} knots at {weather.windDirection}°{'\n'}
                    Pressure: {weather.pressure} hPa
                  </Text>
                ))}

                <Text style={styles.detailTitle}>Crew</Text>
                {selectedTrip.crewMembers.map((crew, index) => (
                  <Text key={index} style={styles.detailText}>
                    {crew.name} - {crew.role}
                  </Text>
                ))}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.shareButton]}
                  onPress={() => {
                    setShowTripModal(false);
                    setShowShareModal(true);
                  }}
                >
                  <Text style={styles.buttonText}>Share Trip</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.closeButton]}
                  onPress={() => setShowTripModal(false)}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Trip History</Text>
          {trips.map(trip => (
            <TouchableOpacity
              key={trip.id}
              style={styles.tripCard}
              onPress={() => {
                setSelectedTrip(trip);
                setShowTripModal(true);
              }}
            >
              <View style={styles.tripHeader}>
                <Text style={styles.tripDate}>{formatDate(trip.startTime)}</Text>
                <TouchableOpacity
                  onPress={e => {
                    e.stopPropagation();
                    setSelectedTrip(trip);
                    setShowShareModal(true);
                  }}
                >
                  <Ionicons name="share-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
              </View>
              <Text style={styles.vesselName}>{vessels[trip.vesselId]?.name}</Text>
              <Text style={styles.tripStats}>
                {calculateTripStats(trip).totalDistance.toFixed(1)} nm
              </Text>
              <Text style={styles.tripTime}>
                {formatTime(trip.startTime)} - {trip.endTime ? formatTime(trip.endTime) : 'Ongoing'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {renderTripModal()}
      {selectedTrip && vessels[selectedTrip.vesselId] && (
        <ShareTripModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          trip={selectedTrip}
          vessel={vessels[selectedTrip.vesselId]}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    padding: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#8E8E93',
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  content: {
    padding: 20,
  },
  detailText: {
    color: '#666',
    fontSize: 16,
    marginBottom: 5,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
  },
  detailsContainer: {
    gap: 10,
  },
  map: {
    flex: 1,
  },
  mapContainer: {
    borderRadius: 10,
    height: 300,
    marginBottom: 20,
    overflow: 'hidden',
  },
  modalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
    marginTop: 50,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  shareButton: {
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tripCard: {
    backgroundColor: '#f8f8f8',
    borderLeftColor: '#007AFF',
    borderLeftWidth: 4,
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
  },
  tripDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tripHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  tripStats: {
    color: '#007AFF',
    fontSize: 14,
    marginBottom: 5,
  },
  tripTime: {
    color: '#999',
    fontSize: 12,
  },
  vesselName: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
});

export default TripHistoryScreen;
