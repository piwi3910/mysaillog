import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vessel, Equipment } from '../types';

export const VesselScreen = () => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [newVessel, setNewVessel] = useState({
    name: '',
    type: '',
    length: '',
    registrationNumber: '',
  });

  const saveVessel = async () => {
    if (!newVessel.name || !newVessel.type || !newVessel.length) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const vessel: Vessel = {
      id: Date.now().toString(),
      userId: 'temp-user-id', // TODO: Replace with actual user ID
      name: newVessel.name,
      type: newVessel.type,
      length: parseFloat(newVessel.length),
      registrationNumber: newVessel.registrationNumber,
      equipment: [],
    };

    try {
      const updatedVessels = [...vessels, vessel];
      await AsyncStorage.setItem('vessels', JSON.stringify(updatedVessels));
      setVessels(updatedVessels);
      setNewVessel({
        name: '',
        type: '',
        length: '',
        registrationNumber: '',
      });
      Alert.alert('Success', 'Vessel added successfully');
    } catch (error) {
      console.error('Error saving vessel:', error);
      Alert.alert('Error', 'Failed to save vessel');
    }
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

  React.useEffect(() => {
    loadVessels();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add New Vessel</Text>
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Vessel Name *"
              value={newVessel.name}
              onChangeText={(text) => setNewVessel({ ...newVessel, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Vessel Type *"
              value={newVessel.type}
              onChangeText={(text) => setNewVessel({ ...newVessel, type: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Length (meters) *"
              value={newVessel.length}
              onChangeText={(text) => setNewVessel({ ...newVessel, length: text })}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Registration Number (optional)"
              value={newVessel.registrationNumber}
              onChangeText={(text) =>
                setNewVessel({ ...newVessel, registrationNumber: text })
              }
            />
            <TouchableOpacity style={styles.button} onPress={saveVessel}>
              <Text style={styles.buttonText}>Add Vessel</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Vessels</Text>
          {vessels.map((vessel) => (
            <View key={vessel.id} style={styles.vesselCard}>
              <Text style={styles.vesselName}>{vessel.name}</Text>
              <Text style={styles.vesselDetails}>
                Type: {vessel.type}
                {'\n'}
                Length: {vessel.length}m
                {vessel.registrationNumber &&
                  `\nReg: ${vessel.registrationNumber}`}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  form: {
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  vesselCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  vesselName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  vesselDetails: {
    fontSize: 14,
    color: '#666',
  },
});

export default VesselScreen;