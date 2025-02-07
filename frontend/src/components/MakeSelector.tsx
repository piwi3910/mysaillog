import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Portal, Modal, useTheme } from 'react-native-paper';
import { vesselMakes } from '../data/vesselMakes';
import AlphabeticalList from './AlphabeticalList';

interface MakeSelectorProps {
  value: string;
  onSelect: (make: string) => void;
}

export default function MakeSelector({ value, onSelect }: MakeSelectorProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  const openModal = () => setVisible(true);
  const closeModal = () => setVisible(false);

  const handleSelect = (make: string) => {
    onSelect(make);
    closeModal();
  };

  return (
    <View style={styles.container}>
      <Button
        mode="outlined"
        onPress={openModal}
        style={styles.button}
      >
        {value || 'Select Make'}
      </Button>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={closeModal}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.surface }
          ]}
        >
          <View style={styles.listContainer}>
            <AlphabeticalList
              data={vesselMakes}
              getLabel={(item) => item}
              onSelect={handleSelect}
              selectedValue={value}
            />
          </View>
          <Button
            mode="outlined"
            onPress={closeModal}
            style={styles.cancelButton}
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
    marginBottom: 16,
  },
  button: {
    width: '100%',
  },
  modal: {
    margin: 20,
    borderRadius: 8,
    padding: 0,
    height: '80%',
  },
  listContainer: {
    flex: 1,
  },
  cancelButton: {
    margin: 16,
  },
});