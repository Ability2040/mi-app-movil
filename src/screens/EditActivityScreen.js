import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useEvents } from '../context/EventContext';
import { activityService, photoService } from '../services/api';
import LoadingIndicator from '../components/LoadingIndicator';


const EditActivityScreen = ({ route, navigation }) => {
  const { activityId } = route.params;
  const { error, clearError } = useEvents(); // Remove isLoading from here
  
  // Add a local loading state variable
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado del formulario
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [capacity, setCapacity] = useState('');
  const [ticketType, setTicketType] = useState('');
  const [mainImage, setMainImage] = useState(null);
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [showTimePicker, setShowTimePicker] = useState(false);

  
  // Cargar datos de la actividad
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoadingActivity(true); // Use setLoadingActivity instead of setIsLoading
        
        const data = await activityService.getActivity(activityId);
        
        setTitle(data.title || '');
        setSubtitle(data.subtitle || '');
        setDescription(data.description || '');
        setLocation(data.place || ''); // Field mismatch: API returns 'place', not 'location'
        setCapacity(data.seats ? data.seats.toString() : '0'); // API returns 'seats', not 'capacity'
        setTicketType(data.ticketType ? data.ticketType.toString() : '0');
        
        if (data.date) {
          setDate(new Date(data.date));
        }
        
        if (data.time) {
          const [hours, minutes] = data.time.split(':');
          const timeDate = new Date();
          timeDate.setHours(parseInt(hours, 10));
          timeDate.setMinutes(parseInt(minutes, 10));
          setTime(timeDate);
        }
        
      } catch (error) {
        console.error('Error al cargar actividad:', error);
        Alert.alert('Error', 'No se pudo cargar la información de la actividad');
      } finally {
        setLoadingActivity(false); // Use setLoadingActivity instead of setIsLoading
      }
    };
    
    fetchActivity();
  }, [activityId]);

  // Validar formulario
  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Por favor ingresa un título para la actividad');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Por favor ingresa una descripción para la actividad');
      return false;
    }
    if (!location.trim()) {
      Alert.alert('Error', 'Por favor ingresa una ubicación para la actividad');
      return false;
    }
    if (!capacity.trim() || isNaN(capacity) || parseInt(capacity) <= 0) {
      Alert.alert('Error', 'Por favor ingresa una capacidad válida');
      return false;
    }
    return true;
  };
  
  // Seleccionar imagen
  const pickImage = async () => {
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
        setMainImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };
  
  // Manejar cambio de fecha
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };
  
  // Actualizar actividad
  const handleUpdateActivity = async () => {
    if (!validateForm()) return;
    
    // Prepare activity data according to API requirements
    const activityData = {
      title,
      subtitle,
      description,
      place: location, // API expects 'place', not 'location'
      date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      time: time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }), // Format as HH:MM
      seats: parseInt(capacity, 10), // API expects 'seats', not 'capacity'
      ticketType: parseInt(ticketType, 10) || 0
    };
    
    try {
      setIsUpdating(true);
      
      // First, update the activity data
      const updatedActivity = await activityService.updateActivity(activityId, activityData);
      
      // Then, if there's a new main image selected, upload it
      if (mainImage) {
        try {
          await photoService.setMainImage('Activity', activityId, mainImage);
        } catch (imageError) {
          console.error('Error uploading activity image:', imageError);
          Alert.alert(
            'Advertencia',
            'La actividad se actualizó, pero hubo un problema al subir la imagen'
          );
        }
      }
      
      // Handle success
      Alert.alert(
        'Éxito',
        'Actividad actualizada correctamente',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error al actualizar actividad:', error);
      
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Data:', error.response.data);
        
        const errorMessage = error.response.data?.message || 'No se pudo actualizar la actividad';
        Alert.alert('Error', errorMessage);
      } else {
        Alert.alert('Error', 'No se pudo actualizar la actividad. Inténtalo de nuevo.');
      }
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (loadingActivity) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
        <Text style={styles.loadingText}>Cargando actividad...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Editar Actividad</Text>
          </View>
          
          {/* Mensaje de error */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={clearError}>
                <Ionicons name="close-circle" size={20} color="#d32f2f" />
              </TouchableOpacity>
            </View>
          )}
          
          {/* Formulario */}
          <View style={styles.form}>
            {/* Título */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Título*</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Título de la actividad"
              />
            </View>
            
            {/* Subtítulo */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Subtítulo</Text>
              <TextInput
                style={styles.input}
                value={subtitle}
                onChangeText={setSubtitle}
                placeholder="Subtítulo de la actividad"
              />
            </View>
            
            {/* Descripción */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Descripción*</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe la actividad..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            {/* Ubicación */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Ubicación*</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Lugar de la actividad"
              />
            </View>
            
            {/* Fecha y hora */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Fecha y Hora*</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateText}>
                  {date.toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#6c5ce7" />
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="datetime"
                  display="default"
                  onChange={onDateChange}
                />
              )}
            </View>
            
            {/* Capacidad */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Capacidad*</Text>
              <TextInput
                style={styles.input}
                value={capacity}
                onChangeText={setCapacity}
                placeholder="Número de asientos disponibles"
                keyboardType="numeric"
              />
            </View>
            
            {/* Imagen principal */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Imagen Principal</Text>
              <TouchableOpacity
                style={styles.imagePickerContainer}
                onPress={pickImage}>
                {mainImage ? (
                  <Image
                    source={{ uri: mainImage.uri }}
                    style={styles.previewImage}
                  />
                ) : mainImageUrl ? (
                  <Image
                    source={{ uri: mainImageUrl }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={40} color="#999" />
                    <Text style={styles.imagePlaceholderText}>Toca para seleccionar</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            
            {/* Botones */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => navigation.goBack()}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.updateButton]}
                onPress={handleUpdateActivity}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.updateButtonText}>Actualizar Actividad</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    flex: 1,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  datePickerButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  imagePickerContainer: {
    height: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: '#999',
    fontSize: 14,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  updateButton: {
    backgroundColor: '#6c5ce7',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditActivityScreen;