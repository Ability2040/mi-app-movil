import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const UserDetailScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const { userData } = useAuth();
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Comprobar si el usuario actual es administrador
  useEffect(() => {
    if (userData && userData.role !== 'admin') {
      Alert.alert('Acceso denegado', 'Solo los administradores pueden acceder a esta pantalla');
      navigation.goBack();
    }
  }, [userData]);

  // Cargar información del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Obtener datos del usuario
        const userResponse = await api.get(`/users/${userId}`);
        setUser(userResponse.data);
        
        // Obtener tickets del usuario
        const ticketsResponse = await api.get(`/tickets/user/${userId}`);
        setTickets(ticketsResponse.data);
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        setError('No se pudo cargar la información del usuario');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId]);
  
  // Navegar a la pantalla de edición de usuario
  const handleEditUser = () => {
    navigation.navigate('EditUser', { userId });
  };
  
  // Eliminar usuario
  const handleDeleteUser = () => {
    Alert.alert(
      'Eliminar Usuario',
      '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/users/${userId}`);
              Alert.alert('Éxito', 'Usuario eliminado correctamente');
              navigation.goBack();
            } catch (error) {
              console.error('Error al eliminar usuario:', error);
              Alert.alert('Error', 'No se pudo eliminar el usuario');
            }
          }
        }
      ]
    );
  };
  
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
        <Text style={styles.loadingText}>Cargando información del usuario...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Usuario no encontrado</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de Usuario</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEditUser}>
          <Ionicons name="create-outline" size={24} color="#6c5ce7" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Información principal del usuario */}
        <View style={styles.userHeader}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user.role}</Text>
            </View>
          </View>
        </View>
        
        {/* Sección de permisos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permisos</Text>
          <View style={styles.permissionsContainer}>
            <View style={styles.permissionItem}>
              <Text style={styles.permissionLabel}>Operador:</Text>
              <Text style={styles.permissionValue}>
                {user.permissions && user.permissions.isOperator ? 'Sí' : 'No'}
              </Text>
            </View>
            <View style={styles.permissionItem}>
              <Text style={styles.permissionLabel}>Asistente:</Text>
              <Text style={styles.permissionValue}>
                {user.permissions && user.permissions.isAssistant ? 'Sí' : 'No'}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Sección de tickets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tickets</Text>
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <View 
                key={ticket._id} 
                style={styles.ticketItem}>
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketTitle}>{ticket.event?.title || 'Evento sin título'}</Text>
                  <Text style={styles.ticketType}>Tipo: {ticket.type}</Text>
                </View>
                <View style={styles.ticketDetails}>
                  <Text style={styles.ticketDate}>
                    {new Date(ticket.createdAt).toLocaleDateString('es-ES')}
                  </Text>
                  <TouchableOpacity 
                    style={styles.viewTicketButton}
                    onPress={() => navigation.navigate('TicketDetail', { ticketId: ticket._id })}>
                    <Text style={styles.viewTicketText}>Ver ticket</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noContentText}>No tiene tickets asignados</Text>
          )}
        </View>
        
        {/* Estadísticas del usuario */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{tickets.length}</Text>
              <Text style={styles.statLabel}>Tickets</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.witnesses?.length || 0}</Text>
              <Text style={styles.statLabel}>Testificaciones</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.califications?.length || 0}</Text>
              <Text style={styles.statLabel}>Calificaciones</Text>
            </View>
          </View>
        </View>
        
        {/* Botón de eliminar */}
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDeleteUser}>
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.deleteButtonText}>Eliminar Usuario</Text>
        </TouchableOpacity>
      </ScrollView>
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 12,
  },
  permissionsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  permissionLabel: {
    fontSize: 16,
    color: '#333',
  },
  permissionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6c5ce7',
  },
  ticketItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  ticketType: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ticketDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketDate: {
    fontSize: 14,
    color: '#666',
  },
  viewTicketButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  viewTicketText: {
    fontSize: 14,
    color: '#fff',
  },
  noContentText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6c5ce7',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: '#ff4757',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default UserDetailScreen;