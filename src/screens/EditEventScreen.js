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
import { eventService } from '../services/api'; // Asegúrate de que este servicio exista

const EditEventScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const { getEvent, updateEvent, isLoading, error, clearError } = useEvents();
  
  // Estado del formulario
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [mainImage, setMainImage] = useState(null);
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [loadingImages, setLoadingImages] = useState(false);
  
  // Cargar datos del evento
  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoadingEvent(true);
        const eventData = await getEvent(eventId);
        
        if (eventData) {
          setTitle(eventData.title || '');
          setSubtitle(eventData.subtitle || '');
          setDescription(eventData.description || '');
          setLocation(eventData.location || '');
          setDate(eventData.date ? new Date(eventData.date) : new Date());
          
          if (eventData.mainImage) {
            setMainImageUrl(eventData.mainImage);
          }
          
          if (eventData.logo) {
            setLogoUrl(eventData.logo);
          }
        } else {
          // Manejo cuando el evento no existe
          Alert.alert(
            'Error',
            'No se encontró información del evento',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      } catch (error) {
        console.error('Error al cargar evento:', error);
        Alert.alert('Error', 'No se pudo cargar la información del evento');
      } finally {
        setLoadingEvent(false);
      }
    };
    
    loadEvent();
  }, [eventId, getEvent]);
  
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
  
  // Manejar cambio de fecha
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };
  
  // Subir imágenes
  const uploadImages = async (eventId) => {
    setLoadingImages(true);
    let hasErrors = false;
    
    try {
      // Subir imagen principal si se seleccionó una nueva
      if (mainImage) {
        const formData = new FormData();
        formData.append('file', {
          uri: mainImage.uri,
          type: 'image/jpeg',
          name: 'main_image.jpg',
        });
        
        try {
          await eventService.uploadMainImage(eventId, formData);
        } catch (imageError) {
          console.error('Error al subir imagen principal:', imageError);
          hasErrors = true;
        }
      }
      
      // Subir logo si se seleccionó uno nuevo
      if (logo) {
        const formData = new FormData();
        formData.append('file', {
          uri: logo.uri,
          type: 'image/jpeg',
          name: 'logo.jpg',
        });
        
        try {
          await eventService.uploadLogo(eventId, formData);
        } catch (logoError) {
          console.error('Error al subir logo:', logoError);
          hasErrors = true;
        }
      }
      
      return !hasErrors;
    } catch (error) {
      console.error('Error general al subir imágenes:', error);
      return false;
    } finally {
      setLoadingImages(false);
    }
  };
  
  // Actualizar evento
  const handleUpdateEvent = async () => {
    if (!validateForm()) return;
    
    try {
      // Preparar datos del evento
      const eventData = {
        title,
        subtitle,
        description,
        location,
        date: date.toISOString(),
      };
      
      // Actualizar el evento
      const updatedEvent = await updateEvent(eventId, eventData);
      
      if (updatedEvent) {
        // Subir imágenes si se seleccionaron nuevas
        if (mainImage || logo) {
          const imagesUploaded = await uploadImages(eventId);
          
          if (!imagesUploaded) {
            Alert.alert(
              'Advertencia', 
              'El evento se actualizó, pero hubo problemas al subir las imágenes',
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
            return;
          }
        }
        
        Alert.alert(
          'Éxito',
          'Evento actualizado correctamente',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      Alert.alert('Error', 'No se pudo actualizar el evento. Inténtalo de nuevo.');
    }
  };
  
  if (loadingEvent) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
        <Text style={styles.loadingText}>Cargando evento...</Text>
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
            <Text style={styles.headerTitle}>Editar Evento</Text>
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
                ) : logoUrl ? (
                  <Image
                    source={{ uri: logoUrl }}
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
                onPress={() => navigation.goBack()}
                disabled={isLoading || loadingImages}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.updateButton]}
                onPress={handleUpdateEvent}
                disabled={isLoading || loadingImages}>
                {isLoading || loadingImages ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.updateButtonText}>Actualizar Evento</Text>
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

export default EditEventScreen;