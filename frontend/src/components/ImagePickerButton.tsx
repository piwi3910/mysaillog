import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Portal, Modal, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

interface ImagePickerButtonProps {
  onImageSelected: (uri: string) => void;
  existingImage?: string;
}

export default function ImagePickerButton({ onImageSelected, existingImage }: ImagePickerButtonProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

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
        onImageSelected(result.assets[0].uri);
      }
    }
    hideModal();
  };

  const pickImage = async () => {
    if (await requestPermissions()) {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        onImageSelected(result.assets[0].uri);
      }
    }
    hideModal();
  };

  return (
    <View style={styles.container}>
      {existingImage && (
        <Image source={{ uri: existingImage }} style={styles.preview} />
      )}
      <Button mode="outlined" onPress={showModal}>
        {existingImage ? 'Change Image' : 'Add Image'}
      </Button>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.surface }
          ]}
        >
          <Button
            mode="contained"
            onPress={takePhoto}
            style={styles.button}
            icon="camera"
          >
            Take Photo
          </Button>
          <Button
            mode="contained"
            onPress={pickImage}
            style={styles.button}
            icon="image"
          >
            Choose from Gallery
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
    alignItems: 'center',
    marginVertical: 16,
  },
  preview: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 16,
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