import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const PHOTO_DIR = `${FileSystem.documentDirectory}photos/`;

export interface PhotoMetadata {
  uri: string;
  timestamp: number;
  type: 'equipment' | 'safety' | 'maintenance';
  relatedId: string;
  notes?: string;
}

export const ensurePhotoDirectoryExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(PHOTO_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PHOTO_DIR, { intermediates: true });
  }
};

export const requestPermissions = async () => {
  if (Platform.OS !== 'web') {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access media library was denied');
    }
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus !== 'granted') {
      throw new Error('Permission to access camera was denied');
    }
  }
};

export const takePhoto = async (): Promise<string> => {
  await requestPermissions();
  
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled && result.assets[0]) {
    const photoUri = result.assets[0].uri;
    return await savePhoto(photoUri);
  }
  throw new Error('No photo taken');
};

export const pickPhoto = async (): Promise<string> => {
  await requestPermissions();

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled && result.assets[0]) {
    const photoUri = result.assets[0].uri;
    return await savePhoto(photoUri);
  }
  throw new Error('No photo selected');
};

const savePhoto = async (uri: string): Promise<string> => {
  await ensurePhotoDirectoryExists();
  
  const filename = `${Date.now()}.jpg`;
  const destination = `${PHOTO_DIR}${filename}`;
  
  await FileSystem.copyAsync({
    from: uri,
    to: destination,
  });
  
  return destination;
};

export const deletePhoto = async (uri: string): Promise<void> => {
  try {
    await FileSystem.deleteAsync(uri);
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
};

export const getPhotoMetadata = async (type: 'equipment' | 'safety' | 'maintenance', relatedId: string): Promise<PhotoMetadata[]> => {
  const key = `photos_${type}_${relatedId}`;
  const metadataStr = await FileSystem.readAsStringAsync(
    `${PHOTO_DIR}${key}.json`,
    { encoding: FileSystem.EncodingType.UTF8 }
  ).catch(() => '[]');
  
  return JSON.parse(metadataStr);
};

export const savePhotoMetadata = async (metadata: PhotoMetadata): Promise<void> => {
  await ensurePhotoDirectoryExists();
  
  const key = `photos_${metadata.type}_${metadata.relatedId}`;
  const existingMetadata = await getPhotoMetadata(metadata.type, metadata.relatedId);
  
  const updatedMetadata = [...existingMetadata, metadata];
  
  await FileSystem.writeAsStringAsync(
    `${PHOTO_DIR}${key}.json`,
    JSON.stringify(updatedMetadata),
    { encoding: FileSystem.EncodingType.UTF8 }
  );
};

export const deletePhotoMetadata = async (metadata: PhotoMetadata): Promise<void> => {
  const key = `photos_${metadata.type}_${metadata.relatedId}`;
  const existingMetadata = await getPhotoMetadata(metadata.type, metadata.relatedId);
  
  const updatedMetadata = existingMetadata.filter(m => m.uri !== metadata.uri);
  
  await FileSystem.writeAsStringAsync(
    `${PHOTO_DIR}${key}.json`,
    JSON.stringify(updatedMetadata),
    { encoding: FileSystem.EncodingType.UTF8 }
  );
  
  await deletePhoto(metadata.uri);
};