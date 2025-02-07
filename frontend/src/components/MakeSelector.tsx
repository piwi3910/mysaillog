import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Portal, Modal, useTheme, Button } from 'react-native-paper';
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
      <TextInput
        label="Make"
        value={value}
        mode="outlined"
        onPressIn={openModal}
        showSoftInputOnFocus={false}
        right={<TextInput.Icon icon="chevron-down" />}
      />

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
            mode="text"
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
    margin: 8,
  },
});