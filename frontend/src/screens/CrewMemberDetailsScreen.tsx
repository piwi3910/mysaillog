import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, List, Button } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { CrewStackParamList } from '../types/navigation';
import EditableProfilePicture from '../components/EditableProfilePicture';
import PhoneNumberWithWhatsApp from '../components/PhoneNumberWithWhatsApp';
import { CrewMember } from '../types/crew';

type CrewMemberDetailsScreenNavigationProp = StackNavigationProp<CrewStackParamList, 'CrewMemberDetails'>;
type CrewMemberDetailsScreenRouteProp = RouteProp<CrewStackParamList, 'CrewMemberDetails'>;

interface CrewMemberDetailsScreenProps {
  navigation: CrewMemberDetailsScreenNavigationProp;
  route: CrewMemberDetailsScreenRouteProp;
}

export default function CrewMemberDetailsScreen({ navigation, route }: CrewMemberDetailsScreenProps) {
  const { crewMember } = route.params;
  const theme = useTheme();

  const handleImageChange = (uri: string) => {
    // TODO: Update crew member image in database
    const updatedCrewMember: CrewMember = {
      ...crewMember,
      image: uri
    };
    
    // Update the route params to reflect the change
    navigation.setParams({
      crewMember: updatedCrewMember
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <EditableProfilePicture
          image={crewMember.image}
          size={150}
          onImageChange={handleImageChange}
        />
        <Text variant="headlineMedium" style={styles.name}>
          {crewMember.firstName} {crewMember.lastName}
        </Text>
        <Text variant="titleMedium" style={styles.role}>
          {crewMember.role || 'Crew Member'}
        </Text>
      </View>

      <List.Section>
        <List.Subheader>Contact Information</List.Subheader>
        <PhoneNumberWithWhatsApp phoneNumber={crewMember.phoneNumber} />
        {crewMember.email && (
          <List.Item
            title="Email"
            description={crewMember.email}
            left={props => <List.Icon {...props} icon="email" />}
          />
        )}
      </List.Section>

      {crewMember.emergencyContact && (
        <List.Section>
          <List.Subheader>Emergency Contact</List.Subheader>
          <List.Item
            title={crewMember.emergencyContact.name}
            description={`${crewMember.emergencyContact.relationship}\n${crewMember.emergencyContact.phoneNumber}`}
            left={props => <List.Icon {...props} icon="account-alert" />}
          />
        </List.Section>
      )}

      {crewMember.qualifications && crewMember.qualifications.length > 0 && (
        <List.Section>
          <List.Subheader>Qualifications</List.Subheader>
          {crewMember.qualifications.map((qual, index) => (
            <List.Item
              key={index}
              title={qual.name}
              description={`Issued: ${qual.issueDate}${qual.expiryDate ? `\nExpires: ${qual.expiryDate}` : ''}\nBy: ${qual.issuingAuthority}`}
              left={props => <List.Icon {...props} icon="certificate" />}
            />
          ))}
        </List.Section>
      )}

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('AddCrewMember', { crewMember })}
          style={styles.button}
        >
          Edit Crew Member
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  name: {
    marginTop: 16,
    textAlign: 'center',
  },
  role: {
    marginTop: 8,
    opacity: 0.7,
  },
  buttonContainer: {
    padding: 16,
  },
  button: {
    marginVertical: 8,
  },
});