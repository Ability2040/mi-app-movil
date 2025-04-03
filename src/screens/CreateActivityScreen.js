import React, { useState } from 'react';
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
  Alert,
  Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import photoService from '../services/photoService';


import { useEvents } from '../context/EventContext';

const CreateActivityScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const { createActivity, isLoading, error, clearError } = useEvents();
  
  // Estado del formulario
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [capacity, setCapacity] = useState('');
  const [mainImage, setMainImage] = useState(null);
  
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
  
  // Abrir selector de fecha
  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  // Abrir selector de hora
  const openTimePicker = () => {
    setShowTimePicker(true);
  };

  // Manejar cambio de fecha
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      setDate(selectedDate);
    }
  };

  // Manejar cambio de hora
  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (event.type === 'set' && selectedTime) {
      setTime(selectedTime);
    }
  };
  
  // Crear actividad
  const handleCreateActivity = async () => {
    if (!validateForm()) return;
    
    // Prepare activity data according to API requirements
    const activityData = {
      title,
      subtitle,
      description,
      place: location, // The API expects 'place' not 'location'
      date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      time: time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }), // Format as HH:MM
      seats: parseInt(capacity), // The API expects 'seats' not 'capacity'
      organization: "", // Optional, but include it
      ticketType: 0, // Default value (0 = free, 1 = paid)
      infoColor: "#000000", // Default values for colors
      bgColor: "#FFFFFF",
      starColor: "#FFD700"
    };
    
    console.log('Sending activity data:', activityData);
    
    try {
      // Create the activity
      const newActivity = await createActivity(eventId, activityData);
      
      if (mainImage && newActivity && newActivity._id) {
        try {
          await photoService.setMainImage('Activity', newActivity._id, mainImage);
          console.log('Successfully uploaded main image for activity');
        } catch (imageError) {
          console.error('Error uploading activity image:', imageError);
          Alert.alert(
            'Advertencia',
            'La actividad se creó, pero hubo un problema al subir la imagen'
          );
        }
      }
      
      Alert.alert(
        'Éxito',
        'Actividad creada correctamente',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error al crear actividad:', error);
      
      // More detailed error handling
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Data:', error.response.data);
        
        // Show more specific error message if available
        const errorMessage = error.response.data?.message || 'No se pudo crear la actividad';
        Alert.alert('Error', errorMessage);
      } else {
        Alert.alert('Error', 'No se pudo crear la actividad. Inténtalo de nuevo.');
      }
    }
  };
  
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
            <Text style={styles.headerTitle}>Crear Actividad</Text>
          </View>
          
          {/* Mensaje de error */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
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
            
            {/* Fecha */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Fecha*</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={openDatePicker}>
                <Text style={styles.dateText}>
                  {date.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#6c5ce7" />
              </TouchableOpacity>
            </View>

            {/* Hora */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Hora*</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={openTimePicker}>
                <Text style={styles.dateText}>
                  {time.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Ionicons name="time-outline" size={20} color="#6c5ce7" />
              </TouchableOpacity>
            </View>

            {/* Date Picker para Android */}
            {Platform.OS === 'android' && showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            {Platform.OS === 'android' && showTimePicker && (
              <DateTimePicker
                testID="timePicker"
                value={time || new Date()}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={handleTimeChange}
              />
            )}
            
            {/* Modal Date Picker para iOS */}
            {Platform.OS === 'ios' && (
              <Modal
                transparent={true}
                visible={showDatePicker || showTimePicker}
                animationType="slide"
                onRequestClose={() => {
                  setShowDatePicker(false);
                  setShowTimePicker(false);
                }}
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    {showDatePicker && (
                      <DateTimePicker
                        testID="dateTimePicker"
                        value={date || new Date()}
                        mode="date"
                        display="spinner"
                        onChange={(event, selectedDate) => {
                          handleDateChange(event, selectedDate);
                          setShowDatePicker(false);
                        }}
                      />
                    )}
                    {showTimePicker && (
                      <DateTimePicker
                        testID="timePicker"
                        value={time || new Date()}
                        mode="time"
                        is24Hour={true}
                        display="spinner"
                        onChange={(event, selectedTime) => {
                          handleTimeChange(event, selectedTime);
                          setShowTimePicker(false);
                        }}
                      />
                    )}
                    <TouchableOpacity 
                      style={styles.modalCloseButton}
                      onPress={() => {
                        setShowDatePicker(false);
                        setShowTimePicker(false);
                      }}
                    >
                      <Text style={styles.modalCloseButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            )}
            
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
                style={[styles.button, styles.createButton]}
                onPress={handleCreateActivity}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.createButtonText}>Crear Actividad</Text>
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
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
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
  createButton: {
    backgroundColor: '#6c5ce7',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  modalButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    backgroundColor: '#6c5ce7',
    padding: 15,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  modalCloseButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CreateActivityScreen;