import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Surface, Text, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vessel } from '../types';

const defaultVessel: Omit<Vessel, 'id'> = {
  name: '',
  type: '',
  length: 0,
  registrationNumber: '',
  homePort: '',
  equipment: [],
};

export const VesselScreen: React.FC = () => {
  const theme = useTheme();
  const [newVessel, setNewVessel] = useState<Omit<Vessel, 'id'>>(defaultVessel);
  const [vessels, setVessels] = useState<Vessel[]>([]);

  const handleSave = async () => {
    try {
      const vessel: Vessel = {
        ...newVessel,
        id: Date.now().toString(),
      };

      const updatedVessels = [...vessels, vessel];
      await AsyncStorage.setItem('vessels', JSON.stringify(updatedVessels));
      setVessels(updatedVessels);
      setNewVessel(defaultVessel);
    } catch (error) {
      console.error('Error saving vessel:', error);
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
    <View style={styles.container}>
      <Surface style={styles.form} elevation={1}>
        <Text variant="titleLarge" style={styles.title}>Add New Vessel</Text>
        
        <TextInput
          label="Vessel Name"
          value={newVessel.name}
          onChangeText={(text) => setNewVessel({ ...newVessel, name: text })}
          style={styles.input}
          mode="outlined"
        />

        <TextInput
          label="Vessel Type"
          value={newVessel.type}
          onChangeText={(text) => setNewVessel({ ...newVessel, type: text })}
          style={styles.input}
          mode="outlined"
        />

        <TextInput
          label="Length (feet)"
          value={newVessel.length.toString()}
          onChangeText={(text) => setNewVessel({ ...newVessel, length: parseFloat(text) || 0 })}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
        />

        <TextInput
          label="Registration Number"
          value={newVessel.registrationNumber}
          onChangeText={(text) => setNewVessel({ ...newVessel, registrationNumber: text })}
          style={styles.input}
          mode="outlined"
        />

        <TextInput
          label="Home Port"
          value={newVessel.homePort}
          onChangeText={(text) => setNewVessel({ ...newVessel, homePort: text })}
          style={styles.input}
          mode="outlined"
        />

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.button}
        >
          Save Vessel
        </Button>
      </Surface>

      <View style={styles.vesselList}>
        <Text variant="titleLarge" style={styles.title}>My Vessels</Text>
        {vessels.map((vessel) => (
          <Surface key={vessel.id} style={styles.vesselCard} elevation={1}>
            <Text variant="titleMedium">{vessel.name}</Text>
            <Text variant="bodyMedium">{vessel.type}</Text>
            <Text variant="bodySmall">
              Registration: {vessel.registrationNumber}
            </Text>
            <Text variant="bodySmall">
              Home Port: {vessel.homePort}
            </Text>
          </Surface>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  form: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  vesselList: {
    flex: 1,
  },
  vesselCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
});

export default VesselScreen;
