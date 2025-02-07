import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { FAB, List, useTheme, Portal, Modal, Button, Divider, Avatar } from 'react-native-paper';
import { CrewMember } from '../types/crew';
import { Ionicons } from '@expo/vector-icons';

// Temporary mock data
const mockCrew: CrewMember[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    phoneNumber: '+1234567890',
    role: 'Captain',
    email: 'john.smith@example.com',
  },
];

export default function CrewScreen({ navigation }: any) {
  const theme = useTheme();
  const [crew, setCrew] = useState<CrewMember[]>(mockCrew);
  const [visible, setVisible] = useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const renderCrewMember = ({ item }: { item: CrewMember }) => (
    <List.Item
      title={`${item.firstName} ${item.lastName}`}
      description={`${item.role || 'Crew Member'}\n${item.phoneNumber}`}
      left={props => 
        item.image ? (
          <Avatar.Image
            {...props}
            size={50}
            source={{ uri: item.image }}
          />
        ) : (
          <Avatar.Icon
            {...props}
            size={50}
            icon={({ size, color }) => (
              <Ionicons name="person" size={size * 0.6} color={color} />
            )}
          />
        )
      }
      right={props => (
        <List.Icon
          {...props}
          icon={({ size, color }) => (
            <Ionicons name="chevron-forward" size={size} color={color} />
          )}
        />
      )}
      onPress={() => navigation.navigate('CrewMemberDetails', { crewMember: item })}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={crew}
        renderItem={renderCrewMember}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <Divider />}
      />
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={showModal}
        color={theme.colors.onPrimary}
      />
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Button
            mode="contained"
            onPress={() => {
              hideModal();
              navigation.navigate('AddCrewMember');
            }}
            style={styles.button}
          >
            Add New Crew Member
          </Button>
          <Button
            mode="outlined"
            onPress={hideModal}
            style={styles.button}
          >
            Cancel
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modal: {
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  button: {
    marginVertical: 8,
  },
});