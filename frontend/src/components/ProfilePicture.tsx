import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { takePhoto, pickPhoto } from '../utils/photo';

interface ProfilePictureProps {
  uri?: string;
  size?: number;
  onPictureSelected?: (uri: string) => void;
  onPictureRemoved?: () => void;
  editable?: boolean;
}

export const ProfilePicture: React.FC<ProfilePictureProps> = ({
  uri,
  size = 100,
  onPictureSelected,
  onPictureRemoved,
  editable = true,
}) => {
  const theme = useTheme();

  const handleTakePhoto = async () => {
    try {
      const photoUri = await takePhoto();
      onPictureSelected?.(photoUri);
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const handlePickPhoto = async () => {
    try {
      const photoUri = await pickPhoto();
      onPictureSelected?.(photoUri);
    } catch (error) {
      console.error('Error picking photo:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: theme.colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    image: {
      width: size,
      height: size,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      opacity: 0,
    },
    overlayVisible: {
      opacity: 1,
    },
    editButtons: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 16,
      padding: 4,
    },
  });

  return (
    <View style={styles.container}>
      {uri ? (
        <TouchableOpacity
          onPress={editable ? handlePickPhoto : undefined}
          activeOpacity={editable ? 0.7 : 1}
        >
          <Image source={{ uri }} style={styles.image} />
          {editable && (
            <View style={styles.editButtons}>
              <IconButton
                icon="camera"
                size={16}
                iconColor="white"
                onPress={handleTakePhoto}
              />
              <IconButton
                icon="image"
                size={16}
                iconColor="white"
                onPress={handlePickPhoto}
              />
              {onPictureRemoved && (
                <IconButton
                  icon="delete"
                  size={16}
                  iconColor="white"
                  onPress={onPictureRemoved}
                />
              )}
            </View>
          )}
        </TouchableOpacity>
      ) : (
        editable && (
          <View>
            <IconButton
              icon="camera"
              size={24}
              onPress={handleTakePhoto}
            />
            <IconButton
              icon="image"
              size={24}
              onPress={handlePickPhoto}
            />
          </View>
        )
      )}
    </View>
  );
};

export default ProfilePicture;