import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

// Prefijos para las claves de AsyncStorage
const MAIN_IMAGES_KEY_PREFIX = 'MAIN_IMAGE_';
const LOGOS_KEY_PREFIX = 'LOGO_';
const PHOTOS_KEY_PREFIX = 'PHOTOS_';

const photoService = {
  // Guardar imagen principal
  setMainImage: async (entityType, entityId, photoData) => {
    try {
      if (!photoData || !photoData.uri) {
        console.error('Datos de imagen inválidos:', photoData);
        throw new Error('Datos de imagen principal inválidos');
      }
      
      console.log(`Guardando imagen principal para ${entityType}:${entityId}`);
      
      // Procesar la imagen (redimensionar para optimizar)
      const processedImage = await manipulateAsync(
        photoData.uri,
        [{ resize: { width: 800 } }], // Ancho de 800px, mantiene proporción
        { compress: 0.7, format: SaveFormat.JPEG }
      );

      // Convertir a base64
      const base64Image = await FileSystem.readAsStringAsync(processedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Crear objeto de imagen
      const mainImage = {
        entityType,
        entityId,
        imageData: `data:image/jpeg;base64,${base64Image}`,
        fileName: `${entityType.toLowerCase()}_${entityId}_main_${Date.now()}.jpg`,
        uploadDate: new Date().toISOString()
      };

      // Guardar en AsyncStorage
      const key = `${MAIN_IMAGES_KEY_PREFIX}${entityType}_${entityId}`;
      await AsyncStorage.setItem(key, JSON.stringify(mainImage));
      
      console.log(`Imagen principal guardada con éxito para ${entityType}:${entityId}`);
      return mainImage;
    } catch (error) {
      console.error(`Error al guardar imagen principal para ${entityType}:${entityId}:`, error);
      throw error;
    }
  },

  // Obtener imagen principal
  getMainImage: async (entityType, entityId) => {
    try {
      console.log(`Getting main image for ${entityType}:${entityId}`);
      const key = `MAIN_IMAGE_${entityType}_${entityId}`;
      const imageJson = await AsyncStorage.getItem(key);
      
      if (!imageJson) {
        console.log(`No image found for ${entityType}:${entityId}`);
        return null;
      }
      
      const imageData = JSON.parse(imageJson);
      console.log(`Found image data for ${entityType}:${entityId}`);
      return imageData; // Esto debe contener {imageData: 'data:image/jpeg;base64,...'}
    } catch (error) {
      console.error(`Error getting main image for ${entityType}:${entityId}:`, error);
      return null;
    }
  },

  // Guardar logo
  setLogo: async (entityType, entityId, photoData) => {
    try {
      if (!photoData || !photoData.uri) {
        console.error('Datos de logo inválidos:', photoData);
        throw new Error('Datos de logo inválidos');
      }
      
      console.log(`Guardando logo para ${entityType}:${entityId}`);
      
      // Procesar la imagen - para logos mantenemos formato cuadrado
      const processedImage = await manipulateAsync(
        photoData.uri,
        [{ resize: { width: 400, height: 400 } }], // Tamaño cuadrado para logos
        { compress: 0.7, format: SaveFormat.PNG }
      );

      // Convertir a base64
      const base64Image = await FileSystem.readAsStringAsync(processedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Crear objeto de logo
      const logo = {
        entityType,
        entityId,
        imageData: `data:image/png;base64,${base64Image}`,
        fileName: `${entityType.toLowerCase()}_${entityId}_logo_${Date.now()}.png`,
        uploadDate: new Date().toISOString()
      };

      // Guardar en AsyncStorage
      const key = `${LOGOS_KEY_PREFIX}${entityType}_${entityId}`;
      await AsyncStorage.setItem(key, JSON.stringify(logo));
      
      console.log(`Logo guardado con éxito para ${entityType}:${entityId}`);
      return logo;
    } catch (error) {
      console.error(`Error al guardar logo para ${entityType}:${entityId}:`, error);
      throw error;
    }
  },

  // Obtener logo
  getLogo: async (entityType, entityId) => {
    try {
      const key = `${LOGOS_KEY_PREFIX}${entityType}_${entityId}`;
      const logoJson = await AsyncStorage.getItem(key);
      return logoJson ? JSON.parse(logoJson) : null;
    } catch (error) {
      console.error(`Error al obtener logo para ${entityType}:${entityId}:`, error);
      return null;
    }
  },

  // Subir foto general (compatible con tu código existente)
  uploadPhoto: async (entityType, entityId, photoData) => {
    try {
      if (!photoData || !photoData.uri) {
        console.error('Datos de foto inválidos:', photoData);
        throw new Error('Datos de foto inválidos');
      }
      
      console.log(`Subiendo foto para ${entityType}:${entityId}`);
      
      // Determinar si es logo o imagen principal
      if (entityType === 'EventLogo') {
        return photoService.setLogo('Event', entityId, photoData);
      }
      
      // Procesar la imagen
      const processedImage = await manipulateAsync(
        photoData.uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: SaveFormat.JPEG }
      );

      // Convertir a base64
      const base64Image = await FileSystem.readAsStringAsync(processedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Crear objeto de foto
      const photo = {
        entityType,
        entityId,
        imageData: `data:image/jpeg;base64,${base64Image}`,
        fileName: `${entityType.toLowerCase()}_${entityId}_photo_${Date.now()}.jpg`,
        uploadDate: new Date().toISOString()
      };

      // Obtener fotos existentes o inicializar un array vacío
      let photos = [];
      const key = `${PHOTOS_KEY_PREFIX}${entityType}_${entityId}`;
      const existingPhotos = await AsyncStorage.getItem(key);
      
      if (existingPhotos) {
        photos = JSON.parse(existingPhotos);
      }
      
      // Añadir la nueva foto
      photos.push(photo);
      
      // Guardar array actualizado en AsyncStorage
      await AsyncStorage.setItem(key, JSON.stringify(photos));
      
      console.log(`Foto subida con éxito para ${entityType}:${entityId}`);
      return photo;
    } catch (error) {
      console.error(`Error al subir foto para ${entityType}:${entityId}:`, error);
      throw error;
    }
  },

  // Obtener todas las fotos de una entidad
  getEntityPhotos: async (entityType, entityId) => {
    try {
      const key = `${PHOTOS_KEY_PREFIX}${entityType}_${entityId}`;
      const photosJson = await AsyncStorage.getItem(key);
      return photosJson ? JSON.parse(photosJson) : [];
    } catch (error) {
      console.error(`Error al obtener fotos para ${entityType}:${entityId}:`, error);
      return [];
    }
  },

  // Eliminar una foto
  deletePhoto: async (entityType, entityId, photoIndex) => {
    try {
      const key = `${PHOTOS_KEY_PREFIX}${entityType}_${entityId}`;
      const photosJson = await AsyncStorage.getItem(key);
      
      if (!photosJson) return false;
      
      const photos = JSON.parse(photosJson);
      if (photoIndex < 0 || photoIndex >= photos.length) return false;
      
      photos.splice(photoIndex, 1);
      await AsyncStorage.setItem(key, JSON.stringify(photos));
      
      return true;
    } catch (error) {
      console.error(`Error al eliminar foto para ${entityType}:${entityId}:`, error);
      return false;
    }
  },

  // Eliminar imagen principal
  deleteMainImage: async (entityType, entityId) => {
    try {
      const key = `${MAIN_IMAGES_KEY_PREFIX}${entityType}_${entityId}`;
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error al eliminar imagen principal para ${entityType}:${entityId}:`, error);
      return false;
    }
  },

  // Eliminar logo
  deleteLogo: async (entityType, entityId) => {
    try {
      const key = `${LOGOS_KEY_PREFIX}${entityType}_${entityId}`;
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error al eliminar logo para ${entityType}:${entityId}:`, error);
      return false;
    }
  }
};

export default photoService;