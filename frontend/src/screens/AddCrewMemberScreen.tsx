import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, useTheme } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { CrewStackParamList } from '../types/navigation';
import { CrewMember } from '../types/crew';
import ImagePickerButton from '../components/ImagePickerButton';
import RoleSelector from '../components/RoleSelector';

type AddCrewMemberScreenNavigationProp = StackNavigationProp<CrewStackParamList, 'AddCrewMember'>;
type AddCrewMemberScreenRouteProp = RouteProp<CrewStackParamList, 'AddCrewMember'>;

interface AddCrewMemberScreenProps {
  navigation: AddCrewMemberScreenNavigationProp;
  route: AddCrewMemberScreenRouteProp;
}

export default function AddCrewMemberScreen({ navigation, route }: AddCrewMemberScreenProps) {
  const theme = useTheme();
  const editingCrewMember = route.params?.crewMember;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('');

  useEffect(() => {
    if (editingCrewMember) {
      setFirstName(editingCrewMember.firstName);
      setLastName(editingCrewMember.lastName);
      setPhoneNumber(editingCrewMember.phoneNumber);
      setEmail(editingCrewMember.email || '');
      setRole(editingCrewMember.role || '');
      setImage(editingCrewMember.image);
      if (editingCrewMember.emergencyContact) {
        setEmergencyContactName(editingCrewMember.emergencyContact.name);
        setEmergencyContactPhone(editingCrewMember.emergencyContact.phoneNumber);
        setEmergencyContactRelation(editingCrewMember.emergencyContact.relationship);
      }
    }
  }, [editingCrewMember]);

  const handleSubmit = () => {
    // TODO: Add proper validation and API call
    const crewMemberData: CrewMember = {
      id: editingCrewMember?.id || Date.now().toString(), // Temporary ID generation
      firstName,
      lastName,
      phoneNumber,
      email,
      role,
      image,
      emergencyContact: {
        name: emergencyContactName,
        phoneNumber: emergencyContactPhone,
        relationship: emergencyContactRelation,
      },
    };

    // TODO: Add/Update crew member in the database
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <ImagePickerButton
        onImageSelected={setImage}
        existingImage={image}
      />

      <TextInput
        label="First Name"
        value={firstName}
        onChangeText={setFirstName}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Last Name"
        value={lastName}
        onChangeText={setLastName}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        mode="outlined"
        style={styles.input}
        keyboardType="phone-pad"
      />
      <TextInput
        label="Email (Optional)"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <RoleSelector
        value={role}
        onSelect={setRole}
      />
      
      <View style={styles.section}>
        <TextInput
          label="Emergency Contact Name"
          value={emergencyContactName}
          onChangeText={setEmergencyContactName}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Emergency Contact Phone"
          value={emergencyContactPhone}
          onChangeText={setEmergencyContactPhone}
          mode="outlined"
          style={styles.input}
          keyboardType="phone-pad"
        />
        <TextInput
          label="Emergency Contact Relationship"
          value={emergencyContactRelation}
          onChangeText={setEmergencyContactRelation}
          mode="outlined"
          style={styles.input}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
          disabled={!firstName || !lastName || !phoneNumber}
        >
          {editingCrewMember ? 'Update Crew Member' : 'Add Crew Member'}
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
  section: {
    marginTop: 8,
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    marginVertical: 8,
  },
});