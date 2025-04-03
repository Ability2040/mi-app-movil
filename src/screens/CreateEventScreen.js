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
import { useEvents } from '../context/EventContext';
import photoService from '../services/photoService';


const CreateEventScreen = ({ navigation }) => {
  const { createEvent, isLoading, error, clearError } = useEvents();
  
  // Estado del formulario
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [mainImage, setMainImage] = useState(null);
  const [logo, setLogo] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Validar formulario
  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Por favor ingresa un título para el evento');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Por favor ingresa una descripción para el evento');
      return false;
    }
    if (!location.trim()) {
      Alert.alert('Error', 'Por favor ingresa una ubicación para el evento');
      return false;
    }
    return true;
  };
  
  // Seleccionar imagen
  const pickImage = async (type) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita acceso a la galería para seleccionar imágenes');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'logo' ? [1, 1] : [16, 9],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (type === 'logo') {
          setLogo(result.assets[0]);
        } else {
          setMainImage(result.assets[0]);
        }
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

  // Crear evento
  const handleCreateEvent = async () => {
    if (!validateForm()) return;
    if (isNaN(date.getTime())) {
      Alert.alert('Error', 'Fecha inválida');
      return;
    }
  
    try {
      // Preparar datos del evento
      const eventData = {
        title,
        subtitle,
        description,
        location,
        date: date.toISOString(), // Formato compatible con MongoDB
        time: time.toISOString(),
      };
      
      const newEvent = await createEvent(eventData, mainImage, logo);
      
      if (newEvent) {
        Alert.alert(
          'Éxito',
          'Evento creado correctamente',
          [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
        );
      }
    } catch (error) {
      console.error('Error al crear evento:', error);
      Alert.alert('Error', 'No se pudo crear el evento. Inténtalo de nuevo.');
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
            <Text style={styles.headerTitle}>Crear Evento</Text>
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
                placeholder="Título del evento"
              />
            </View>
            
            {/* Subtítulo */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Subtítulo</Text>
              <TextInput
                style={styles.input}
                value={subtitle}
                onChangeText={setSubtitle}
                placeholder="Subtítulo del evento"
              />
            </View>
            
            {/* Descripción */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Descripción*</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe el evento..."
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
                placeholder="Lugar del evento"
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
            
            {/* Imagen principal */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Imagen Principal</Text>
              <TouchableOpacity
                style={styles.imagePickerContainer}
                onPress={() => pickImage('main')}>
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
            
            {/* Logo */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Logo</Text>
              <TouchableOpacity
                style={[styles.imagePickerContainer, styles.logoPickerContainer]}
                onPress={() => pickImage('logo')}>
                {logo ? (
                  <Image
                    source={{ uri: logo.uri }}
                    style={styles.logoPreview}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="logo-buffer" size={40} color="#999" />
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
                onPress={handleCreateEvent}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.createButtonText}>Crear Evento</Text>
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
  logoPickerContainer: {
    height: 150,
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
  logoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
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

export default CreateEventScreen;