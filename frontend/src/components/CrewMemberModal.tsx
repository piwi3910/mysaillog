import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Surface, Text, TextInput, Button } from 'react-native-paper';
import { CrewMember } from '../types';
import ProfilePicture from './ProfilePicture';

interface CrewMemberModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSave: (member: Omit<CrewMember, 'id'>) => void;
  initialMember?: CrewMember;
}

export const CrewMemberModal: React.FC<CrewMemberModalProps> = ({
  visible,
  onDismiss,
  onSave,
  initialMember,
}) => {
  const [member, setMember] = useState<Omit<CrewMember, 'id'>>({
    name: initialMember?.name || '',
    role: initialMember?.role || '',
    profilePicture: initialMember?.profilePicture,
  });

  const handleSave = () => {
    if (member.name && member.role) {
      onSave(member);
      setMember({ name: '', role: '', profilePicture: undefined });
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContent}
      >
        <Surface style={styles.modalSurface}>
          <Text variant="titleLarge" style={styles.modalTitle}>
            {initialMember ? 'Edit Crew Member' : 'Add Crew Member'}
          </Text>

          <View style={styles.profilePictureContainer}>
            <ProfilePicture
              uri={member.profilePicture}
              size={120}
              onPictureSelected={(uri) => setMember({ ...member, profilePicture: uri })}
              onPictureRemoved={() => setMember({ ...member, profilePicture: undefined })}
            />
          </View>

          <TextInput
            label="Name"
            value={member.name}
            onChangeText={(text) => setMember({ ...member, name: text })}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Role"
            value={member.role}
            onChangeText={(text) => setMember({ ...member, role: text })}
            style={styles.input}
            mode="outlined"
          />

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={styles.button}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.button}
              disabled={!member.name || !member.role}
            >
              Save
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    padding: 20,
  },
  modalSurface: {
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  button: {
    minWidth: 100,
  },
});

export default CrewMemberModal;