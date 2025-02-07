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
import { VesselStackParamList } from '../../navigation/types';
import { Vessel } from '../../models/types';
import * as vesselService from '../../services/vessel';
import LoadingScreen from '../../components/LoadingScreen';

type NavigationProp = NativeStackNavigationProp<VesselStackParamList, 'VesselList'>;

export default function VesselListScreen() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    loadVessels();
  }, []);

  const loadVessels = async () => {
    if (!user) return;

    try {
      const userVessels = await vesselService.getVessels(user.id);
      setVessels(userVessels);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to load vessels. Please try again.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadVessels();
  };

  const handleAddVessel = () => {
    navigation.navigate('NewVessel');
  };

  const renderVesselCard = ({ item: vessel }: { item: Vessel }) => (
    <TouchableOpacity
      style={[styles.vesselCard, { backgroundColor: colors.surface }]}
      onPress={() => navigation.navigate('VesselDetails', { vesselId: vessel.id })}
    >
      <View style={styles.vesselInfo}>
        <Text style={[styles.vesselName, { color: colors.text }]}>
          {vessel.name}
        </Text>
        <Text style={[styles.vesselType, { color: colors.textSecondary }]}>
          {vessel.type}
        </Text>
        <View style={styles.vesselDetails}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons
              name="ruler"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={[styles.detailText, { color: colors.text }]}>
              {vessel.length}m
            </Text>
          </View>
          {vessel.homePort && (
            <View style={styles.detailItem}>
              <MaterialCommunityIcons
                name="anchor"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={[styles.detailText, { color: colors.text }]}>
                {vessel.homePort}
              </Text>
            </View>
          )}
        </View>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color={colors.textSecondary}
      />
    </TouchableOpacity>
  );

  if (isLoading) {
    return <LoadingScreen message="Loading vessels..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={vessels}
        renderItem={renderVesselCard}
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
              name="ferry"
              size={64}
              color={colors.primary}
              style={styles.emptyStateIcon}
            />
            <Text style={[styles.emptyStateText, { color: colors.text }]}>
              No vessels yet
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
              Add your first vessel to get started
            </Text>
          </View>
        }
      />
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleAddVessel}
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
  vesselCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  vesselInfo: {
    flex: 1,
  },
  vesselName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  vesselType: {
    fontSize: 14,
    marginBottom: 8,
  },
  vesselDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
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