import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { TripStackParamList } from '../../navigation/types';
import * as vesselService from '../../services/vessel';
import { Vessel } from '../../models/types';
import LoadingScreen from '../../components/LoadingScreen';

type NavigationProp = NativeStackNavigationProp<TripStackParamList, 'VesselSelector'>;
type RoutePropType = RouteProp<TripStackParamList, 'VesselSelector'>;

export default function VesselSelectorScreen() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);

  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();

  useEffect(() => {
    loadVessels();
  }, []);

  const loadVessels = async () => {
    if (!user) return;

    try {
      const userVessels = await vesselService.getVessels(user.id);
      setVessels(userVessels);
      if (route.params?.currentVesselId) {
        setSelectedVesselId(route.params.currentVesselId);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to load vessels. Please try again.'
      );
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async () => {
    if (!selectedVesselId) {
      Alert.alert('Error', 'Please select a vessel');
      return;
    }

    try {
      setIsSelecting(true);
      const selectedVessel = vessels.find(v => v.id === selectedVesselId);
      if (!selectedVessel) {
        throw new Error('Selected vessel not found');
      }

      if (route.params?.onSelect) {
        route.params.onSelect(selectedVessel);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to select vessel'
      );
      setIsSelecting(false);
    }
  };

  const handleAddVessel = () => {
    navigation.navigate('Vessels', {
      screen: 'NewVessel',
    });
  };

  const renderVesselCard = ({ item: vessel }: { item: Vessel }) => (
    <TouchableOpacity
      style={[
        styles.vesselCard,
        { backgroundColor: colors.surface },
        selectedVesselId === vessel.id && {
          borderColor: colors.primary,
          borderWidth: 2,
        },
      ]}
      onPress={() => setSelectedVesselId(vessel.id)}
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
      {selectedVesselId === vessel.id && (
        <MaterialCommunityIcons
          name="check-circle"
          size={24}
          color={colors.primary}
        />
      )}
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
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="ferry"
              size={64}
              color={colors.primary}
              style={styles.emptyStateIcon}
            />
            <Text style={[styles.emptyStateText, { color: colors.text }]}>
              No vessels available
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
              Add a vessel to get started
            </Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.surface }]}
          onPress={handleAddVessel}
        >
          <MaterialCommunityIcons name="plus" size={24} color={colors.primary} />
          <Text style={[styles.addButtonText, { color: colors.primary }]}>
            Add New Vessel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.selectButton,
            { backgroundColor: colors.primary },
            (!selectedVesselId || isSelecting) && styles.selectButtonDisabled,
          ]}
          onPress={handleSelect}
          disabled={!selectedVesselId || isSelecting}
        >
          {isSelecting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="check" size={24} color="#FFFFFF" />
              <Text style={styles.selectButtonText}>Select Vessel</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  footer: {
    padding: 16,
    gap: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
  },
  selectButtonDisabled: {
    opacity: 0.7,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});