import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { FAB, List, useTheme, Portal, Modal, Button, Divider } from 'react-native-paper';
import { Vessel } from '../types/vessel';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

type VesselStackParamList = {
  VesselsList: undefined;
  VesselDetails: { vessel: Vessel };
  AddVessel: undefined;
};

type VesselsScreenNavigationProp = StackNavigationProp<VesselStackParamList, 'VesselsList'>;

interface VesselsScreenProps {
  navigation: VesselsScreenNavigationProp;
}

// Temporary mock data
const mockVessels: Vessel[] = [
  {
    id: '1',
    name: 'Sea Spirit',
    registrationNumber: 'REG123',
    make: 'Beneteau',
    model: 'Oceanis 45',
  },
];

export default function VesselsScreen({ navigation }: VesselsScreenProps) {
  const theme = useTheme();
  const [vessels, setVessels] = useState<Vessel[]>(mockVessels);
  const [visible, setVisible] = useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const renderVessel = ({ item }: { item: Vessel }) => (
    <List.Item
      title={item.name}
      description={`${item.make || ''} ${item.model || ''}\nReg: ${item.registrationNumber}`}
      left={props => (
        <List.Icon
          {...props}
          icon={({ size, color }) => (
            <Ionicons name="boat-outline" size={size} color={color} />
          )}
        />
      )}
      right={props => (
        <List.Icon
          {...props}
          icon={({ size, color }) => (
            <Ionicons name="chevron-forward" size={size} color={color} />
          )}
        />
      )}
      onPress={() => navigation.navigate('VesselDetails', { vessel: item })}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={vessels}
        renderItem={renderVessel}
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
              navigation.navigate('AddVessel');
            }}
            style={styles.button}
          >
            Add New Vessel
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