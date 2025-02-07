import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, Surface, Text, useTheme, MD3Theme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vessel } from '../types';
import ProfilePicture from '../components/ProfilePicture';

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
  const [newVessel, setNewVessel] = useState<Omit<Vessel, 'id'>>({
    ...defaultVessel,
    profilePicture: undefined,
  });
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const styles = React.useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    loadVessels();
  }, []);

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

  const handleSave = async () => {
    try {
      const vessel: Vessel = {
        ...newVessel,
        id: Date.now().toString(),
      };

      const updatedVessels = [...vessels, vessel];
      await AsyncStorage.setItem('vessels', JSON.stringify(updatedVessels));
      setVessels(updatedVessels);
      setNewVessel({ ...defaultVessel, profilePicture: undefined });
    } catch (error) {
      console.error('Error saving vessel:', error);
    }
  };

  const handleUpdate = async (updatedVessel: Vessel) => {
    try {
      const updatedVessels = vessels.map(v => 
        v.id === updatedVessel.id ? updatedVessel : v
      );
      await AsyncStorage.setItem('vessels', JSON.stringify(updatedVessels));
      setVessels(updatedVessels);
      setSelectedVessel(null);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating vessel:', error);
    }
  };

  const handleDelete = async (vesselId: string) => {
    try {
      const updatedVessels = vessels.filter(v => v.id !== vesselId);
      await AsyncStorage.setItem('vessels', JSON.stringify(updatedVessels));
      setVessels(updatedVessels);
      setSelectedVessel(null);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error deleting vessel:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.section} elevation={1}>
        <Text variant="titleLarge" style={styles.title}>Add New Vessel</Text>
        
        <View style={styles.profilePictureContainer}>
          <ProfilePicture
            uri={newVessel.profilePicture}
            size={120}
            onPictureSelected={(uri) => setNewVessel({ ...newVessel, profilePicture: uri })}
            onPictureRemoved={() => setNewVessel({ ...newVessel, profilePicture: undefined })}
          />
        </View>

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
            <View style={styles.vesselCardContent}>
              <ProfilePicture
                uri={vessel.profilePicture}
                size={80}
                editable={false}
              />
              <View style={styles.vesselInfo}>
                <Text variant="titleMedium">{vessel.name}</Text>
                <Text variant="bodyMedium">{vessel.type}</Text>
                <Text variant="bodySmall">
                  Registration: {vessel.registrationNumber}
                </Text>
                <Text variant="bodySmall">
                  Home Port: {vessel.homePort}
                </Text>
              </View>
            </View>
            <View style={styles.cardActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setSelectedVessel(vessel);
                  setShowEditModal(true);
                }}
              >
                Edit
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleDelete(vessel.id)}
                textColor={theme.colors.error}
              >
                Delete
              </Button>
            </View>
          </Surface>
        ))}
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    section: {
      padding: 16,
      marginBottom: 24,
      borderRadius: 8,
    },
    title: {
      marginBottom: 16,
      textAlign: 'center',
    },
    profilePictureContainer: {
      alignItems: 'center',
      marginBottom: 16,
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
    vesselCardContent: {
      flexDirection: 'row',
      marginBottom: 12,
    },
    vesselInfo: {
      flex: 1,
      marginLeft: 16,
    },
    cardActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
    },
  });

export default VesselScreen;
