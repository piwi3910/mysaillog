import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, IconButton, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import ImagePickerButton from './ImagePickerButton';

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
  const [pickerVisible, setPickerVisible] = useState(false);

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
        onPress={() => setPickerVisible(true)}
      />

      {pickerVisible && (
        <View style={StyleSheet.absoluteFill}>
          <ImagePickerButton
            onImageSelected={(uri) => {
              onImageChange(uri);
              setPickerVisible(false);
            }}
            existingImage={image}
          />
        </View>
      )}
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
});