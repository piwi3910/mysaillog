import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, useTheme } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { CrewMember } from '../types/crew';

type CrewStackParamList = {
  CrewList: undefined;
  CrewMemberDetails: { crewMember: CrewMember };
  AddCrewMember: undefined;
};

type AddCrewMemberScreenNavigationProp = StackNavigationProp<CrewStackParamList, 'AddCrewMember'>;

interface AddCrewMemberScreenProps {
  navigation: AddCrewMemberScreenNavigationProp;
}

export default function AddCrewMemberScreen({ navigation }: AddCrewMemberScreenProps) {
  const theme = useTheme();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('');

  const handleSubmit = () => {
    // TODO: Add proper validation and API call
    const newCrewMember: CrewMember = {
      id: Date.now().toString(), // Temporary ID generation
      firstName,
      lastName,
      phoneNumber,
      email,
      role,
      emergencyContact: {
        name: emergencyContactName,
        phoneNumber: emergencyContactPhone,
        relationship: emergencyContactRelation,
      },
    };

    // TODO: Add crew member to the database
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
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
      <TextInput
        label="Role"
        value={role}
        onChangeText={setRole}
        mode="outlined"
        style={styles.input}
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
          Add Crew Member
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