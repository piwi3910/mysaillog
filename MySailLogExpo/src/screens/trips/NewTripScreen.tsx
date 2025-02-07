import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { TripStackParamList } from '../../navigation/types';
import * as tripService from '../../services/trip';
import { useAnalytics } from '../../hooks/useAnalytics';
import { Vessel } from '../../models/types';
import LoadingScreen from '../../components/LoadingScreen';

type NavigationProp = NativeStackNavigationProp<TripStackParamList, 'NewTrip'>;

export default function NewTripScreen() {
  const [name, setName] = useState('');
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const { trackEvent } = useAnalytics();

  const handleSelectVessel = () => {
    navigation.navigate('VesselSelector', {
      currentVesselId: selectedVessel?.id,
      onSelect: (vessel) => {
        setSelectedVessel(vessel);
      },
    });
  };

  const handleStartTrip = async () => {
    if (!user) return;
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a trip name');
      return;
    }
    if (!selectedVessel) {
      Alert.alert('Error', 'Please select a vessel');
      return;
    }

    try {
      setIsLoading(true);

      const trip = await tripService.startTrip({
        ownerId: user.id,
        vesselId: selectedVessel.id,
        name: name.trim(),
        status: 'active',
        startTime: new Date().toISOString(),
        notes: notes.trim() || undefined,
        waypoints: [],
        weatherRecords: [],
        crewMembers: [],
      });

      void trackEvent('trip_started', {
        tripId: trip.id,
        vesselId: trip.vesselId,
      });

      navigation.replace('TripDetails', { tripId: trip.id });
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to start trip'
      );
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Starting trip..." />;
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Trip Details
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Trip Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Enter trip name"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
              />
            </View>

            <TouchableOpacity
              style={[styles.vesselSelector, { borderColor: colors.border }]}
              onPress={handleSelectVessel}
            >
              <View style={styles.vesselSelectorContent}>
                <MaterialCommunityIcons
                  name="ferry"
                  size={24}
                  color={colors.textSecondary}
                />
                <Text
                  style={[
                    styles.vesselSelectorText,
                    { color: selectedVessel ? colors.text : colors.textSecondary },
                  ]}
                >
                  {selectedVessel ? selectedVessel.name : 'Select Vessel'}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Notes (optional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { color: colors.text, borderColor: colors.border },
                ]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add trip notes"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: colors.primary }]}
          onPress={handleStartTrip}
        >
          <MaterialCommunityIcons name="sail-boat" size={24} color="#FFFFFF" />
          <Text style={styles.startButtonText}>Start Trip</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
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
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 8,
    paddingBottom: 8,
  },
  vesselSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  vesselSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vesselSelectorText: {
    fontSize: 16,
    marginLeft: 12,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    marginTop: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});