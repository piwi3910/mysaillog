import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Trip, Vessel } from '../types';
import { shareTripAsText, exportTripData } from '../utils/sharing';

interface ShareTripModalProps {
  visible: boolean;
  onClose: () => void;
  trip: Trip;
  vessel: Vessel;
}

export const ShareTripModal: React.FC<ShareTripModalProps> = ({
  visible,
  onClose,
  trip,
  vessel,
}) => {
  const handleShare = async (type: 'text' | 'data') => {
    try {
      if (type === 'text') {
        await shareTripAsText(trip, vessel);
      } else {
        await exportTripData(trip, vessel);
      }
      onClose();
    } catch (error) {
      console.error('Error sharing trip:', error);
      Alert.alert('Error', 'Failed to share trip');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Share Trip</Text>
          
          <Text style={styles.tripInfo}>
            {new Date(trip.startTime).toLocaleDateString()}{'\n'}
            {vessel.name} - {vessel.type}
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.shareButton]}
              onPress={() => handleShare('text')}
            >
              <Text style={styles.buttonText}>Share as Report</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.exportButton]}
              onPress={() => handleShare('data')}
            >
              <Text style={styles.buttonText}>Export Data</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  tripInfo: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: '#007AFF',
  },
  exportButton: {
    backgroundColor: '#34C759',
  },
  cancelButton: {
    backgroundColor: '#8E8E93',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ShareTripModal;