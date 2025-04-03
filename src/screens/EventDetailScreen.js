import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEvents } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { ratingService, ticketService, activityService, eventService } from '../services/api';
import photoService from '../services/photoService';
import RatingForm from '../components/RatingForm';
import RatingsList from '../components/RatingsList';
import * as ImagePicker from 'expo-image-picker';

const EventDetailScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const {
    currentEvent,
    activities,
    isLoading,
    error,
    fetchEvent,
    fetchActivities,
    addAssistant,
    deleteEvent,
    removeOperator,
    removeAssistant,
  } = useEvents();
  const { userData } = useAuth();
  const [userRating, setUserRating] = useState(0);
  const [userRatingId, setUserRatingId] = useState(null);
  const [userComment, setUserComment] = useState('');
  const [loadingRating, setLoadingRating] = useState(false);
  const [selectedTab, setSelectedTab] = useState('event');
  const [allRatings, setAllRatings] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [operators, setOperators] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userTickets, setUserTickets] = useState(null);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [eventTickets, setEventTickets] = useState([]);
  const [loadingEventTickets, setLoadingEventTickets] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [eventPhotos, setEventPhotos] = useState([]);

  const [mainImage, setMainImage] = useState(null);

  const fetchMainImage = async () => {
    try {
      const image = await photoService.getMainImage('Event', eventId);
      
      if (image && image.imageData) {
        console.log('Setting main image from AsyncStorage');
        setMainImage(image.imageData);
      } else {
        console.log('No image data found in AsyncStorage');
      }
    } catch (error) {
      console.error('Error fetching main event image:', error);
    }
  };

  // Call this in useEffect
