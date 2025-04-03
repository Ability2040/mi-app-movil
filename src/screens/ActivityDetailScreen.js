import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEvents } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { activityService, ratingService } from '../services/api';
import * as ImagePicker from 'expo-image-picker';
import LoadingIndicator from '../components/LoadingIndicator';
import RatingForm from '../components/RatingForm';
import RatingsList from '../components/RatingsList';
import photoService from '../services/photoService';


const ActivityDetailScreen = ({ route, navigation }) => {
  const { eventId, activityId } = route.params;
  const { isLoading: eventsLoading, fetchEvent } = useEvents();
  const { userData } = useAuth();
  
  const [activity, setActivity] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingRating, setLoadingRating] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [error, setError] = useState(null);
  const [activityPhotos, setActivityPhotos] = useState([]);


  // Cargar datos de la actividad
  useEffect(() => {
    loadActivityData();
  }, [activityId]);

  // Cargar calificación del usuario cuando se carga la actividad
  useEffect(() => {
    if (userData && activity) {
      fetchUserRating();
    }
  }, [userData, activity]);

  const fetchActivityPhotos = async () => {
    try {
      const photos = await photoService.getEntityPhotos('Activity', activityId);
      setActivityPhotos(photos);
    } catch (error) {
      console.error('Error fetching activity photos:', error);
    }
  };
  
