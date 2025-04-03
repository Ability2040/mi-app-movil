import React, { createContext, useState, useContext, useCallback } from 'react';
import { eventService, activityService } from '../services/api';
import photoService from '../services/photoService';

// Contexto para la gestión de eventos y actividades
export const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ratings, setRatings] = useState([]);

  // Cargar todos los eventos
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await eventService.getEvents();
      setEvents(data);
      return data;
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      setError('Error al cargar los eventos');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar un evento específico
  const fetchEvent = useCallback(async (eventId) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!eventId) {
        console.log('No eventId provided to fetchEvent');
        setError('ID de evento no proporcionado');
        return null;
      }
      
      const data = await eventService.getEvent(eventId);
      if (!data) {
        setError('No se encontró el evento');
        return null;
      }
      
      setCurrentEvent(data);
      return data;
    } catch (error) {
      console.error(`Error al cargar evento id=${eventId}:`, error);
      setError('Error al cargar el evento');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar actividades de un evento
  const fetchActivities = useCallback(async (eventId) => {
    try {
      if (!eventId) {
        console.log('No eventId provided to fetchActivities');
        return;
      }
      
      try {
        const response = await activityService.getActivities(eventId);
        if (response) {
          setActivities(response);
        } else {
          setActivities([]);
        }
      } catch (error) {
        // If the endpoint returns 404, it means there are no activities yet
        if (error.response && error.response.status === 404) {
          console.log('No activities found for this event');
          setActivities([]);
        } else {
          console.error('Error al cargar actividades:', error);
          setError('Error al cargar actividades');
          setActivities([]);
        }
      }
    } catch (error) {
      console.error('Error general al cargar actividades:', error);
      setError('Error al cargar actividades');
      setActivities([]);
    }
  }, []);

  // Obtener un evento específico (sin actualizar estado)
  const getEvent = useCallback(async (eventId) => {
    try {
      if (!eventId) return null;
      return await eventService.getEvent(eventId);
    } catch (error) {
      console.error(`Error al obtener evento id=${eventId}:`, error);
      setError('Error al obtener la información del evento');
      return null;
    }
  }, []);

  // Crear un nuevo evento
  const createEvent = async (eventData, mainImage, logo) => {
    setIsLoading(true);
    setError(null);
    try {
      // Create the event first
      const newEvent = await eventService.createEvent(eventData);
      
      // Upload the main image if provided
      if (mainImage && newEvent && newEvent._id) {
        try {
          await photoService.setMainImage('Event', newEvent._id, mainImage);
          console.log('Successfully uploaded main image for event');
        } catch (imageError) {
          console.error('Error uploading event image:', imageError);
          console.log('Error details:', imageError.message);
        }
      }
      
      // Upload the logo if provided
      if (logo && newEvent && newEvent._id) {
        try {
          // Usar el nuevo método específico para logos
          await photoService.setLogo('Event', newEvent._id, logo);
          console.log('Successfully uploaded logo for event');
        } catch (logoError) {
          console.error('Error uploading event logo:', logoError);
        }
      }
      
      // Update the local state
      setEvents([newEvent, ...events]);
      return newEvent;
    } catch (error) {
      console.error('Error al crear evento:', error);
      setError('Error al crear el evento');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Actualizar un evento existente (sin las imágenes)
  const updateEvent = async (eventId, eventData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Actualizar los datos del evento
      const updatedEvent = await eventService.updateEvent(eventId, eventData);

      // Actualizar el evento en el estado
      if (currentEvent && currentEvent._id === eventId) {
        setCurrentEvent(updatedEvent);
      }

      // Actualizar la lista de eventos si está cargada
      if (events.length > 0) {
        setEvents(
          events.map((event) => (event._id === eventId ? updatedEvent : event))
        );
      }

      return updatedEvent;
    } catch (error) {
      console.error(`Error al actualizar evento id=${eventId}:`, error);
      setError('Error al actualizar el evento');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar un evento
  const deleteEvent = async (eventId) => {
    setIsLoading(true);
    setError(null);
    try {
      await eventService.deleteEvent(eventId);
      // Actualizar el estado eliminando el evento
      setEvents(events.filter((event) => event._id !== eventId));
      if (currentEvent && currentEvent._id === eventId) {
        setCurrentEvent(null);
      }
      return true;
    } catch (error) {
      console.error(`Error al eliminar evento id=${eventId}:`, error);
      setError('Error al eliminar el evento');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Crear una actividad para un evento
  const createActivity = async (eventId, activityData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Log the data being sent for debugging
      console.log('Creating activity with data:', activityData);
      
      const newActivity = await activityService.createActivity(
        eventId,
        activityData
      );
      
      // Update the state by adding the new activity
      setActivities([...activities, newActivity]);
      return newActivity;
    } catch (error) {
      console.error(
        `Error al crear actividad para evento id=${eventId}:`,
        error
      );
      
      // More detailed error logging
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Data:', error.response.data);
      }
      
      setError('Error al crear la actividad');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar una actividad
  const updateActivity = async (activityId, activityData) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedActivity = await activityService.updateActivity(
        activityId,
        activityData
      );
      // Actualizar el estado reemplazando la actividad actualizada
      setActivities(
        activities.map((activity) =>
          activity._id === activityId ? updatedActivity : activity
        )
      );
      return updatedActivity;
    } catch (error) {
      console.error(`Error al actualizar actividad id=${activityId}:`, error);
      setError('Error al actualizar la actividad');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar una actividad
  const deleteActivity = async (activityId) => {
    setIsLoading(true);
    setError(null);
    try {
      await activityService.deleteActivity(activityId);
      // Actualizar el estado eliminando la actividad
      setActivities(
        activities.filter((activity) => activity._id !== activityId)
      );
      return true;
    } catch (error) {
      console.error(`Error al eliminar actividad id=${activityId}:`, error);
      setError('Error al eliminar la actividad');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Gestión de operadores y asistentes
  const addOperator = async (eventId, userId, role = "general", activities = []) => {
    try {
      await eventService.addOperator(eventId, userId, role, activities);
      await fetchEvent(eventId); // Recargar el evento para actualizar la lista de operadores
      return true;
    } catch (error) {
      console.error(
        `Error al añadir operador al evento id=${eventId}:`,
        error
      );
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', error.response.data);
      }
      setError('Error al añadir el operador');
      return false;
    }
  };

  const removeOperator = async (eventId, userId) => {
    try {
      await eventService.removeOperator(eventId, userId);
      await fetchEvent(eventId); // Reload event to update operators list
      return true;
    } catch (error) {
      console.error(
        `Error al eliminar operador del evento id=${eventId}:`,
        error
      );
      setError('Error al eliminar el operador');
      return false;
    }
  };

  const addAssistant = async (eventId, userId) => {
    try {
      await eventService.addAssistant(eventId, userId);
      await fetchEvent(eventId); // Recargar el evento para actualizar la lista de asistentes
      return true;
    } catch (error) {
      console.error(
        `Error al añadir asistente al evento id=${eventId}:`,
        error
      );
      setError('Error al añadir el asistente');
      return false;
    }
  };

  const removeAssistant = async (eventId, userId) => {
    try {
      await eventService.removeAssistant(eventId, userId);
      await fetchEvent(eventId); // Recargar el evento para actualizar la lista de asistentes
      return true;
    } catch (error) {
      console.error(
        `Error al eliminar asistente del evento id=${eventId}:`,
        error
      );
      setError('Error al eliminar el asistente');
      return false;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const contextValue = {
    events,
    currentEvent,
    activities,
    ratings,
    isLoading,
    error,
    fetchEvents,
    fetchEvent,
    fetchActivities,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    createActivity,
    updateActivity,
    deleteActivity,
    addOperator,
    removeOperator,
    addAssistant,
    removeAssistant,
    clearError,
  };

  return (
    <EventContext.Provider value={contextValue}>
      {children}
    </EventContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents debe ser usado dentro de un EventProvider');
  }
  return context;
};

// Look for code like this in your services
const getRating = async (eventId, userId) => {
  try {
    const response = await api.get(`/events/${eventId}/ratings/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener calificación:', error);
    throw error;
  }
};
