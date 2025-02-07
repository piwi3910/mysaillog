import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { TripStackParamList } from '../../navigation/types';
import * as tripService from '../../services/trip';
import * as vesselService from '../../services/vessel';
import { Trip, Vessel } from '../../models/types';
import { useAnalytics } from '../../hooks/useAnalytics';
import LoadingScreen from '../../components/LoadingScreen';

type NavigationProp = NativeStackNavigationProp<TripStackParamList, 'TripDetails'>;
type RoutePropType = RouteProp<TripStackParamList, 'TripDetails'>;

export default function TripDetailsScreen() {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [vessel, setVessel] = useState<Vessel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnding, setIsEnding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    loadTrip();
  }, []);

  const loadTrip = async () => {
    try {
      const tripData = await tripService.getTrip(route.params.tripId);
      if (!tripData) {
        throw new Error('Trip not found');
      }
      setTrip(tripData);

      const vesselData = await vesselService.getVessel(tripData.vesselId);
      setVessel(vesselData);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to load trip details. Please try again.'
      );
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndTrip = () => {
    if (trip?.status === 'completed') return;

    Alert.alert(
      'End Trip',
      'Are you sure you want to end this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End Trip', onPress: confirmEndTrip },
      ]
    );
  };

  const confirmEndTrip = async () => {
    if (!trip) return;

    try {
      setIsEnding(true);
      const updatedTrip = await tripService.endTrip(trip.id);
      void trackEvent('trip_ended', {
        tripId: updatedTrip.id,
        vesselId: updatedTrip.vesselId,
        duration: updatedTrip.duration || undefined,
        distance: updatedTrip.distance || undefined,
      });
      setTrip(updatedTrip);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to end trip'
      );
    } finally {
      setIsEnding(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to delete this trip? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirmDelete },
      ]
    );
  };

  const confirmDelete = async () => {
    if (!trip) return;

    try {
      setIsDeleting(true);
      await tripService.deleteTrip(trip.id);
      void trackEvent('trip_deleted', {
        tripId: trip.id,
        vesselId: trip.vesselId,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to delete trip'
      );
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading trip details..." />;
  }

  if (!trip || !vessel) {
    return null;
  }

  const formatDuration = (duration: number | null) => {
    if (!duration) return 'In progress';
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.tripName, { color: colors.text }]}>
            {trip.name}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: trip.status === 'completed' ? colors.primary : colors.error },
            ]}
          >
            <Text style={styles.statusText}>
              {trip.status === 'completed' ? 'Completed' : 'In Progress'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Trip Details
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons
                name="ferry"
                size={24}
                color={colors.textSecondary}
              />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Vessel
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {vessel.name}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <MaterialCommunityIcons
                name="calendar"
                size={24}
                color={colors.textSecondary}
              />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Start Time
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {new Date(trip.startTime).toLocaleString()}
                </Text>
              </View>
            </View>

            {trip.endTime && (
              <View style={styles.detailRow}>
                <MaterialCommunityIcons
                  name="calendar-check"
                  size={24}
                  color={colors.textSecondary}
                />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    End Time
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {new Date(trip.endTime).toLocaleString()}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.detailRow}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={24}
                color={colors.textSecondary}
              />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Duration
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {formatDuration(trip.duration)}
                </Text>
              </View>
            </View>

            {trip.distance && (
              <View style={styles.detailRow}>
                <MaterialCommunityIcons
                  name="map-marker-distance"
                  size={24}
                  color={colors.textSecondary}
                />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Distance
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {trip.distance.toFixed(1)} nm
                  </Text>
                </View>
              </View>
            )}

            {trip.notes && (
              <View style={styles.detailRow}>
                <MaterialCommunityIcons
                  name="note-text"
                  size={24}
                  color={colors.textSecondary}
                />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Notes
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {trip.notes}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          {trip.status !== 'completed' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={handleEndTrip}
              disabled={isEnding}
            >
              {isEnding ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="flag-checkered" size={24} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>End Trip</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialCommunityIcons name="delete" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Delete Trip</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  tripName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  detailContent: {
    marginLeft: 16,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 24,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});