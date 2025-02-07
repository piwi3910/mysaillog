import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface, Portal, Modal, TextInput, useTheme, MD3Theme } from 'react-native-paper';
import MapView, { Polyline, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, Vessel, Location as LocationType, Weather, CrewMember, dateToTimestamp } from '../types';
import { getCurrentWeather } from '../utils/weather';
import { calculateTripStats, formatDistance, formatDuration, formatSpeed } from '../utils/tripUtils';

const WEATHER_UPDATE_INTERVAL = 15 * 60 * 1000; // 15 minutes

export const TripScreen: React.FC = () => {
  const theme = useTheme();
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [showVesselModal, setShowVesselModal] = useState(false);
  const [showCrewModal, setShowCrewModal] = useState(false);
  const [newCrewMember, setNewCrewMember] = useState<CrewMember>({ name: '', role: '' });
  const [routePoints, setRoutePoints] = useState<LocationType[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationType | null>(null);
  const [weatherUpdateInterval, setWeatherUpdateInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  const styles = React.useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    loadVessels();
    setupLocationTracking();
    return () => {
      if (weatherUpdateInterval) {
        clearInterval(weatherUpdateInterval);
      }
    };
  }, []);

  const setupLocationTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Location permission denied');
      return;
    }

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (location) => {
        const newLocation: LocationType = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: location.timestamp,
          speed: location.coords.speed || 0,
        };
        setCurrentLocation(newLocation);
        if (activeTrip) {
          setRoutePoints(prev => [...prev, newLocation]);
        }
      }
    );
  };

  const startTrip = async () => {
    if (!selectedVessel || !currentLocation) return;

    const weather = await getCurrentWeather(currentLocation);
    const newTrip: Trip = {
      id: Date.now().toString(),
      startTime: dateToTimestamp(new Date()),
      endTime: 0,
      route: [currentLocation],
      weatherLog: [weather],
      crew: crewMembers,
      vesselId: selectedVessel.id,
    };

    setActiveTrip(newTrip);
    setRoutePoints([currentLocation]);

    const interval = setInterval(async () => {
      if (currentLocation) {
        const weather = await getCurrentWeather(currentLocation);
        setActiveTrip(prev => prev ? {
          ...prev,
          weatherLog: [...prev.weatherLog, weather],
        } : null);
      }
    }, WEATHER_UPDATE_INTERVAL);

    setWeatherUpdateInterval(interval);
  };

  const endTrip = async () => {
    if (!activeTrip || !currentLocation) return;

    const finalWeather = await getCurrentWeather(currentLocation);
    const endedTrip: Trip = {
      ...activeTrip,
      endTime: dateToTimestamp(new Date()),
      route: [...routePoints, currentLocation],
      weatherLog: [...activeTrip.weatherLog, finalWeather],
    };

    try {
      const storedTrips = await AsyncStorage.getItem('trips');
      const trips: Trip[] = storedTrips ? JSON.parse(storedTrips) : [];
      await AsyncStorage.setItem('trips', JSON.stringify([...trips, endedTrip]));
    } catch (error) {
      console.error('Error saving trip:', error);
    }

    if (weatherUpdateInterval) {
      clearInterval(weatherUpdateInterval);
    }

    setActiveTrip(null);
    setRoutePoints([]);
    setWeatherUpdateInterval(null);
  };

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

  const addCrewMember = () => {
    if (newCrewMember.name && newCrewMember.role) {
      setCrewMembers(prev => [...prev, newCrewMember]);
      setNewCrewMember({ name: '', role: '' });
    }
  };

  const tripStats = activeTrip ? calculateTripStats(activeTrip) : null;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation
        followsUserLocation
      >
        {routePoints.length > 0 && (
          <Polyline
            coordinates={routePoints}
            strokeColor={theme.colors.primary}
            strokeWidth={3}
          />
        )}
      </MapView>

      <Surface style={styles.controlPanel} elevation={2}>
        {!activeTrip ? (
          <>
            <Button
              mode="outlined"
              onPress={() => setShowVesselModal(true)}
              style={styles.button}
            >
              {selectedVessel
                ? `Selected: ${selectedVessel.name}`
                : 'Select Vessel'}
            </Button>

            <Button
              mode="outlined"
              onPress={() => setShowCrewModal(true)}
              style={styles.button}
            >
              {`Add Crew Members (${crewMembers.length})`}
            </Button>

            <Button
              mode="contained"
              onPress={startTrip}
              disabled={!selectedVessel}
              style={styles.button}
            >
              Start Trip
            </Button>
          </>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <Text variant="titleMedium">Trip Stats</Text>
              <Text variant="bodyMedium">
                Duration: {formatDuration(tripStats?.duration || 0)}
              </Text>
              <Text variant="bodyMedium">
                Distance: {formatDistance(tripStats?.distance || 0)}
              </Text>
              <Text variant="bodyMedium">
                Avg Speed: {formatSpeed(tripStats?.averageSpeed || 0)}
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={endTrip}
              style={[styles.button, { backgroundColor: theme.colors.error }]}
            >
              End Trip
            </Button>
          </>
        )}
      </Surface>

      <Portal>
        <Modal
          visible={showVesselModal}
          onDismiss={() => setShowVesselModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Surface style={styles.modalSurface} elevation={2}>
            <Text variant="titleLarge" style={styles.modalTitle}>Select Vessel</Text>
            {vessels.map(vessel => (
              <Button
                key={vessel.id}
                mode="outlined"
                onPress={() => {
                  setSelectedVessel(vessel);
                  setShowVesselModal(false);
                }}
                style={styles.vesselButton}
              >
                {vessel.name}
              </Button>
            ))}
            <Button
              mode="contained"
              onPress={() => setShowVesselModal(false)}
              style={styles.button}
            >
              Close
            </Button>
          </Surface>
        </Modal>

        <Modal
          visible={showCrewModal}
          onDismiss={() => setShowCrewModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Surface style={styles.modalSurface} elevation={2}>
            <Text variant="titleLarge" style={styles.modalTitle}>Add Crew</Text>
            
            <TextInput
              label="Name"
              value={newCrewMember.name}
              onChangeText={text => setNewCrewMember({ ...newCrewMember, name: text })}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Role"
              value={newCrewMember.role}
              onChangeText={text => setNewCrewMember({ ...newCrewMember, role: text })}
              style={styles.input}
              mode="outlined"
            />

            <Button
              mode="contained"
              onPress={addCrewMember}
              style={styles.button}
            >
              Add Crew Member
            </Button>

            {crewMembers.map((crew, index) => (
              <Surface key={index} style={styles.crewCard} elevation={1}>
                <Text variant="bodyLarge">{crew.name}</Text>
                <Text variant="bodyMedium">{crew.role}</Text>
              </Surface>
            ))}

            <Button
              mode="outlined"
              onPress={() => setShowCrewModal(false)}
              style={styles.button}
            >
              Done
            </Button>
          </Surface>
        </Modal>
      </Portal>
    </View>
  );
};

const createStyles = (theme: MD3Theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controlPanel: {
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: theme.colors.surface,
  },
  button: {
    marginVertical: 8,
  },
  modalContent: {
    padding: 20,
  },
  modalSurface: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  vesselButton: {
    marginBottom: 8,
  },
  statsContainer: {
    marginBottom: 16,
  },
  crewCard: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceVariant,
  },
});

export default TripScreen;
