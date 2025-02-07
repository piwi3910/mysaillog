import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, useTheme } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { Vessel } from '../types/vessel';

type VesselStackParamList = {
  VesselsList: undefined;
  VesselDetails: { vessel: Vessel };
  AddVessel: undefined;
};

type AddVesselScreenNavigationProp = StackNavigationProp<VesselStackParamList, 'AddVessel'>;

interface AddVesselScreenProps {
  navigation: AddVesselScreenNavigationProp;
}

export default function AddVesselScreen({ navigation }: AddVesselScreenProps) {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [mmsi, setMMSI] = useState('');
  const [callSign, setCallSign] = useState('');

  const handleSubmit = () => {
    // TODO: Add proper validation and API call
    const newVessel: Vessel = {
      id: Date.now().toString(), // Temporary ID generation
      name,
      registrationNumber,
      make,
      model,
      mmsi,
      callSign,
    };

    // TODO: Add vessel to the database
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        label="Vessel Name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Registration Number"
        value={registrationNumber}
        onChangeText={setRegistrationNumber}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Make"
        value={make}
        onChangeText={setMake}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Model"
        value={model}
        onChangeText={setModel}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="MMSI (Optional)"
        value={mmsi}
        onChangeText={setMMSI}
        mode="outlined"
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        label="Call Sign (Optional)"
        value={callSign}
        onChangeText={setCallSign}
        mode="outlined"
        style={styles.input}
      />
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
          disabled={!name || !registrationNumber}
        >
          Add Vessel
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Cancel
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    marginVertical: 8,
  },
});