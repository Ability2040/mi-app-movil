import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const TicketDetailScreen = ({ route, navigation }) => {
  const { ticketId } = route.params;
  const { userData } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar permisos
  const canEdit = userData && (
    userData.role === 'admin' || 
    (userData.permissions && userData.permissions.isOperator)
  );

  // Cargar información del ticket
  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await api.get(`/tickets/${ticketId}`);
        setTicket(response.data);
      } catch (error) {
        console.error('Error al cargar datos del ticket:', error);
        setError('No se pudo cargar la información del ticket');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTicketData();
  }, [ticketId]);
  
  // Compartir ticket
  const handleShareTicket = async () => {
    try {
      const message = `Ticket para ${ticket.event?.title}\nTipo: ${ticket.type}\nUsuario: ${ticket.user?.name}\nCódigo: ${ticket._id}`;
      await Share.share({
        message,
        title: 'Compartir Ticket',
      });
    } catch (error) {
      console.error('Error al compartir ticket:', error);
      Alert.alert('Error', 'No se pudo compartir el ticket');
    }
  };
  
  // Marcar ticket como usado/no usado
  const handleToggleTicketStatus = async () => {
    try {
      await api.put(`/tickets/${ticketId}`, { 
        isUsed: !ticket.isUsed 
      });
      
      // Actualizar el estado del ticket en la UI
      setTicket({
        ...ticket,
        isUsed: !ticket.isUsed
      });
      
      Alert.alert('Éxito', `Ticket marcado como ${!ticket.isUsed ? 'usado' : 'no usado'}`);
    } catch (error) {
      console.error('Error al actualizar estado del ticket:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado del ticket');
    }
  };
  
  // Eliminar ticket
  const handleDeleteTicket = () => {
    Alert.alert(
      'Eliminar Ticket',
      '¿Estás seguro de que deseas eliminar este ticket? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/tickets/${ticketId}`);
              Alert.alert('Éxito', 'Ticket eliminado correctamente');
              navigation.goBack();
            } catch (error) {
              console.error('Error al eliminar ticket:', error);
              Alert.alert('Error', 'No se pudo eliminar el ticket');
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
        <Text style={styles.loadingText}>Cargando información del ticket...</Text>
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
  
  if (!ticket) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Ticket no encontrado</Text>
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
        <Text style={styles.headerTitle}>Detalle de Ticket</Text>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShareTicket}>
          <Ionicons name="share-outline" size={24} color="#6c5ce7" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Ticket principal */}
        <View style={styles.ticket}>
          <View style={styles.ticketHeader}>
            <Text style={styles.eventTitle}>{ticket.event?.title || 'Evento sin título'}</Text>
            <View style={[
              styles.statusBadge,
              ticket.isUsed ? styles.statusUsed : styles.statusActive
            ]}>
              <Text style={styles.statusText}>
                {ticket.isUsed ? 'Usado' : 'Activo'}
              </Text>
            </View>
          </View>
          
          <View style={styles.qrContainer}>
            <QRCode
              value={ticket._id}
              size={200}
              color="#333"
              backgroundColor="#fff"
            />
          </View>
          
          <View style={styles.ticketInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipo:</Text>
              <Text style={styles.infoValue}>{ticket.type || 'General'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Usuario:</Text>
              <Text style={styles.infoValue}>{ticket.user?.name || 'Desconocido'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha de emisión:</Text>
              <Text style={styles.infoValue}>
                {new Date(ticket.createdAt).toLocaleString('es-ES')}
              </Text>
            </View>
            
            {ticket.event?.date && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Fecha del evento:</Text>
                <Text style={styles.infoValue}>
                  {new Date(ticket.event.date).toLocaleString('es-ES')}
                </Text>
              </View>
            )}
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Lugar:</Text>
              <Text style={styles.infoValue}>{ticket.event?.location || 'Sin especificar'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID del ticket:</Text>
              <Text style={styles.infoValue}>{ticket._id}</Text>
            </View>
          </View>
        </View>
        
        {/* Sección de acciones */}
        {canEdit && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[
                styles.actionButton,
                ticket.isUsed ? styles.actionButtonActive : styles.actionButtonPrimary
              ]}
              onPress={handleToggleTicketStatus}>
              <Ionicons 
                name={ticket.isUsed ? 'refresh-outline' : 'checkmark-outline'} 
                size={20} 
                color="#fff" 
              />
              <Text style={styles.actionButtonText}>
                {ticket.isUsed ? 'Marcar como no usado' : 'Marcar como usado'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.actionButtonDanger]}
              onPress={handleDeleteTicket}>
              <Ionicons name="trash-outline" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Eliminar ticket</Text>
            </TouchableOpacity>
          </View>
        )}
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
  shareButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  ticket: {
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
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#e3f2fd',
  },
  statusUsed: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  ticketInfo: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 120,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionButtonPrimary: {
    backgroundColor: '#6c5ce7',
  },
  actionButtonActive: {
    backgroundColor: '#4CAF50',
  },
  actionButtonDanger: {
    backgroundColor: '#ff4757',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default TicketDetailScreen;