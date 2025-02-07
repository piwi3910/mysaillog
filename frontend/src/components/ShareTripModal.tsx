import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Text, Button, Surface, useTheme } from 'react-native-paper';
import { Trip, Vessel } from '../types';
import { shareTrip } from '../utils/sharing';

type ShareTripModalProps = {
  visible: boolean;
  onClose: () => void;
  trip: Trip;
  vessel: Vessel;
};

export const ShareTripModal: React.FC<ShareTripModalProps> = ({
  visible,
  onClose,
  trip,
  vessel,
}) => {
  const theme = useTheme();

  const handleShare = async () => {
    try {
      await shareTrip(trip, vessel);
      onClose();
    } catch (error) {
      console.error('Error sharing trip:', error);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.surface} elevation={2}>
          <Text variant="titleLarge" style={styles.title}>Share Trip</Text>
          
          <View style={styles.tripInfo}>
            <Text variant="bodyLarge">Vessel: {vessel.name}</Text>
            <Text variant="bodyMedium">Duration: {trip.duration} minutes</Text>
            <Text variant="bodyMedium">Distance: {trip.distance.toFixed(2)} nm</Text>
            {trip.weather && (
              <Text variant="bodyMedium">
                Weather: {trip.weather.notes}
              </Text>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={onClose}
              style={styles.button}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleShare}
              style={styles.button}
            >
              Share
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
  },
  surface: {
    padding: 20,
    borderRadius: 8,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  tripInfo: {
    marginBottom: 24,
    gap: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    minWidth: 120,
  },
});
