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
import { VesselStackParamList } from '../../navigation/types';
import * as vesselService from '../../services/vessel';
import { Vessel } from '../../models/types';
import { useAnalytics } from '../../hooks/useAnalytics';
import LoadingScreen from '../../components/LoadingScreen';

type NavigationProp = NativeStackNavigationProp<VesselStackParamList, 'VesselDetails'>;
type RoutePropType = RouteProp<VesselStackParamList, 'VesselDetails'>;

export default function VesselDetailsScreen() {
  const [vessel, setVessel] = useState<Vessel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    loadVessel();
  }, []);

  const loadVessel = async () => {
    try {
      const vesselData = await vesselService.getVessel(route.params.vesselId);
      setVessel(vesselData);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to load vessel details. Please try again.'
      );
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (vessel) {
      navigation.navigate('EditVessel', { vesselId: vessel.id });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Vessel',
      'Are you sure you want to delete this vessel? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirmDelete },
      ]
    );
  };

  const confirmDelete = async () => {
    if (!vessel) return;

    try {
      setIsDeleting(true);
      await vesselService.deleteVessel(vessel.id);
      void trackEvent('vessel_deleted', {
        vesselId: vessel.id,
        vesselType: vessel.type,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to delete vessel'
      );
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading vessel details..." />;
  }

  if (!vessel) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <MaterialCommunityIcons
            name="ferry"
            size={48}
            color={colors.primary}
          />
          <Text style={[styles.vesselName, { color: colors.text }]}>
            {vessel.name}
          </Text>
          <Text style={[styles.vesselType, { color: colors.textSecondary }]}>
            {vessel.type}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Details
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons
                name="ruler"
                size={24}
                color={colors.textSecondary}
              />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Length
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {vessel.length} meters
                </Text>
              </View>
            </View>

            {vessel.homePort && (
              <View style={styles.detailRow}>
                <MaterialCommunityIcons
                  name="anchor"
                  size={24}
                  color={colors.textSecondary}
                />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Home Port
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {vessel.homePort}
                  </Text>
                </View>
              </View>
            )}

            {vessel.registrationNumber && (
              <View style={styles.detailRow}>
                <MaterialCommunityIcons
                  name="card-text"
                  size={24}
                  color={colors.textSecondary}
                />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Registration Number
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {vessel.registrationNumber}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleEdit}
          >
            <MaterialCommunityIcons name="pencil" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Edit Vessel</Text>
          </TouchableOpacity>

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
                <Text style={styles.actionButtonText}>Delete Vessel</Text>
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
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
  vesselName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  vesselType: {
    fontSize: 16,
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
    alignItems: 'center',
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