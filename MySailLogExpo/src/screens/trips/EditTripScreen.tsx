import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { TripStackParamList } from '../../navigation/types';
import * as tripService from '../../services/trip';
import { Trip } from '../../models/types';
import { useAnalytics } from '../../hooks/useAnalytics';
import LoadingScreen from '../../components/LoadingScreen';

type NavigationProp = NativeStackNavigationProp<TripStackParamList, 'EditTrip'>;
type RoutePropType = RouteProp<TripStackParamList, 'EditTrip'>;

export default function EditTripScreen() {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
      setName(tripData.name);
      setNotes(tripData.notes || '');
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

  const handleSave = async () => {
    if (!trip) return;
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a trip name');
      return;
    }

    try {
      setIsSaving(true);
      const updatedTrip = await tripService.updateTrip(trip.id, {
        name: name.trim(),
        notes: notes.trim() || undefined,
      });

      void trackEvent('trip_updated', {
        tripId: updatedTrip.id,
        vesselId: updatedTrip.vesselId,
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update trip'
      );
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading trip..." />;
  }

  if (!trip) {
    return null;
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
                editable={!isSaving}
              />
            </View>

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
                editable={!isSaving}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: colors.primary },
            isSaving && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <MaterialCommunityIcons name="check" size={24} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Text>
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
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});