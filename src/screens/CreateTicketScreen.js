import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import api, { ticketService } from '../services/api';

const CreateTicketScreen = ({ navigation }) => {
  const { userData } = useAuth();
  
  // Estado del formulario
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [ticketType, setTicketType] = useState('General');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [ticketPrice, setTicketPrice] = useState('0');

  
  // Verificar permisos
  useEffect(() => {
    if (userData && userData.role !== 'admin' && 
      !(userData.permissions && userData.permissions.isOperator)) {
      Alert.alert('Acceso denegado', 'No tienes permiso para crear tickets');
      navigation.goBack();
    }
  }, [userData]);
  
  // Cargar eventos y usuarios
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        setError(null);
        
        // Obtener eventos
        const eventsResponse = await api.get('/events');
        setEvents(eventsResponse.data);
        
        if (eventsResponse.data.length > 0) {
          setSelectedEventId(eventsResponse.data[0]._id);
        }
        
        // Obtener usuarios
        const usersResponse = await api.get('/users');
        setUsers(usersResponse.data);
        
        if (usersResponse.data.length > 0) {
          setSelectedUserId(usersResponse.data[0]._id);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('No se pudieron cargar los datos necesarios');
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Crear ticket
  const handleCreateTicket = async () => {
    if (!selectedEventId) {
      Alert.alert('Error', 'Por favor selecciona un evento');
      return;
    }
    
    if (!selectedUserId) {
      Alert.alert('Error', 'Por favor selecciona un usuario');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const ticketData = {
        title: 'Entrada ' + ticketType,
        event: selectedEventId,
        user: selectedUserId,
        price: ticketPrice ? parseInt(ticketPrice) : 0,
        role: 'assistente',
        activities: []  // You can add activity selection in the UI if needed
      };
      
      console.log('Creating ticket with data:', ticketData);
      
      await ticketService.createTicket(ticketData);
      
      Alert.alert(
        'Éxito',
        'Ticket creado correctamente',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error al crear ticket:', error);
      
      // More detailed error logging
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Data:', error.response.data);
        
        const errorMessage = error.response.data?.message || 'No se pudo crear el ticket';
        setError(errorMessage);
      } else {
        setError('No se pudo crear el ticket. Inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
        <Text style={styles.loadingText}>Cargando datos...</Text>
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
            <Text style={styles.headerTitle}>Crear Ticket</Text>
          </View>
          
          {/* Mensaje de error */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          {/* Formulario */}
          <View style={styles.form}>
            {/* Evento */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Evento*</Text>
              {events.length > 0 ? (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedEventId}
                    onValueChange={(itemValue) => setSelectedEventId(itemValue)}
                    style={styles.picker}>
                    {events.map((event) => (
                      <Picker.Item
                        key={event._id}
                        label={event.title}
                        value={event._id}
                      />
                    ))}
                  </Picker>
                </View>
              ) : (
                <Text style={styles.noDataText}>No hay eventos disponibles</Text>
              )}
            </View>
            
            {/* Usuario */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Usuario*</Text>
              {users.length > 0 ? (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedUserId}
                    onValueChange={(itemValue) => setSelectedUserId(itemValue)}
                    style={styles.picker}>
                    {users.map((user) => (
                      <Picker.Item
                        key={user._id}
                        label={user.name}
                        value={user._id}
                      />
                    ))}
                  </Picker>
                </View>
              ) : (
                <Text style={styles.noDataText}>No hay usuarios disponibles</Text>
              )}
            </View>
            
            {/* Tipo de ticket */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tipo de Ticket</Text>
              <TextInput
                style={styles.input}
                value={ticketType}
                onChangeText={setTicketType}
                placeholder="Tipo de ticket (ej. General, VIP, etc.)"
              />
            </View>

            <View style={styles.formGroup}>
  <Text style={styles.label}>Precio</Text>
  <TextInput
    style={styles.input}
    value={ticketPrice}
    onChangeText={setTicketPrice}
    placeholder="Precio del ticket"
    keyboardType="numeric"
  />
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
                onPress={handleCreateTicket}
                disabled={isLoading || !selectedEventId || !selectedUserId}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.createButtonText}>Crear Ticket</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  noDataText: {
    padding: 12,
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    textAlign: 'center',
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
});

export default CreateTicketScreen;