import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, useTheme, List, Button } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { VesselStackParamList } from '../types/navigation';

type VesselDetailsScreenNavigationProp = StackNavigationProp<VesselStackParamList, 'VesselDetails'>;
type VesselDetailsScreenRouteProp = RouteProp<VesselStackParamList, 'VesselDetails'>;

interface VesselDetailsScreenProps {
  navigation: VesselDetailsScreenNavigationProp;
  route: VesselDetailsScreenRouteProp;
}

export default function VesselDetailsScreen({ navigation, route }: VesselDetailsScreenProps) {
  const { vessel } = route.params;
  const theme = useTheme();

  return (
    <ScrollView style={styles.container}>
      {vessel.image && (
        <Image 
          source={{ uri: vessel.image }} 
          style={styles.image}
          resizeMode="cover"
        />
      )}

      <View style={styles.section}>
        <Text variant="headlineMedium">{vessel.name}</Text>
        <Text variant="bodyLarge">Registration: {vessel.registrationNumber}</Text>
      </View>

      <List.Section>
        <List.Subheader>Vessel Information</List.Subheader>
        {vessel.make && (
          <List.Item
            title="Make"
            description={vessel.make}
            left={props => <List.Icon {...props} icon="domain" />}
          />
        )}
        {vessel.model && (
          <List.Item
            title="Model"
            description={vessel.model}
            left={props => <List.Icon {...props} icon="information" />}
          />
        )}
      </List.Section>

      {(vessel.mmsi || vessel.callSign) && (
        <List.Section>
          <List.Subheader>AIS Information</List.Subheader>
          {vessel.mmsi && (
            <List.Item
              title="MMSI"
              description={vessel.mmsi}
              left={props => <List.Icon {...props} icon="radar" />}
            />
          )}
          {vessel.callSign && (
            <List.Item
              title="Call Sign"
              description={vessel.callSign}
              left={props => <List.Icon {...props} icon="radio" />}
            />
          )}
        </List.Section>
      )}

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('AddVessel', { vessel })}
          style={styles.button}
        >
          Edit Vessel
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 200,
  },
  section: {
    padding: 16,
  },
  buttonContainer: {
    padding: 16,
  },
  button: {
    marginVertical: 8,
  },
});