// Call this in useEffect
useEffect(() => {
  if (activityId) {
    fetchActivityPhotos();
  }
}, [activityId]);

  const loadActivityData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const activityData = await activityService.getActivity(activityId);
      setActivity(activityData);
    } catch (error) {
      console.error('Error al cargar la actividad:', error);
      setError('No se pudo cargar la información de la actividad');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserRating = async () => {
    try {
      setLoadingRating(true);
      const response = await ratingService.getRatings('Activity', activityId);
      
      // Buscar calificación del usuario actual
      const userRatingData = response.find(
        rating => rating.calificator && rating.calificator._id === userData._id
      );
      
      if (userRatingData) {
        setUserRating(userRatingData.calification);
      }
    } catch (error) {
      console.error('Error al obtener calificación:', error);
    } finally {
      setLoadingRating(false);
    }
  };
  
  // Función para añadir fotos a la actividad
  const handleAddPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita acceso a la galería para seleccionar imágenes');
      return;
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLoadingPhotos(true);
        
        try {
          // Use the new photoService
          await photoService.uploadPhoto('Activity', activityId, result.assets[0]);
          
          // Reload activity data to refresh photos
          await loadActivityData();
          Alert.alert('Éxito', 'Foto añadida correctamente');
        } catch (error) {
          console.error('Error al subir foto:', error);
          console.log('Error response:', error.response?.data);
          Alert.alert('Error', 'No se pudo subir la foto: ' + (error.message || 'Error desconocido'));
        } finally {
          setLoadingPhotos(false);
        }
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleRate = async (rating) => {
    try {
      setLoadingRating(true);
      
      await ratingService.createRating({
        targetModel: 'Activity',
        targetId: activityId,
        calification: rating
      });
      
      setUserRating(rating);
      
      // Recargar actividad para actualizar rating promedio
      await loadActivityData();
      
      Alert.alert('¡Gracias por tu calificación!');
    } catch (error) {
      console.error('Error al calificar:', error);
      Alert.alert('Error', 'No se pudo guardar tu calificación');
    } finally {
      setLoadingRating(false);
    }
  };

  // Verificar si el usuario puede editar la actividad
  const canEditActivity = () => {
    if (!userData || !activity) return false;
    
    const isAdmin = userData.role === 'admin';
    const isOperator = userData.permissions?.isOperator;
    
    // Si la actividad tiene info de evento anidada
    if (activity.event && activity.event.operators) {
      const isEventOperator = activity.event.operators.some(op => op._id === userData._id);
      return isAdmin || (isOperator && isEventOperator);
    }
    
    return isAdmin || isOperator;
  };

  // Renderizar estrellas para calificación
  const renderRatingStars = (currentRating, onRatingPress) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onRatingPress && onRatingPress(star)}
            disabled={!onRatingPress || loadingRating}>
            <Ionicons
              name={star <= currentRating ? 'star' : 'star-outline'}
              size={24}
              color="#FFD700"
              style={styles.starIcon}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Function to register as a witness
  const registerAsWitness = async () => {
    try {
      setIsLoading(true);
      await activityService.addWitness(activityId, userData._id);
      await loadActivityData();
      Alert.alert('¡Registrado!', 'Has sido registrado como testigo en esta actividad.');
    } catch (error) {
      console.error('Error al registrarse como testigo:', error);
      Alert.alert('Error', 'No se pudo completar el registro como testigo');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para incrementar/decrementar asientos ocupados
  const handleUpdateSeats = async (increment) => {
    try {
      setIsLoading(true);
      
      if (increment) {
        await activityService.incrementSeats(activityId);
      } else {
        await activityService.decrementSeats(activityId);
      }
      
      await loadActivityData();
    } catch (error) {
      console.error('Error al actualizar asientos:', error);
      Alert.alert('Error', 'No se pudo actualizar el número de asientos');
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar loading o error
  if (isLoading || eventsLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadActivityData}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!activity) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No se encontró la actividad</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Verificar si el usuario ya es testigo
  const isWitness = activity.witnesses && activity.witnesses.some(
    witness => witness._id === userData._id
  );

  // Verificar disponibilidad de asientos
  const seatsAvailable = (activity.capacity || 0) - (activity.seatsOccupied || 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" />
      
      <ScrollView>
        {/* Header con imagen */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <Image
            source={{ uri: activity.mainImage || 'https://via.placeholder.com/400x200?text=Actividad' }}
            style={styles.headerImage}
          />
        </View>
        
        {/* Contenido */}
        <View style={styles.content}>
          {/* Título y subtítulo */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{activity.title || 'Título de la actividad'}</Text>
            <Text style={styles.subtitle}>{activity.subtitle || 'Subtítulo de la actividad'}</Text>
          </View>
          
          {/* Calificación */}
          <View style={styles.ratingSection}>
            {renderRatingStars(activity.rating || 0)}
            
            <View style={styles.userRatingContainer}>
              <Text style={styles.userRatingTitle}>
                {userRating > 0 ? '¡Gracias por tu calificación!' : '¡Califícanos!'}
              </Text>
              {loadingRating ? (
                <ActivityIndicator size="small" color="#6c5ce7" />
              ) : (
                renderRatingStars(userRating, handleRate)
              )}
            </View>
          </View>
          
          {/* Metadatos (fecha, lugar) */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Text style={styles.metaTime}>
                {new Date(activity.date || Date.now()).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'}) || '12:00 pm'}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLocation}>{activity.location || 'Lugar'}</Text>
            </View>
          </View>
          
          {/* Descripción */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>
              {activity.description || 'No hay descripción disponible para esta actividad.'}
            </Text>
          </View>
          
          {/* Información de capacidad */}
          <View style={styles.capacitySection}>
            <Text style={styles.sectionTitle}>Capacidad</Text>
            
            <View style={styles.capacityInfo}>
              <View style={styles.capacityItem}>
                <Text style={styles.capacityLabel}>Total:</Text>
                <Text style={styles.capacityValue}>{activity.capacity || 0}</Text>
              </View>
              
              <View style={styles.capacityItem}>
                <Text style={styles.capacityLabel}>Ocupados:</Text>
                <Text style={styles.capacityValue}>{activity.seatsOccupied || 0}</Text>
              </View>
              
              <View style={styles.capacityItem}>
                <Text style={styles.capacityLabel}>Disponibles:</Text>
                <Text style={styles.capacityValue}>{seatsAvailable}</Text>
              </View>
            </View>
            
            {/* Botones de incremento/decremento (solo para admin/operadores) */}
            {canEditActivity() && (
              <View style={styles.seatsButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.seatButton,
                    { backgroundColor: '#ff4757' },
                    activity.seatsOccupied <= 0 && styles.disabledButton
                  ]}
                  onPress={() => handleUpdateSeats(false)}
                  disabled={activity.seatsOccupied <= 0 || isLoading}>
                  <Ionicons name="remove" size={18} color="#fff" />
                  <Text style={styles.seatButtonText}>Decrementar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.seatButton,
                    { backgroundColor: '#6c5ce7' },
                    activity.seatsOccupied >= activity.capacity && styles.disabledButton
                  ]}
                  onPress={() => handleUpdateSeats(true)}
                  disabled={activity.seatsOccupied >= activity.capacity || isLoading}>
                  <Ionicons name="add" size={18} color="#fff" />
                  <Text style={styles.seatButtonText}>Incrementar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {/* Fotos */}
          {activity.photos && activity.photos.length > 0 && (
            <View style={styles.photosSection}>
              <Text style={styles.sectionTitle}>Fotos de la actividad</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {activity.photos.map((photo, index) => (
                  <Image
                    key={index}
                    source={{ uri: photo }}
                    style={styles.activityPhoto}
                  />
                ))}
              </ScrollView>
              {canEditActivity() && (
                <TouchableOpacity
                  style={styles.addPhotoButton}
                  onPress={handleAddPhoto}
                  disabled={loadingPhotos}>
                  {loadingPhotos ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="add-circle-outline" size={16} color="#fff" />
                      <Text style={styles.addPhotoButtonText}>Añadir foto</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {/* Testigos */}
          <View style={styles.witnessesSection}>
            <Text style={styles.sectionTitle}>Testigos</Text>
            
            {activity.witnesses && activity.witnesses.length > 0 ? (
              <View style={styles.witnessList}>
                {activity.witnesses.map((witness, index) => (
                  <View key={index} style={styles.witnessItem}>
                    <Ionicons name="person" size={18} color="#6c5ce7" />
                    <Text style={styles.witnessName}>{witness.name}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noWitnessesText}>No hay testigos registrados para esta actividad.</Text>
            )}
            
            {!isWitness && (
              <TouchableOpacity
                style={styles.registerButton}
                onPress={registerAsWitness}>
                <Text style={styles.registerButtonText}>Registrarme como testigo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
      
      {/* Botón de edición (solo para admin/operadores) */}
      {canEditActivity() && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditActivity', { eventId, activityId })}>
          <Ionicons name="create-outline" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    position: 'relative',
    height: 200,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 16,
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  ratingSection: {
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  starIcon: {
    marginRight: 4,
  },
  userRatingContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userRatingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  metaItem: {
    marginRight: 12,
  },
  metaTime: {
    backgroundColor: '#6c5ce7',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    overflow: 'hidden',
  },
  metaLocation: {
    backgroundColor: '#f0f0f0',
    color: '#666',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    overflow: 'hidden',
  },
  descriptionContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  descriptionText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  capacitySection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  capacityInfo: {
    marginBottom: 16,
  },
  capacityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  capacityLabel: {
    fontSize: 16,
    color: '#666',
  },
  capacityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  seatsButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  seatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  seatButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  disabledButton: {
    opacity: 0.5,
  },
  photosSection: {
    marginBottom: 24,
  },
  activityPhoto: {
    width: 150,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  witnessesSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  witnessList: {
    marginBottom: 16,
  },
  witnessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  witnessName: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  noWitnessesText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  registerButton: {
    backgroundColor: '#6c5ce7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  editButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4757',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  photosSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventPhoto: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 10,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#888',
    marginBottom: 12,
  },
  addPhotoButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  addPhotoButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  }
});

export default ActivityDetailScreen;