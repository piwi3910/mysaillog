import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, useTheme } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { VesselStackParamList } from '../types/navigation';
import { Vessel } from '../types/vessel';
import ImagePickerButton from '../components/ImagePickerButton';
import MakeSelector from '../components/MakeSelector';

type AddVesselScreenNavigationProp = StackNavigationProp<VesselStackParamList, 'AddVessel'>;
type AddVesselScreenRouteProp = RouteProp<VesselStackParamList, 'AddVessel'>;

interface AddVesselScreenProps {
  navigation: AddVesselScreenNavigationProp;
  route: AddVesselScreenRouteProp;
}

export default function AddVesselScreen({ navigation, route }: AddVesselScreenProps) {
  const theme = useTheme();
  const editingVessel = route.params?.vessel;
  const [name, setName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [mmsi, setMMSI] = useState('');
  const [callSign, setCallSign] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (editingVessel) {
      setName(editingVessel.name);
      setRegistrationNumber(editingVessel.registrationNumber);
      setMake(editingVessel.make || '');
      setModel(editingVessel.model || '');
      setMMSI(editingVessel.mmsi || '');
      setCallSign(editingVessel.callSign || '');
      setImage(editingVessel.image);
    }
  }, [editingVessel]);

  const handleSubmit = () => {
    // TODO: Add proper validation and API call
    const vesselData: Vessel = {
      id: editingVessel?.id || Date.now().toString(), // Temporary ID generation
      name,
      registrationNumber,
      make,
      model,
      mmsi,
      callSign,
      image,
    };

    // TODO: Add/Update vessel in the database
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <ImagePickerButton
        onImageSelected={setImage}
        existingImage={image}
      />

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
      <MakeSelector
        value={make}
        onSelect={setMake}
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
          {editingVessel ? 'Update Vessel' : 'Add Vessel'}
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