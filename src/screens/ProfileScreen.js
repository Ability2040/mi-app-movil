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
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/api';

const ProfileScreen = ({ navigation }) => {
  const { userData, updateUserData, logout, isLoading } = useAuth();
  const [userTickets, setUserTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  
  // Estados para edición de perfil
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Cargar datos iniciales
  useEffect(() => {
    if (userData) {
      setName(userData.name || '');
      setEmail(userData.email || '');
      fetchUserTickets();
    }
  }, [userData]);

  // Obtener tickets del usuario
  const fetchUserTickets = async () => {
    if (!userData) return;
    
    try {
      setTicketsLoading(true);
      const tickets = await ticketService.getUserTickets(userData._id);
      setUserTickets(tickets);
    } catch (error) {
      console.error('Error al obtener tickets:', error);
    } finally {
      setTicketsLoading(false);
    }
  };

  // Manejar actualización de perfil
  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }
    
    try {
      await updateUserData({ name });
      setIsEditing(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    }
  };

  // Manejar cierre de sesión
  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí, cerrar sesión', style: 'destructive', onPress: logout }
      ]
    );
  };

  // Si está cargando, mostrar indicador
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Mi Perfil</Text>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#ff4757" />
          </TouchableOpacity>
        </View>

        {/* Sección de perfil */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userData && userData.name ? userData.name.charAt(0).toUpperCase() : '?'}</Text>
            </View>
          </View>

          <View style={styles.profileInfo}>
            {isEditing ? (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Nombre</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Tu nombre"
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Correo electrónico</Text>
                  <TextInput
                    style={[styles.input, { color: '#999' }]}
                    value={email}
                    editable={false}
                  />
                  <Text style={styles.helperText}>El correo electrónico no se puede cambiar</Text>
                </View>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => {
                      setIsEditing(false);
                      setName(userData.name || '');
                    }}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleUpdateProfile}>
                    <Text style={styles.saveButtonText}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.userName}>{userData?.name || 'Usuario'}</Text>
                <Text style={styles.userEmail}>{userData?.email || 'correo@ejemplo.com'}</Text>
                <Text style={styles.userRole}>{userData?.role === 'admin' ? 'Administrador' : 'Usuario'}</Text>
                
                {userData?.permissions?.isOperator && (
                  <View style={styles.badgeContainer}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Operador</Text>
                    </View>
                  </View>
                )}
                
                {userData?.permissions?.isAssistant && (
                  <View style={styles.badgeContainer}>
                    <View style={[styles.badge, { backgroundColor: '#66bb6a' }]}>
                      <Text style={styles.badgeText}>Asistente</Text>
                    </View>
                  </View>
                )}
                
                <TouchableOpacity
                  style={styles.editProfileButton}
                  onPress={() => setIsEditing(true)}>
                  <Ionicons name="create-outline" size={18} color="#6c5ce7" />
                  <Text style={styles.editProfileText}>Editar perfil</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Sección de tickets */}
        <View style={styles.ticketsSection}>
          <Text style={styles.sectionTitle}>Mis Tickets</Text>
          
          {ticketsLoading ? (
            <ActivityIndicator size="small" color="#6c5ce7" style={styles.ticketsLoader} />
          ) : userTickets.length > 0 ? (
            <View style={styles.ticketsList}>
              {userTickets.map((ticket) => (
                <TouchableOpacity
                  key={ticket._id}
                  style={styles.ticketCard}
                  onPress={() => {
                    if (ticket.event) {
                      navigation.navigate('EventDetail', { eventId: ticket.event._id });
                    }
                  }}>
                  <View style={styles.ticketLeftSection}>
                    <Text style={styles.ticketType}>Ticket {ticket.type || 'General'}</Text>
                    <Text style={styles.ticketEventName}>{ticket.event?.title || 'Evento'}</Text>
                    <Text style={styles.ticketDate}>
                      {ticket.createdAt
                        ? new Date(ticket.createdAt).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })
                        : 'Fecha no disponible'}
                    </Text>
                  </View>
                  
                  <View style={styles.ticketRightSection}>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noTicketsContainer}>
              <Ionicons name="ticket-outline" size={48} color="#ddd" />
              <Text style={styles.noTicketsText}>No tienes tickets disponibles</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 8,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 8,
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  userRole: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  editProfileText: {
    color: '#6c5ce7',
    marginLeft: 4,
    fontSize: 16,
  },
  formGroup: {
    width: '100%',
    marginBottom: 16,
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
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
  },
  button: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#6c5ce7',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ticketsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  ticketsLoader: {
    marginVertical: 20,
  },
  ticketsList: {
    marginTop: 8,
  },
  ticketCard: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 16,
  },
  ticketLeftSection: {
    flex: 1,
  },
  ticketType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ticketEventName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ticketDate: {
    fontSize: 12,
    color: '#999',
  },
  ticketRightSection: {
    justifyContent: 'center',
  },
  noTicketsContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noTicketsText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default ProfileScreen;