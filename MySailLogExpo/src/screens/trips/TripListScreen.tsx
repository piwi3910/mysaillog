import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { TripStackParamList } from '../../navigation/types';
import { Trip } from '../../models/types';
import * as tripService from '../../services/trip';
import LoadingScreen from '../../components/LoadingScreen';

type NavigationProp = NativeStackNavigationProp<TripStackParamList, 'TripList'>;

export default function TripListScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    if (!user) return;

    try {
      const userTrips = await tripService.getTrips(user.id);
      setTrips(userTrips);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to load trips. Please try again.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTrips();
  };

  const handleAddTrip = () => {
    navigation.navigate('NewTrip');
  };

  const formatDuration = (duration: number | null | undefined) => {
    if (!duration) return 'In progress';
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const renderTripCard = ({ item: trip }: { item: Trip }) => (
    <TouchableOpacity
      style={[styles.tripCard, { backgroundColor: colors.surface }]}
      onPress={() => navigation.navigate('TripDetails', { tripId: trip.id })}
    >
      <View style={styles.tripHeader}>
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

      <View style={styles.tripDetails}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons
            name="calendar"
            size={16}
            color={colors.textSecondary}
          />
          <Text style={[styles.detailText, { color: colors.text }]}>
            {new Date(trip.startTime).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={16}
            color={colors.textSecondary}
          />
          <Text style={[styles.detailText, { color: colors.text }]}>
            {formatDuration(trip.duration)}
          </Text>
        </View>

        {trip.distance && (
          <View style={styles.detailItem}>
            <MaterialCommunityIcons
              name="map-marker-distance"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={[styles.detailText, { color: colors.text }]}>
              {trip.distance.toFixed(1)} nm
            </Text>
          </View>
        )}
      </View>

      <View style={styles.tripFooter}>
        <View style={styles.crewInfo}>
          <MaterialCommunityIcons
            name="account-group"
            size={16}
            color={colors.textSecondary}
          />
          <Text style={[styles.crewText, { color: colors.textSecondary }]}>
            {trip.crewMembers.length} crew
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return <LoadingScreen message="Loading trips..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={trips}
        renderItem={renderTripCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="sail-boat"
              size={64}
              color={colors.primary}
              style={styles.emptyStateIcon}
            />
            <Text style={[styles.emptyStateText, { color: colors.text }]}>
              No trips yet
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
              Start your first sailing trip
            </Text>
          </View>
        }
      />
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleAddTrip}
      >
        <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  tripCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  tripDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 4,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  crewInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crewText: {
    fontSize: 14,
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});