useEffect(() => {
  if (eventId) {
    fetchMainImage();
    fetchEventPhotos();
  }
}, [eventId]);

  

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  useEffect(() => {
    if (userData && currentEvent) {
      fetchUserRating();
    }
  }, [userData, currentEvent]);

  useEffect(() => {
    if (currentEvent) {
      fetchEventUsers();
    }
  }, [currentEvent]);

  useEffect(() => {
    if (userData && eventId) {
      fetchUserTicketsForEvent();
    }
  }, [userData, eventId]);

  const fetchEventTickets = async () => {
    try {
      setLoadingEventTickets(true);
      const tickets = await ticketService.getEventTickets(eventId);
      setEventTickets(tickets);
    } catch (error) {
      console.error('Error fetching event tickets:', error);
    } finally {
      setLoadingEventTickets(false);
    }
  };

  useEffect(() => {
    if (selectedTab === 'tickets') {
      fetchEventTickets();
    }
  }, [selectedTab]);

  const fetchEventPhotos = async () => {
    try {
      const photos = await photoService.getEntityPhotos('Event', eventId);
      setEventPhotos(photos);
    } catch (error) {
      console.error('Error fetching event photos:', error);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEventPhotos();
    }
  }, [eventId]);

  const loadEventData = async () => {
    try {
      const eventData = await fetchEvent(eventId);
      if (eventData) {
        await fetchActivities(eventId);
      }
    } catch (err) {
      console.error("Error loading event data:", err);
    }
  };

  const fetchUserRating = async () => {
    try {
      setLoadingRating(true);
      if (!eventId) return;

      const response = await ratingService.getRatings('Event', eventId);

      if (response && response.califications && Array.isArray(response.califications)) {
        setAllRatings(response.califications);
        setRatingStats(response.stats);

        if (userData) {
          const userRatingData = response.califications.find(
            (rating) => rating.calificator && rating.calificator._id === userData._id
          );

          if (userRatingData) {
            setUserRatingId(userRatingData._id);
            setUserRating(userRatingData.rating);
            setUserComment(userRatingData.comment || '');
          }
        }
      } else {
        console.log('No ratings found or invalid response format');
      }
    } catch (error) {
      console.error('Error al obtener calificación:', error);
    } finally {
      setLoadingRating(false);
    }
  };

  const fetchEventUsers = async () => {
    try {
      setLoadingUsers(true);
      if (!currentEvent) return;

      console.log('Event details:', currentEvent);
      console.log('Operators in event:', currentEvent.operators);

      if (currentEvent.operators && Array.isArray(currentEvent.operators)) {
        console.log('Operators array length:', currentEvent.operators.length);
        if (currentEvent.operators.length > 0) {
          console.log('First operator details:', currentEvent.operators[0]);
        }
        setOperators(currentEvent.operators);
      } else if (currentEvent.operators) {
        console.log('Operators is not an array, type:', typeof currentEvent.operators);
        setOperators([]);
      } else {
        console.log('No operators field in event');
        setOperators([]);
      }

      console.log('Assistants in event:', currentEvent.assistants);
      if (currentEvent.assistants && Array.isArray(currentEvent.assistants)) {
        setAssistants(currentEvent.assistants);
      } else {
        setAssistants([]);
      }
    } catch (error) {
      console.error('Error fetching event users:', error);
      setOperators([]);
      setAssistants([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchUserTicketsForEvent = async () => {
    try {
      setLoadingTickets(true);
      const allUserTickets = await ticketService.getUserTickets(userData._id);

      const eventTickets = allUserTickets.filter(
        ticket => ticket.event && ticket.event._id === eventId
      );

      setUserTickets(eventTickets);
    } catch (error) {
      console.error('Error fetching user tickets for event:', error);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleRate = async (rating, comment = '') => {
    try {
      setLoadingRating(true);

      if (!userData || !userData._id) {
        Alert.alert('Error', 'Debes iniciar sesión para calificar');
        return;
      }

      const ratingData = {
        rating: rating,
        target: eventId,
        targetModel: 'Event',
        comment: comment || userComment || ''
      };

      let result;
      if (userRatingId) {
        result = await ratingService.updateRating(userRatingId, ratingData);
        Alert.alert('¡Gracias!', 'Tu calificación ha sido actualizada.');
      } else {
        result = await ratingService.createRating(ratingData);
        if (result && result._id) {
          setUserRatingId(result._id);
        }
        Alert.alert('¡Gracias por tu calificación!');
      }

      setUserRating(rating);
      setUserComment(comment || userComment);

      await fetchEvent(eventId);

    } catch (error) {
      console.error('Error al calificar:', error);

      if (error.response) {
        if (error.response.data.message?.includes('no eres participante')) {
          Alert.alert(
            'Error',
            'Debes ser participante del evento para calificarlo. ¿Deseas registrarte como asistente?',
            [
              {
                text: 'Sí',
                onPress: async () => {
                  try {
                    const result = await addAssistant(eventId, userData._id);
                    if (result) {
                      Alert.alert('¡Registro exitoso!', 'Ahora puedes calificar el evento.');
                    }
                  } catch (err) {
                    console.error('Error al registrar como asistente:', err);
                    Alert.alert('Error', 'No se pudo registrarte como asistente.');
                  }
                }
              },
              { text: 'No', style: 'cancel' }
            ]
          );
          return;
        } else if (error.response.data.message?.includes('Ya has calificado')) {
          Alert.alert('Info', 'Ya has calificado este evento. Puedes actualizar tu calificación.');
          await fetchUserRating();
          return;
        }
      }

      Alert.alert('Error', 'No se pudo guardar tu calificación');
    } finally {
      setLoadingRating(false);
    }
  };


  const handleAddPhoto = async () => {
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
        setLoadingPhotos(true);
        
        try {
          await photoService.uploadPhoto('Event', eventId, result.assets[0]);
          fetchEventPhotos(); // Reload photos
          Alert.alert('Éxito', 'Foto añadida correctamente');
        } catch (error) {
          console.error('Error al subir foto:', error);
          Alert.alert('Error', 'No se pudo subir la foto: ' + (error.message || 'Error desconocido'));
        } finally {
          setLoadingPhotos(false);
        }
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };
  
  const handleGetTicket = async () => {
    try {
      if (!userData) {
        Alert.alert('Error', 'Debes iniciar sesión para obtener un ticket');
        return;
      }

      console.log('Creating ticket with user ID:', userData._id);
      console.log('Creating ticket for event ID:', eventId);

      const ticketData = {
        title: 'Entrada General',
        event: eventId,
        user: userData._id,
        price: 0,
        role: 'assistente',
        activities: []
      };

      console.log('Sending ticket data:', ticketData);

      await ticketService.createTicket(ticketData);

      Alert.alert(
        'Éxito',
        'Has obtenido un ticket para este evento',
        [
          {
            text: 'Ver mis tickets',
            onPress: () => navigation.navigate('ProfileScreen')
          },
          {
            text: 'OK',
            onPress: () => fetchUserTicketsForEvent()
          }
        ]
      );

    } catch (error) {
      console.error('Error al crear ticket:', error);

      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', error.response.data);

        const errorMessage = error.response.data?.message || 'No se pudo obtener el ticket para este evento';
        Alert.alert('Error', errorMessage);
      } else {
        Alert.alert('Error', 'No se pudo obtener el ticket para este evento');
      }
    }
  };

  const canEditEvent = () => {
    if (!userData || !currentEvent) return false;

    const isAdmin = userData.role === 'admin';
    const isOperator = userData.permissions?.isOperator;
    const isEventOperator = currentEvent.operators?.some(
      (op) => op._id === userData._id
    );

    return isAdmin || (isOperator && isEventOperator);
  };

  const isAdmin = () => userData && userData.role === 'admin';

  const isAdminOrOperator = () => {
    if (!userData) return false;

    if (userData.role === 'admin') return true;

    if (currentEvent && currentEvent.operators) {
      return currentEvent.operators.some(op => op._id === userData._id);
    }

    return false;
  };

  const renderRatingStars = (currentRating, onRatingPress) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onRatingPress && onRatingPress(star)}
            disabled={!onRatingPress || loadingRating}>
            <Ionicons
              name={star <= currentRating ? 'star' : 'star-outline'}
              size={24}
              color="#FFD700"
              style={styles.starIcon}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderTabs = () => {
    const tabs = [
      { id: 'event', label: 'Información' },
    ];

    if (activities && activities.length > 0) {
      activities.forEach((activity) => {
        tabs.push({
          id: activity._id,
          label: activity.title || 'Actividad',
        });
      });
    }

    if (isAdminOrOperator()) {
      tabs.push({ id: 'operators', label: 'Operadores' });
      tabs.push({ id: 'assistants', label: 'Asistentes' });
      tabs.push({ id: 'tickets', label: 'Tickets' });
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              selectedTab === tab.id && styles.selectedTab
            ]}
            onPress={() => setSelectedTab(tab.id)}>
            <Text style={[
              styles.tabText,
              selectedTab === tab.id && styles.selectedTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderContent = () => {
    if (selectedTab !== 'event' && selectedTab !== 'operators' &&
      selectedTab !== 'assistants' && selectedTab !== 'tickets') {
      const selectedActivity = activities.find(a => a._id === selectedTab);
      if (selectedActivity) {
        return renderActivityContent(selectedActivity);
      }
    }

    switch (selectedTab) {
      case 'event':
        return renderEventContent();
      case 'operators':
        return renderOperators();
      case 'assistants':
        return renderAssistants();
      case 'tickets':
        return renderTickets();
      default:
        return renderEventContent();
    }
  };

  const renderEventContent = () => {
    return (
      <View>
        {canEditEvent() && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateActivity', { eventId })}>
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Crear Actividad</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.description}>
          {currentEvent?.description || 'Descripción del evento'}
        </Text>

        {(!activities || activities.length === 0) && (
          <View style={styles.noActivitiesContainer}>
            <Text style={styles.noActivitiesText}>
              Este evento aún no tiene actividades programadas
            </Text>
          </View>
        )}
{eventPhotos && eventPhotos.length > 0 ? (
  <View style={styles.photosSection}>
    <Text style={styles.sectionTitle}>Fotos del evento</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {eventPhotos.map((photo, index) => (
        <Image
          key={index}
          source={{ uri: photo.imageData }}
          style={styles.eventPhoto}
          resizeMode="cover"
        />
      ))}
    </ScrollView>
    {isAdmin() && (
      <TouchableOpacity
        style={styles.addPhotoButton}
        onPress={handleAddPhoto}
        disabled={loadingPhotos}>
        {loadingPhotos ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="add-circle-outline" size={16} color="#fff" />
            <Text style={styles.addPhotoButtonText}>Añadir foto</Text>
          </>
        )}
      </TouchableOpacity>
    )}
  </View>
) : (
  <View style={styles.photosSection}>
    <Text style={styles.sectionTitle}>Fotos del evento</Text>
    <Text style={styles.emptyText}>No hay fotos para este evento</Text>
    {isAdmin() && (
      <TouchableOpacity
        style={styles.addPhotoButton}
        onPress={handleAddPhoto}
        disabled={loadingPhotos}>
        {loadingPhotos ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="add-circle-outline" size={16} color="#fff" />
            <Text style={styles.addPhotoButtonText}>Añadir foto</Text>
          </>
        )}
      </TouchableOpacity>
    )}
  </View>
)}
        {currentEvent?.operators && currentEvent.operators.length > 0 && (
          <View style={styles.operatorsSection}>
            <Text style={styles.sectionTitle}>Operadores</Text>
            {currentEvent.operators.map((operator, index) => (
              <Text key={index} style={styles.operatorItem}>
                {operator.name || `Operador ${index + 1}`}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.ticketsSection}>
          <Text style={styles.sectionTitle}>Tickets</Text>

          {!userData ? (
            <View style={styles.ticketMessage}>
              <Text style={styles.ticketMessageText}>
                Inicia sesión para obtener tickets para este evento
              </Text>
            </View>
          ) : userTickets ? (
            userTickets.length > 0 ? (
              <View>
                <Text style={styles.ticketInfo}>
                  Ya tienes {userTickets.length} ticket{userTickets.length !== 1 ? 's' : ''} para este evento
                </Text>
                <TouchableOpacity
                  style={styles.viewTicketsButton}
                  onPress={() => navigation.navigate('TicketList', {
                    screen: 'ProfileScreen',
                    initial: false
                  })}>
                  <Text style={styles.viewTicketsButtonText}>Ver mis tickets</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.ticketButton}
                onPress={handleGetTicket}>
                <Text style={styles.ticketButtonText}>Obtener Ticket</Text>
              </TouchableOpacity>
            )
          ) : (
            <ActivityIndicator size="small" color="#6c5ce7" />
          )}
        </View>

        {userData && (
          <RatingForm
            initialRating={userRating}
            initialComment={userComment}
            onSubmit={handleRate}
            isReadOnly={false}
            isLoading={loadingRating}
          />
        )}

        <RatingsList ratings={allRatings} stats={ratingStats} />
      </View>
    );
  };

  const renderActivityContent = (activity) => {
    return (
      <View>
        <Text style={styles.description}>
          {activity.description || 'Descripción de la actividad'}
        </Text>

        <View style={styles.activityInfoSection}>
          <View style={styles.activityInfoItem}>
            <Text style={styles.activityInfoLabel}>Capacidad:</Text>
            <Text style={styles.activityInfoValue}>
              {activity.seats || 0} personas
            </Text>
          </View>

          <View style={styles.activityInfoItem}>
            <Text style={styles.activityInfoLabel}>Asientos ocupados:</Text>
            <Text style={styles.activityInfoValue}>
              {activity.takenSeats || 0}
            </Text>
          </View>

          <View style={styles.activityInfoItem}>
            <Text style={styles.activityInfoLabel}>Disponibilidad:</Text>
            <Text style={styles.activityInfoValue}>
              {activity.seats && (activity.takenSeats || activity.takenSeats === 0)
                ? activity.seats - activity.takenSeats
                : 'No disponible'}
            </Text>
          </View>

          <View style={styles.activityInfoItem}>
            <Text style={styles.activityInfoLabel}>Lugar:</Text>
            <Text style={styles.activityInfoValue}>
              {activity.place || 'No especificado'}
            </Text>
          </View>

          <View style={styles.activityInfoItem}>
            <Text style={styles.activityInfoLabel}>Fecha:</Text>
            <Text style={styles.activityInfoValue}>
              {activity.date ? new Date(activity.date).toLocaleDateString('es-ES') : 'No especificada'}
            </Text>
          </View>

          <View style={styles.activityInfoItem}>
            <Text style={styles.activityInfoLabel}>Hora:</Text>
            <Text style={styles.activityInfoValue}>
              {activity.time || 'No especificada'}
            </Text>
          </View>
        </View>

        {activity.photos && activity.photos.length > 0 && (
          <View style={styles.photosSection}>
            <Text style={styles.sectionTitle}>Fotos de la actividad</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {activity.photos.map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={styles.eventPhoto}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {activity.witnesses && activity.witnesses.length > 0 && (
          <View style={styles.witnessesSection}>
            <Text style={styles.sectionTitle}>Testigos</Text>
            {activity.witnesses.map((witness, index) => (
              <Text key={index} style={styles.witnessItem}>
                {witness.name || `Testigo ${index + 1}`}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderTickets = () => {
    return (
      <View style={styles.userSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tickets del Evento</Text>
          {isAdmin() && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('CreateTicket', {
                preSelectedEventId: eventId
              })}>
              <Ionicons name="add-circle-outline" size={24} color="#6c5ce7" />
              <Text style={styles.addButtonText}>Crear Ticket</Text>
            </TouchableOpacity>
          )}
        </View>

        {loadingEventTickets ? (
          <ActivityIndicator size="small" color="#6c5ce7" />
        ) : eventTickets && eventTickets.length > 0 ? (
          <View style={styles.userListContainer}>
            {eventTickets.map((ticket) => (
              <TouchableOpacity
                key={ticket._id}
                style={styles.ticketItem}
                onPress={() => navigation.navigate('TicketDetail', { ticketId: ticket._id })}>
                <View style={styles.ticketItemContent}>
                  <View>
                    <Text style={styles.ticketItemUser}>
                      Usuario: {ticket.user?.name || 'Usuario no asignado'}
                    </Text>
                    <Text style={styles.ticketItemType}>
                      Tipo: {ticket.type || 'General'}
                    </Text>
                    <Text style={styles.ticketItemDate}>
                      Fecha: {new Date(ticket.createdAt).toLocaleDateString('es-ES')}
                    </Text>
                  </View>
                  <View style={[
                    styles.ticketStatusBadge,
                    ticket.isUsed ? styles.usedTicketBadge : styles.activeTicketBadge
                  ]}>
                    <Text style={styles.ticketStatusText}>
                      {ticket.isUsed ? 'Usado' : 'Activo'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No hay tickets para este evento</Text>
        )}
      </View>
    );
  };

  const renderOperators = () => {
    return (
      <View style={styles.userSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Operadores del Evento</Text>
          {isAdmin() && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddOperator', { eventId })}>
              <Ionicons name="add-circle-outline" size={24} color="#6c5ce7" />
              <Text style={styles.addButtonText}>Agregar</Text>
            </TouchableOpacity>
          )}
        </View>

        {loadingUsers ? (
          <ActivityIndicator size="small" color="#6c5ce7" />
        ) : operators && operators.length > 0 ? (
          <View style={styles.userListContainer}>
            {operators.map((item, index) => {
              const userData = item.user || {};

              return (
                <View key={item._id || `op-${index}`} style={styles.userCard}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{userData.name || 'Operador'}</Text>
                    <Text style={styles.userEmail}>{userData.email || ''}</Text>
                  </View>
                  {isAdmin() && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => confirmRemoveOperator(item)}>
                      <Ionicons name="close-circle-outline" size={24} color="#ff4757" />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.emptyText}>No hay operadores asignados</Text>
        )}
      </View>
    );
  };

  const renderAssistants = () => {
    return (
      <View style={styles.userSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Asistentes del Evento</Text>
          {isAdmin() && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddAssistant', { eventId })}>
              <Ionicons name="add-circle-outline" size={24} color="#6c5ce7" />
              <Text style={styles.addButtonText}>Agregar</Text>
            </TouchableOpacity>
          )}
        </View>

        {loadingUsers ? (
          <ActivityIndicator size="small" color="#6c5ce7" />
        ) : assistants && assistants.length > 0 ? (
          <View style={styles.userListContainer}>
            {assistants.map(item => (
              <View key={item._id} style={styles.userCard}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                </View>
                {isAdmin() && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => confirmRemoveAssistant(item)}>
                    <Ionicons name="close-circle-outline" size={24} color="#ff4757" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No hay asistentes registrados</Text>
        )}
      </View>
    );
  };

  const confirmRemoveOperator = (operator) => {
    const operatorUser = operator.user || {};
    const operatorName = operatorUser.name || 'este operador';
    const operatorId = operatorUser._id;

    if (!operatorId) {
      Alert.alert('Error', 'No se pudo identificar el ID del operador');
      return;
    }

    Alert.alert(
      'Eliminar Operador',
      `¿Estás seguro de eliminar a ${operatorName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => handleRemoveOperator(operatorId)
        }
      ]
    );
  };

  const confirmRemoveAssistant = (assistant) => {
    Alert.alert(
      'Eliminar Asistente',
      `¿Estás seguro de eliminar a ${assistant.name} como asistente?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => handleRemoveAssistant(assistant._id)
        }
      ]
    );
  };

  const handleRemoveOperator = async (userId) => {
    try {
      console.log('Removing operator with ID:', userId);
      if (!userId) {
        console.error('Cannot remove operator: userId is undefined');
        Alert.alert('Error', 'ID de operador no válido');
        return;
      }

      const result = await removeOperator(eventId, userId);
      console.log('Remove operator result:', result);

      await loadEventData();
      await fetchEventUsers();

      Alert.alert('Éxito', 'Operador eliminado correctamente');
    } catch (error) {
      console.error('Error removing operator:', error);

      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', error.response.data);
      }

      Alert.alert('Error', 'No se pudo eliminar el operador');
    }
  };

  const handleRemoveAssistant = async (userId) => {
    try {
      await removeAssistant(eventId, userId);
      fetchEventUsers();
      Alert.alert('Éxito', 'Asistente eliminado correctamente');
    } catch (error) {
      console.error('Error removing assistant:', error);
      Alert.alert('Error', 'No se pudo eliminar el asistente');
    }
  };

  const renderActionButtons = () => {
    if (!canEditEvent()) return null;

    const isAdmin = userData && userData.role === 'admin';
    const isActivityTab = selectedTab !== 'event' && selectedTab !== 'operators' &&
      selectedTab !== 'assistants' && selectedTab !== 'tickets';

    return (
      <View style={styles.actionButtonsContainer}>
        {selectedTab === 'event' ? (
          <>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('EditEvent', { eventId })}>
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.editButtonText}>Editar evento</Text>
            </TouchableOpacity>

            {isAdmin && (
              <TouchableOpacity
                style={[styles.editButton, styles.deleteButton]}
                onPress={confirmDeleteEvent}>
                <Ionicons name="trash-outline" size={20} color="#fff" />
                <Text style={styles.editButtonText}>Eliminar</Text>
              </TouchableOpacity>
            )}
          </>
        ) : isActivityTab ? (
          <>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                const activity = activities.find(a => a._id === selectedTab);
                if (activity) {
                  navigation.navigate('EditActivity', {
                    eventId,
                    activityId: activity._id,
                  });
                }
              }}>
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.editButtonText}>Editar actividad</Text>
            </TouchableOpacity>

            {isAdmin && (
              <TouchableOpacity
                style={[styles.editButton, styles.deleteButton]}
                onPress={() => confirmDeleteActivity(selectedTab)}>
                <Ionicons name="trash-outline" size={20} color="#fff" />
                <Text style={styles.editButtonText}>Eliminar</Text>
              </TouchableOpacity>
            )}
          </>
        ) : null}
      </View>
    );
  };

  const confirmDeleteActivity = (activityId) => {
    Alert.alert(
      'Eliminar Actividad',
      '¿Estás seguro que deseas eliminar esta actividad? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => handleDeleteActivity(activityId)
        }
      ],
      { cancelable: true }
    );
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      await activityService.deleteActivity(activityId);

      await fetchActivities(eventId);
      setSelectedTab('event');

      Alert.alert('Éxito', 'La actividad ha sido eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar actividad:', error);

      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Data:', error.response.data);
      }

      Alert.alert('Error', 'No se pudo eliminar la actividad. Inténtalo de nuevo.');
    }
  };

  const confirmDeleteEvent = () => {
    Alert.alert(
      'Eliminar Evento',
      '¿Estás seguro que deseas eliminar este evento? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: handleDeleteEvent
        }
      ],
      { cancelable: true }
    );
  };

  const handleDeleteEvent = async () => {
    try {
      const result = await deleteEvent(eventId);

      if (result) {
        Alert.alert(
          'Éxito',
          'El evento ha sido eliminado correctamente',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', 'No se pudo eliminar el evento. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      Alert.alert('Error', 'No se pudo eliminar el evento. Inténtalo de nuevo.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadEventData}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentEvent) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No se encontró el evento</Text>
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
      <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" />
  
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
  
        <Image
          source={{
            uri: mainImage || 
                (currentEvent && currentEvent.mainImage) ||
                'https://via.placeholder.com/400x200?text=Evento',
          }}
          style={styles.headerImage}
          resizeMode="cover"
        />
        </View>

        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              {currentEvent.title || 'Título del evento'}
            </Text>
            <Text style={styles.subtitle}>
              {currentEvent.subtitle || 'Subtítulo del evento'}
            </Text>
          </View>

          <View style={styles.ratingSection}>
            {renderRatingStars(currentEvent.rating || 0)}

            <View style={styles.userRatingContainer}>
              <Text style={styles.userRatingTitle}>
                {userRating > 0
                  ? '¡Gracias por tu calificación!'
                  : '¡Califícanos!'}
              </Text>
              {loadingRating ? (
                <ActivityIndicator size="small" color="#6c5ce7" />
              ) : (
                renderRatingStars(userRating, handleRate)
              )}
            </View>
          </View>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              {currentEvent?.date && (
                <Text style={styles.metaTime}>
                  {new Date(currentEvent.date).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              )}
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLocation}>
                {currentEvent.location || 'Lugar'}
              </Text>
            </View>
          </View>

          {renderTabs()}

          <View style={styles.tabContent}>{renderContent()}</View>
        </View>
      </ScrollView>

      {renderActionButtons()}
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
    position: 'relative',
    height: 200,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 16,
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  ratingSection: {
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  starIcon: {
    marginRight: 4,
  },
  userRatingContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userRatingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  metaItem: {
    marginRight: 12,
  },
  metaTime: {
    backgroundColor: '#6c5ce7',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    overflow: 'hidden',
  },
  metaLocation: {
    backgroundColor: '#f0f0f0',
    color: '#666',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    overflow: 'hidden',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTab: {
    backgroundColor: '#6c5ce7',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  selectedTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tabContent: {
    paddingVertical: 8,
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 20,
  },
  photosSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  eventPhoto: {
    width: 150,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  operatorsSection: {
    marginBottom: 20,
  },
  operatorItem: {
    fontSize: 16,
    color: '#444',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  ticketsSection: {
    marginBottom: 20,
  },
  ticketMessage: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  ticketMessageText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  ticketInfo: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  viewTicketsButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewTicketsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  ticketButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  ticketButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  activityInfoSection: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activityInfoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  activityInfoValue: {
    fontSize: 16,
    color: '#666',
  },
  witnessesSection: {
    marginBottom: 20,
  },
  witnessItem: {
    fontSize: 16,
    color: '#444',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#6c5ce7',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  deleteButton: {
    backgroundColor: '#ff4757',
    marginLeft: 10,
  },
  noContentContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noContentText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  noActivitiesContainer: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  noActivitiesText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  userSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    color: '#6c5ce7',
    marginLeft: 4,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedTab: {
    backgroundColor: '#6c5ce7',
  },
  tabText: {
    fontSize: 14,
    color: '#333',
  },
  selectedTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    color: '#6c5ce7',
    marginLeft: 4,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    padding: 4,
  },
  userList: {
    maxHeight: 300,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  createButton: {
    backgroundColor: '#6c5ce7',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    alignItems: 'center',
    marginBottom: 16,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  userListContainer: {
    marginTop: 8,
  },
  ticketItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ticketItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  ticketItemUser: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  ticketItemType: {
    fontSize: 14,
    color: '#666',
  },
  ticketItemDate: {
    fontSize: 14,
    color: '#666',
  },
  ticketStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  usedTicketBadge: {
    backgroundColor: '#ff4757',
  },
  activeTicketBadge: {
    backgroundColor: '#2ed573',
  },
  ticketStatusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  ticketItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ticketItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketItemUser: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ticketItemType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ticketItemDate: {
    fontSize: 14,
    color: '#666',
  },
  ticketStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  usedTicketBadge: {
    backgroundColor: '#ffebee',
  },
  activeTicketBadge: {
    backgroundColor: '#e8f5e9',
  },
  ticketStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  addPhotoButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    alignSelf: 'flex-end',
  },
  addPhotoButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default EventDetailScreen;
