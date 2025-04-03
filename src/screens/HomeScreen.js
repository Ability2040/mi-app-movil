import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEvents } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import photoService from '../services/photoService';
import { ratingService } from '../services/api';

const EventCard = ({ event, onPress }) => {
  // Estados existentes
  const [mainImage, setMainImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  // Nuevo estado para calificaciones
  const [eventRating, setEventRating] = useState(0);
  const [loadingRating, setLoadingRating] = useState(true);
  
  // Cargamos la imagen desde AsyncStorage cuando el componente se monta
  useEffect(() => {
    const loadEventImage = async () => {
      try {
        if (event && event._id) {
          setImageLoading(true);
          const image = await photoService.getMainImage('Event', event._id);
          if (image && image.imageData) {
            console.log(`Imagen cargada desde AsyncStorage para evento ${event._id}`);
            setMainImage(image.imageData);
          } else {
            console.log(`No se encontró imagen en AsyncStorage para evento ${event._id}`);
          }
        }
      } catch (error) {
        console.error(`Error al cargar imagen para evento ${event._id}:`, error);
      } finally {
        setImageLoading(false);
      }
    };
    
    loadEventImage();
  }, [event]);

  // Nuevo useEffect para cargar calificaciones
  useEffect(() => {
    const fetchEventRating = async () => {
      try {
        if (event && event._id) {
          setLoadingRating(true);
          const response = await ratingService.getRatings('Event', event._id);
          
          if (response && response.stats && typeof response.stats.averageRating === 'number') {
            setEventRating(response.stats.averageRating);
          } else {
            setEventRating(0); // Valor por defecto
          }
        }
      } catch (error) {
        console.error(`Error al cargar calificaciones para evento ${event._id}:`, error);
        setEventRating(0);
      } finally {
        setLoadingRating(false);
      }
    };
    
    fetchEventRating();
  }, [event]);

  // Calcular estrellas en base a la calificación
  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating || 0);
    
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= roundedRating ? 'star' : 'star-outline'}
          size={18}
          color="#FFD700"
          style={styles.starIcon}
        />
      );
    }
    
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString('es-ES', options);
  };

  return (
    <TouchableOpacity style={styles.eventCard} onPress={onPress}>
      {imageLoading ? (
        <View style={[styles.eventImage, styles.loadingContainer]}>
          <ActivityIndicator size="small" color="#6c5ce7" />
        </View>
      ) : (
        <Image
          source={{ 
            uri: mainImage || event.mainImage || 'https://via.placeholder.com/400x200?text=Evento' 
          }}
          style={styles.eventImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{event.title || 'Título del evento'}</Text>
        <Text style={styles.eventSubtitle}>{event.subtitle || 'Subtítulo del evento'}</Text>
        
        {loadingRating ? (
          <View style={styles.starsContainer}>
            <ActivityIndicator size="small" color="#FFD700" />
          </View>
        ) : (
          renderStars(eventRating)
        )}
        
        <View style={styles.eventMetaContainer}>
          <View style={styles.eventMetaItem}>
            <Text style={styles.eventTime}>{formatDate(event.date) || '12:00 pm'}</Text>
          </View>
          <View style={styles.eventMetaItem}>
            <Text style={styles.eventLocation}>{event.location || 'Lugar'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen = ({ navigation }) => {
  const { events, isLoading, error, fetchEvents } = useEvents();
  const { userData } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Cargar eventos al montar el componente
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const loadEvents = async () => {
    await fetchEvents();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const handleEventPress = (event) => {
    navigation.navigate('EventDetail', { eventId: event._id });
  };

  // Renderizar botón flotante para crear evento (solo para admin u operador)
  const renderFloatingButton = () => {
    // Verificar si el usuario es admin u operador
    const canCreateEvent = userData && (userData.role === 'admin' || 
      (userData.permissions && userData.permissions.isOperator));
    
    if (canCreateEvent) {
      return (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate('CreateEvent')}>
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      );
    }
    return null;
  };

  // Renderizar loading o error
  if (isLoading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadEvents}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" />
      
      <View style={styles.header}>
        <Image
          source={require('../../assets/logo-placeholder.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Eventos</Text>
      </View>
      
      <FlatList
        data={events}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <EventCard 
            event={item} 
            onPress={() => handleEventPress(item)} 
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#6c5ce7']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay eventos disponibles</Text>
          </View>
        }
      />
      
      {renderFloatingButton()}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLogo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Espacio para el botón flotante
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  eventSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  starIcon: {
    marginRight: 2,
  },
  eventMetaContainer: {
    flexDirection: 'row',
  },
  eventMetaItem: {
    marginRight: 10,
  },
  eventTime: {
    backgroundColor: '#6c5ce7',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 14,
    overflow: 'hidden',
  },
  eventLocation: {
    backgroundColor: '#f0f0f0',
    color: '#666',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 14,
    overflow: 'hidden',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;