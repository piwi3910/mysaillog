import React, { useState, useEffect } from 'react';
import { View, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, Portal, Modal, IconButton, useTheme, MD3Theme } from 'react-native-paper';
import {
  PhotoMetadata,
  takePhoto,
  pickPhoto,
  deletePhotoMetadata,
  getPhotoMetadata,
  savePhotoMetadata,
} from '../utils/photo';

interface PhotoGalleryProps {
  type: 'equipment' | 'safety' | 'maintenance';
  relatedId: string;
  onPhotoAdded?: () => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ type, relatedId, onPhotoAdded }) => {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const [photos, setPhotos] = useState<PhotoMetadata[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMetadata | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, [type, relatedId]);

  const loadPhotos = async () => {
    try {
      const photoMetadata = await getPhotoMetadata(type, relatedId);
      setPhotos(photoMetadata);
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const uri = await takePhoto();
      const metadata: PhotoMetadata = {
        uri,
        timestamp: Date.now(),
        type,
        relatedId,
      };
      await savePhotoMetadata(metadata);
      await loadPhotos();
      onPhotoAdded?.();
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const handlePickPhoto = async () => {
    try {
      const uri = await pickPhoto();
      const metadata: PhotoMetadata = {
        uri,
        timestamp: Date.now(),
        type,
        relatedId,
      };
      await savePhotoMetadata(metadata);
      await loadPhotos();
      onPhotoAdded?.();
    } catch (error) {
      console.error('Error picking photo:', error);
    }
  };

  const handleDeletePhoto = async (photo: PhotoMetadata) => {
    try {
      await deletePhotoMetadata(photo);
      await loadPhotos();
      setSelectedPhoto(null);
      setShowPhotoModal(false);
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium">Photos</Text>
        <View style={styles.buttonContainer}>
          <Button
            mode="contained-tonal"
            onPress={handleTakePhoto}
            icon="camera"
            style={styles.button}
          >
            Take Photo
          </Button>
          <Button
            mode="contained-tonal"
            onPress={handlePickPhoto}
            icon="image"
            style={styles.button}
          >
            Pick Photo
          </Button>
        </View>
      </View>

      <ScrollView horizontal style={styles.photoList}>
        {photos.map((photo) => (
          <TouchableOpacity
            key={photo.uri}
            onPress={() => {
              setSelectedPhoto(photo);
              setShowPhotoModal(true);
            }}
          >
            <Image source={{ uri: photo.uri }} style={styles.thumbnail} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Portal>
        <Modal
          visible={showPhotoModal}
          onDismiss={() => {
            setSelectedPhoto(null);
            setShowPhotoModal(false);
          }}
          contentContainerStyle={styles.modalContent}
        >
          {selectedPhoto && (
            <View style={styles.modalContainer}>
              <Image source={{ uri: selectedPhoto.uri }} style={styles.fullImage} />
              <View style={styles.modalActions}>
                <Text variant="bodyMedium">
                  {new Date(selectedPhoto.timestamp).toLocaleString()}
                </Text>
                <IconButton
                  icon="delete"
                  mode="contained-tonal"
                  onPress={() => handleDeletePhoto(selectedPhoto)}
                />
              </View>
            </View>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      marginVertical: 8,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    buttonContainer: {
      flexDirection: 'row',
    },
    button: {
      marginLeft: 8,
    },
    photoList: {
      flexDirection: 'row',
    },
    thumbnail: {
      width: 80,
      height: 80,
      marginRight: 8,
      borderRadius: 4,
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      margin: 20,
      borderRadius: 8,
      overflow: 'hidden',
    },
    modalContainer: {
      width: '100%',
    },
    fullImage: {
      width: '100%',
      height: 300,
      resizeMode: 'contain',
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
    },
  });

export default PhotoGallery;