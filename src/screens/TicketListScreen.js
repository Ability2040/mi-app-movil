import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const TicketListScreen = ({ navigation }) => {
  const { userData } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Verificar permisos
  useEffect(() => {
    if (userData && userData.role !== 'admin' && 
      !(userData.permissions && userData.permissions.isOperator)) {
      Alert.alert('Acceso denegado', 'No tienes permiso para acceder a esta sección');
      navigation.goBack();
    }
  }, [userData]);

  // Cargar tickets
  const loadTickets = async () => {
    try {
      setError(null);
      if (!refreshing) setIsLoading(true);
      const response = await api.get('/tickets');
      setTickets(response.data);
      setFilteredTickets(response.data);
    } catch (error) {
      console.error('Error al cargar tickets:', error);
      setError('No se pudieron cargar los tickets. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // Filtrar tickets cuando cambia el texto de búsqueda
  useEffect(() => {
    if (searchText.length > 0) {
      const filtered = tickets.filter(ticket => 
        ticket.user?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        ticket.event?.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        ticket.type?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredTickets(filtered);
    } else {
      setFilteredTickets(tickets);
    }
  }, [searchText, tickets]);

  // Refrescar lista
  const handleRefresh = () => {
    setRefreshing(true);
    loadTickets();
  };

  // Navegar a la pantalla de detalles de ticket
  const handleTicketPress = (ticket) => {
    navigation.navigate('TicketDetail', { ticketId: ticket._id });
  };

  // Crear un nuevo ticket
  const handleCreateTicket = () => {
    navigation.navigate('CreateTicket');
  };

  // Renderizar cada item de ticket
  const renderTicketItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.ticketItem}
        onPress={() => handleTicketPress(item)}>
        <View style={styles.ticketHeader}>
          <Text style={styles.ticketTitle}>{item.event?.title || 'Evento sin título'}</Text>
          <View style={styles.ticketTypeBadge}>
            <Text style={styles.ticketTypeText}>{item.type || 'General'}</Text>
          </View>
        </View>
        
        <View style={styles.ticketInfo}>
          <Text style={styles.ticketUser}>Usuario: {item.user?.name || 'Desconocido'}</Text>
          <Text style={styles.ticketDate}>
            Fecha: {new Date(item.createdAt).toLocaleDateString('es-ES')}
          </Text>
        </View>
        
        <View style={styles.ticketFooter}>
          <View style={[
            styles.ticketStatusBadge,
            item.isUsed ? styles.ticketStatusUsed : styles.ticketStatusActive
          ]}>
            <Text style={styles.ticketStatusText}>
              {item.isUsed ? 'Usado' : 'Activo'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
        <Text style={styles.loadingText}>Cargando tickets...</Text>
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
        <Text style={styles.headerTitle}>Tickets</Text>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar tickets..."
          value={searchText}
          onChangeText={setSearchText}
          clearButtonMode="while-editing"
          autoCapitalize="none"
        />
        {searchText.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Mensaje de error */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadTickets}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lista de tickets */}
      <FlatList
        data={filteredTickets}
        keyExtractor={(item) => item._id}
        renderItem={renderTicketItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#6c5ce7']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="ticket-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchText.length > 0
                ? 'No se encontraron tickets que coincidan con la búsqueda'
                : 'No hay tickets disponibles'}
            </Text>
          </View>
        }
        contentContainerStyle={filteredTickets.length === 0 ? { flex: 1 } : null}
      />

      {/* Botón flotante para crear ticket */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleCreateTicket}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    color: '#d32f2f',
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  ticketItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
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
    marginBottom: 8,
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  ticketTypeBadge: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ticketTypeText: {
    fontSize: 12,
    color: '#666',
  },
  ticketInfo: {
    marginBottom: 8,
  },
  ticketUser: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ticketDate: {
    fontSize: 14,
    color: '#666',
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  ticketStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ticketStatusActive: {
    backgroundColor: '#e3f2fd',
  },
  ticketStatusUsed: {
    backgroundColor: '#ffebee',
  },
  ticketStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default TicketListScreen;