import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, IconButton, useTheme, Portal, Modal, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface EditableProfilePictureProps {
  image?: string;
  size?: number;
  onImageChange: (uri: string) => void;
}

export default function EditableProfilePicture({ 
  image, 
  size = 150,
  onImageChange 
}: EditableProfilePictureProps) {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return cameraStatus === 'granted' && libraryStatus === 'granted';
  };

  const takePhoto = async () => {
    if (await requestPermissions()) {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        onImageChange(result.assets[0].uri);
      }
    }
    setModalVisible(false);
  };

  const pickImage = async () => {
    if (await requestPermissions()) {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        onImageChange(result.assets[0].uri);
      }
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {image ? (
        <Avatar.Image
          size={size}
          source={{ uri: image }}
        />
      ) : (
        <Avatar.Icon
          size={size}
          icon={({ size: iconSize }) => (
            <Ionicons name="person" size={iconSize * 0.6} color={theme.colors.onSurface} />
          )}
        />
      )}
      
      <IconButton
        icon="camera"
        mode="contained-tonal"
        size={24}
        style={[
          styles.editButton,
          { backgroundColor: theme.colors.primaryContainer }
        ]}
        iconColor={theme.colors.onPrimaryContainer}
        onPress={() => setModalVisible(true)}
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.surface }
          ]}
        >
          <Button
            mode="contained"
            onPress={takePhoto}
            style={styles.modalButton}
            icon="camera"
          >
            Take Photo
          </Button>
          <Button
            mode="contained"
            onPress={pickImage}
            style={styles.modalButton}
            icon="image"
          >
            Choose from Gallery
          </Button>
          <Button
            mode="outlined"
            onPress={() => setModalVisible(false)}
            style={styles.modalButton}
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
    position: 'relative',
    alignSelf: 'center',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    margin: 0,
  },
  modal: {
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalButton: {
    marginVertical: 8,
  },
});