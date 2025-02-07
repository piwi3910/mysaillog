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
import { VesselStackParamList } from '../../navigation/types';
import * as vesselService from '../../services/vessel';
import { Vessel } from '../../models/types';
import { useAnalytics } from '../../hooks/useAnalytics';
import LoadingScreen from '../../components/LoadingScreen';

type NavigationProp = NativeStackNavigationProp<VesselStackParamList, 'EditVessel'>;
type RoutePropType = RouteProp<VesselStackParamList, 'EditVessel'>;

const vesselTypes = [
  'Sailboat',
  'Motor Yacht',
  'Catamaran',
  'Trimaran',
  'Other',
] as const;

type VesselType = typeof vesselTypes[number];

export default function EditVesselScreen() {
  const [vessel, setVessel] = useState<Vessel | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<VesselType>('Sailboat');
  const [length, setLength] = useState('');
  const [homePort, setHomePort] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
      if (!vesselData) {
        throw new Error('Vessel not found');
      }
      
      setVessel(vesselData);
      setName(vesselData.name);
      setType(vesselData.type as VesselType);
      setLength(vesselData.length.toString());
      setHomePort(vesselData.homePort || '');
      setRegistrationNumber(vesselData.registrationNumber || '');
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

  const handleSave = async () => {
    if (!vessel) return;
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a vessel name');
      return;
    }
    if (!length || isNaN(Number(length)) || Number(length) <= 0) {
      Alert.alert('Error', 'Please enter a valid vessel length');
      return;
    }

    try {
      setIsSaving(true);
      const updatedVessel = await vesselService.updateVessel(vessel.id, {
        name: name.trim(),
        type,
        length: Number(length),
        homePort: homePort.trim() || undefined,
        registrationNumber: registrationNumber.trim() || undefined,
      });

      void trackEvent('vessel_updated', {
        vesselId: updatedVessel.id,
        vesselType: updatedVessel.type,
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update vessel'
      );
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading vessel..." />;
  }

  if (!vessel) {
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
            Vessel Details
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Vessel Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Enter vessel name"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
                editable={!isSaving}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Vessel Type
              </Text>
              <View style={styles.typeButtons}>
                {vesselTypes.map((vesselType) => (
                  <TouchableOpacity
                    key={vesselType}
                    style={[
                      styles.typeButton,
                      {
                        backgroundColor:
                          type === vesselType ? colors.primary : colors.surface,
                        borderColor:
                          type === vesselType ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setType(vesselType)}
                    disabled={isSaving}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        {
                          color:
                            type === vesselType ? '#FFFFFF' : colors.textSecondary,
                        },
                      ]}
                    >
                      {vesselType}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Length (meters)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border },
                ]}
                value={length}
                onChangeText={setLength}
                placeholder="Enter vessel length"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
                editable={!isSaving}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Home Port (optional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border },
                ]}
                value={homePort}
                onChangeText={setHomePort}
                placeholder="Enter home port"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
                editable={!isSaving}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Registration Number (optional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border },
                ]}
                value={registrationNumber}
                onChangeText={setRegistrationNumber}
                placeholder="Enter registration number"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="characters"
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
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  typeButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
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