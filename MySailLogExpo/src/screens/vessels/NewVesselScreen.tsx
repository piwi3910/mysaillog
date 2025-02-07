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
import { VesselStackParamList } from '../../navigation/types';
import * as vesselService from '../../services/vessel';
import { useAnalytics } from '../../hooks/useAnalytics';
import LoadingScreen from '../../components/LoadingScreen';

type NavigationProp = NativeStackNavigationProp<VesselStackParamList, 'NewVessel'>;

const vesselTypes = [
  'Sailboat',
  'Motor Yacht',
  'Catamaran',
  'Trimaran',
  'Other',
] as const;

type VesselType = typeof vesselTypes[number];

export default function NewVesselScreen() {
  const [name, setName] = useState('');
  const [type, setType] = useState<VesselType>('Sailboat');
  const [length, setLength] = useState('');
  const [homePort, setHomePort] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const { trackEvent } = useAnalytics();

  const handleCreateVessel = async () => {
    if (!user) return;
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a vessel name');
      return;
    }
    if (!length || isNaN(Number(length)) || Number(length) <= 0) {
      Alert.alert('Error', 'Please enter a valid vessel length');
      return;
    }

    try {
      setIsLoading(true);

      const vessel = await vesselService.createVessel({
        ownerId: user.id,
        name: name.trim(),
        type,
        length: Number(length),
        homePort: homePort.trim() || undefined,
        registrationNumber: registrationNumber.trim() || undefined,
      });

      void trackEvent('vessel_created', {
        vesselId: vessel.id,
        vesselType: vessel.type,
      });

      navigation.replace('VesselDetails', { vesselId: vessel.id });
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create vessel'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Creating vessel..." />;
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
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={handleCreateVessel}
        >
          <MaterialCommunityIcons name="ferry" size={24} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Create Vessel</Text>
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    marginTop: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});