import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

// Keys for AsyncStorage
const PHOTOS_KEY_PREFIX = 'photos_';
const MAIN_IMAGES_KEY_PREFIX = 'main_image_';

const photoService = {
  // Upload photo for any entity (event, activity)
  uploadPhoto: async (entityType, entityId, photoData) => {
    try {
      console.log(`Uploading photo for ${entityType}:${entityId}`);

      // 1. First process/compress the image
      const processedImage = await manipulateAsync(
        photoData.uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: SaveFormat.JPEG }
      );

      // 2. Convert image to base64
      const base64Image = await FileSystem.readAsStringAsync(processedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 3. Create photo object
      const photo = {
        _id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        entityType,
        entityId,
        imageData: `data:image/jpeg;base64,${base64Image}`,
        fileName: `${entityType.toLowerCase()}_photo_${Date.now()}.jpg`,
        uploadDate: new Date().toISOString(),
        isMainImage: false
      };

      // 4. Get existing photos for this entity
      const existingPhotosKey = `${PHOTOS_KEY_PREFIX}${entityType}_${entityId}`;
      const existingPhotosJson = await AsyncStorage.getItem(existingPhotosKey);
      const existingPhotos = existingPhotosJson ? JSON.parse(existingPhotosJson) : [];

      // 5. Add new photo
      const updatedPhotos = [...existingPhotos, photo];

      // 6. Save back to AsyncStorage
      await AsyncStorage.setItem(existingPhotosKey, JSON.stringify(updatedPhotos));

      console.log(`Photo uploaded with ID: ${photo._id}`);
      return photo;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  },
  
  // Get all photos for an entity
  getEntityPhotos: async (entityType, entityId) => {
    try {
      const key = `${PHOTOS_KEY_PREFIX}${entityType}_${entityId}`;
      const photosJson = await AsyncStorage.getItem(key);
      return photosJson ? JSON.parse(photosJson) : [];
    } catch (error) {
      console.error(`Error getting photos for ${entityType}:${entityId}:`, error);
      return [];
    }
  },
  
  // Delete a photo
  deletePhoto: async (photoId, entityType, entityId) => {
    try {
      const key = `${PHOTOS_KEY_PREFIX}${entityType}_${entityId}`;
      const photosJson = await AsyncStorage.getItem(key);
      const photos = photosJson ? JSON.parse(photosJson) : [];
      
      const updatedPhotos = photos.filter(photo => photo._id !== photoId);
      await AsyncStorage.setItem(key, JSON.stringify(updatedPhotos));
      
      return { success: true };
    } catch (error) {
      console.error(`Error deleting photo ${photoId}:`, error);
      throw error;
    }
  },
  
  // Set main image for entity
  setMainImage: async (entityType, entityId, photoData) => {
    try {
      console.log(`Setting main image for ${entityType}:${entityId}`);
      
      // 1. Process the image
      const processedImage = await manipulateAsync(
        photoData.uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: SaveFormat.JPEG }
      );

      // 2. Convert to base64
      const base64Image = await FileSystem.readAsStringAsync(processedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 3. Create the main image object
      const mainImage = {
        entityType,
        entityId,
        imageData: `data:image/jpeg;base64,${base64Image}`,
        fileName: `${entityType.toLowerCase()}_main_image_${Date.now()}.jpg`,
        uploadDate: new Date().toISOString()
      };

      // 4. Save to AsyncStorage
      const key = `${MAIN_IMAGES_KEY_PREFIX}${entityType}_${entityId}`;
      await AsyncStorage.setItem(key, JSON.stringify(mainImage));
      
      console.log(`Main image set for ${entityType}:${entityId}`);
      return mainImage;
    } catch (error) {
      console.error(`Error setting main image for ${entityType}:${entityId}:`, error);
      throw error;
    }
  },
  
  // Get main image for an entity
  getMainImage: async (entityType, entityId) => {
    try {
      const key = `${MAIN_IMAGES_KEY_PREFIX}${entityType}_${entityId}`;
      const mainImageJson = await AsyncStorage.getItem(key);
      return mainImageJson ? JSON.parse(mainImageJson) : null;
    } catch (error) {
      console.error(`Error getting main image for ${entityType}:${entityId}:`, error);
      return null;
    }
  }
};

export default photoService;