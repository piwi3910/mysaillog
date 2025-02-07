import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, GeoPoint, Vessel, WeatherData, CrewMember, RoutePoint } from '../types';
import { getCurrentLocation, startLocationTracking } from '../utils/location';
import { createRoutePoint, calculateTripStats } from '../utils/tripUtils';
import { fetchWeatherData } from '../utils/weather';
import WeatherDisplay from '../components/WeatherDisplay';

interface TripStats {
  totalDistance: number;
  maxSpeed: number;
  duration: number;
}

export const TripScreen = () => {
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [currentLocation, setCurrentLocation] = useState<GeoPoint | null>(null);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [showVesselModal, setShowVesselModal] = useState(false);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [newCrewMember, setNewCrewMember] = useState<CrewMember>({ name: '', role: '' });
  const [showCrewModal, setShowCrewModal] = useState(false);
  const [tripStats, setTripStats] = useState<TripStats | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData>({
    timestamp: new Date(),
    temperature: 0,
    windSpeed: 0,
    windDirection: 0,
    pressure: 1013,
    notes: '',
  });
  const [weatherUpdateInterval, setWeatherUpdateInterval] = useState<NodeJS.Timeout | null>(null);

  const loadVessels = async () => {
    try {
      const storedVessels = await AsyncStorage.getItem('vessels');
      if (storedVessels) {
        setVessels(JSON.parse(storedVessels));
      }
    } catch (error) {
      console.error('Error loading vessels:', error);
    }
  };

  const initializeLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setCurrentLocation(location);
    }
  };

  useEffect(() => {
    loadVessels();
    initializeLocation();
    return () => {
      if (weatherUpdateInterval) {
        clearInterval(weatherUpdateInterval);
      }
    };
  }, []);

  const updateWeatherInfo = useCallback(async (location: GeoPoint) => {
    try {
      const weatherInfo = await fetchWeatherData(location);
      setWeatherData(weatherInfo);
      if (activeTrip) {
        setActiveTrip(prev => ({
          ...prev!,
          weatherConditions: [...prev!.weatherConditions, weatherInfo],
        }));
      }
    } catch (error) {
      console.error('Error updating weather:', error);
    }
  }, [activeTrip]);

  const startNewTrip = async () => {
    if (!selectedVessel) {
      setShowVesselModal(true);
      return;
    }

    const location = await getCurrentLocation();
    if (!location) {
      Alert.alert('Error', 'Unable to get current location');
      return;
    }

    // Fetch initial weather data
    const initialWeather = await fetchWeatherData(location);
    const tripId = Date.now().toString();
    const initialRoutePoint = createRoutePoint(location, tripId);

    const newTrip: Trip = {
      id: tripId,
      vesselId: selectedVessel.id,
      startTime: new Date(),
      startLocation: location,
      crewMembers: crewMembers,
      weatherConditions: [initialWeather],
      route: [initialRoutePoint],
    };

    const stopTracking = await startLocationTracking((location) => {
      const newRoutePoint = createRoutePoint(location, tripId);
      setCurrentLocation(location);
      setRoutePoints((prev) => [...prev, newRoutePoint]);
      if (activeTrip) {
        const updatedTrip = {
          ...activeTrip,
          route: [...activeTrip.route, newRoutePoint],
        };
        setActiveTrip(updatedTrip);
        const stats = calculateTripStats(updatedTrip);
        setTripStats(stats);
      }
    });

    // Set up weather update interval
    const interval = setInterval(() => {
      if (currentLocation) {
        updateWeatherInfo(currentLocation);
      }
    }, 15 * 60 * 1000); // Update every 15 minutes
    setWeatherUpdateInterval(interval);

    setActiveTrip(newTrip);
    setRoutePoints([initialRoutePoint]);
    setWeatherData(initialWeather);

    return () => {
      stopTracking();
      if (interval) {
        clearInterval(interval);
      }
    };
  };

  const endTrip = async () => {
    if (!activeTrip || !currentLocation) return;

    if (weatherUpdateInterval) {
      clearInterval(weatherUpdateInterval);
      setWeatherUpdateInterval(null);
    }

    const finalRoutePoint = createRoutePoint(currentLocation, activeTrip.id);
    const finalWeather = await fetchWeatherData(currentLocation);
    
    const endedTrip = {
      ...activeTrip,
      endTime: new Date(),
      endLocation: currentLocation,
      route: [...routePoints, finalRoutePoint],
      weatherConditions: [...activeTrip.weatherConditions, finalWeather],
    };

    try {
      const storedTrips = await AsyncStorage.getItem('trips');
      const trips = storedTrips ? JSON.parse(storedTrips) : [];
      await AsyncStorage.setItem(
        'trips',
        JSON.stringify([...trips, endedTrip])
      );

      const finalStats = calculateTripStats(endedTrip);
      Alert.alert(
        'Trip Summary',
        `Distance: ${finalStats.totalDistance.toFixed(1)} nm\n` +
        `Duration: ${finalStats.duration} minutes\n` +
        `Max Speed: ${finalStats.maxSpeed.toFixed(1)} knots\n` +
        `Weather: ${finalWeather.notes}`
      );

      setActiveTrip(null);
      setRoutePoints([]);
      setCrewMembers([]);
      setSelectedVessel(null);
      setTripStats(null);
    } catch (error) {
      console.error('Error saving trip:', error);
      Alert.alert('Error', 'Failed to save trip');
    }
  };

  const addCrewMember = () => {
    if (!newCrewMember.name || !newCrewMember.role) {
      Alert.alert('Error', 'Please fill in all crew member details');
      return;
    }

    setCrewMembers([...crewMembers, newCrewMember]);
    setNewCrewMember({ name: '', role: '' });
    setShowCrewModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {currentLocation && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker coordinate={currentLocation} />
                {routePoints.length > 1 && (
                  <Polyline
                    coordinates={routePoints}
                    strokeColor="#007AFF"
                    strokeWidth={3}
                  />
                )}
              </MapView>
            </View>
          )}

          {!activeTrip ? (
            <View style={styles.startTripContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setShowVesselModal(true)}
              >
                <Text style={styles.buttonText}>
                  {selectedVessel
                    ? `Selected: ${selectedVessel.name}`
                    : 'Select Vessel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() => setShowCrewModal(true)}
              >
                <Text style={styles.buttonText}>
                  Add Crew Members ({crewMembers.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.startButton]}
                onPress={startNewTrip}
                disabled={!selectedVessel}
              >
                <Text style={styles.buttonText}>Start Trip</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.activeTripContainer}>
              <Text style={styles.title}>Active Trip</Text>
              
              {tripStats && (
                <View style={styles.statsContainer}>
                  <Text style={styles.statsText}>
                    Distance: {tripStats.totalDistance.toFixed(1)} nm
                  </Text>
                  <Text style={styles.statsText}>
                    Duration: {tripStats.duration} min
                  </Text>
                  <Text style={styles.statsText}>
                    Max Speed: {tripStats.maxSpeed.toFixed(1)} kts
                  </Text>
                </View>
              )}

              <WeatherDisplay weather={weatherData} />

              <TouchableOpacity
                style={[styles.button, styles.endButton]}
                onPress={endTrip}
              >
                <Text style={styles.buttonText}>End Trip</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Vessel Selection Modal */}
      <Modal
        visible={showVesselModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Vessel</Text>
            <ScrollView>
              {vessels.map((vessel) => (
                <TouchableOpacity
                  key={vessel.id}
                  style={styles.vesselItem}
                  onPress={() => {
                    setSelectedVessel(vessel);
                    setShowVesselModal(false);
                  }}
                >
                  <Text style={styles.vesselName}>{vessel.name}</Text>
                  <Text style={styles.vesselDetails}>
                    {vessel.type} - {vessel.length}m
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setShowVesselModal(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Crew Members Modal */}
      <Modal
        visible={showCrewModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Crew Member</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={newCrewMember.name}
              onChangeText={(text) =>
                setNewCrewMember({ ...newCrewMember, name: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Role"
              value={newCrewMember.role}
              onChangeText={(text) =>
                setNewCrewMember({ ...newCrewMember, role: text })
              }
            />
            <TouchableOpacity
              style={styles.button}
              onPress={addCrewMember}
            >
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setShowCrewModal(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>

            {crewMembers.length > 0 && (
              <View style={styles.crewList}>
                <Text style={styles.subtitle}>Current Crew</Text>
                {crewMembers.map((crew, index) => (
                  <View key={index} style={styles.crewItem}>
                    <Text style={styles.crewName}>{crew.name}</Text>
                    <Text style={styles.crewRole}>{crew.role}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  mapContainer: {
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  startTripContainer: {
    gap: 10,
  },
  activeTripContainer: {
    gap: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#34C759',
  },
  endButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButton: {
    backgroundColor: '#8E8E93',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  vesselItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  vesselName: {
    fontSize: 18,
    fontWeight: '600',
  },
  vesselDetails: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  statsText: {
    fontSize: 16,
    marginBottom: 5,
  },
  crewList: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  crewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  crewName: {
    fontSize: 16,
    fontWeight: '500',
  },
  crewRole: {
    fontSize: 14,
    color: '#666',
  },
});

export default TripScreen;