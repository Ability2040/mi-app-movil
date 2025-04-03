import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const API_URL = 'https://backend-app-events.onrender.com/api';

// Crear instancia de axios con URL base
const api = axios.create({
  baseURL: API_URL,
});

// Add this helper function at the top of your file, after imports
const logApiError = (endpoint, error) => {
  console.error(`API Error (${endpoint}):`, error.message);
  
  if (error.response) {
    console.log('Status:', error.response.status);
    console.log('Data:', error.response.data);
    console.log('Headers:', error.response.headers);
  } else if (error.request) {
    console.log('Request was made but no response received:', error.request);
  } else {
    console.log('Error setting up request:', error.message);
  }
  console.log('Config:', error.config);
};

// Interceptor para añadir token automáticamente a las peticiones
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Update your response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Si recibimos un 401 (no autorizado), podríamos limpiar el token y redirigir al login
    if (error.response && error.response.status === 401) {
      await AsyncStorage.removeItem('userToken');
      // La redirección al login se maneja en el contexto de autenticación
    }
    
    // Add debug logging for all API errors
    logApiError(error.config?.url || 'unknown', error);
    
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/users/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },
};

// Servicios para eventos
export const eventService = {
  getEvents: async () => {
    const response = await api.get('/events');
    return response.data;
  },

  getEvent: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  createEvent: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  updateEvent: async (id, eventData) => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  uploadLogo: async (id, formData) => {
    const response = await api.post(`/events/${id}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadMainImage: async (id, formData) => {
    const response = await api.post(`/events/${id}/mainImage`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadPhotos: async (id, formData) => {
    const response = await api.post(`/events/${id}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  addOperator: async (eventId, userId, role = "general", activities = []) => {
    const response = await api.post(`/events/${eventId}/operators`, { 
      userId, 
      role, 
      activities 
    });
    return response.data;
  },

  removeOperator: async (eventId, userId) => {
    const response = await api.delete(`/events/${eventId}/operators/${userId}`);
    return response.data;
  },

  addAssistant: async (eventId, userId) => {
    const response = await api.post(`/events/${eventId}/assistants`, { userId });
    return response.data;
  },

  removeAssistant: async (eventId, userId) => {
    const response = await api.delete(`/events/${eventId}/assistants/${userId}`);
    return response.data;
  },
};

// Servicios para actividades
export const activityService = {
  getActivities: async (eventId) => {
    try {
      // UPDATED: The correct endpoint has activities first, then events
      const response = await api.get(`/activities/events/${eventId}/activities`);
      return response.data;
    } catch (error) {
      logApiError(`/activities/events/${eventId}/activities`, error);
      throw error;
    }
  },

  getActivity: async (id) => {
    try {
      // This endpoint is correct for getting a single activity
      const response = await api.get(`/activities/${id}`);
      return response.data;
    } catch (error) {
      logApiError(`/activities/${id}`, error);
      throw error;
    }
  },

  createActivity: async (eventId, activityData) => {
    try {
      console.log('Creating activity with data:', activityData);
      
      // UPDATED: The correct endpoint has activities first, then events
      const response = await api.post(`/activities/events/${eventId}/activities`, activityData);
      return response.data;
    } catch (error) {
      logApiError(`/activities/events/${eventId}/activities`, error);
      throw error;
    }
  },

  updateActivity: async (id, activityData) => {
    try {
      // This endpoint is correct for updating an activity
      const response = await api.put(`/activities/${id}`, activityData);
      return response.data;
    } catch (error) {
      logApiError(`/activities/${id}`, error);
      throw error;
    }
  },

  deleteActivity: async (id) => {
    try {
      // This endpoint is correct for deleting an activity
      const response = await api.delete(`/activities/${id}`);
      return response.data;
    } catch (error) {
      logApiError(`/activities/${id}`, error);
      throw error;
    }
  },

  addWitness: async (activityId, userId) => {
    try {
      const response = await api.post(`/activities/${activityId}/witnesses`, { userId });
      return response.data;
    } catch (error) {
      logApiError(`/activities/${activityId}/witnesses`, error);
      throw error;
    }
  },

  removeWitness: async (activityId, userId) => {
    try {
      const response = await api.delete(`/activities/${activityId}/witnesses/${userId}`);
      return response.data;
    } catch (error) {
      logApiError(`/activities/${activityId}/witnesses/${userId}`, error);
      throw error;
    }
  },

  incrementSeats: async (id) => {
    try {
      const response = await api.put(`/activities/${id}/seats/increment`);
      return response.data;
    } catch (error) {
      logApiError(`/activities/${id}/seats/increment`, error);
      throw error;
    }
  },

  decrementSeats: async (id) => {
    try {
      const response = await api.put(`/activities/${id}/seats/decrement`);
      return response.data;
    } catch (error) {
      logApiError(`/activities/${id}/seats/decrement`, error);
      throw error;
    }
  },

  uploadMainImage: async (id, formData) => {
    try {
      const response = await api.post(`/activities/${id}/mainImage`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      logApiError(`/activities/${id}/mainImage`, error);
      throw error;
    }
  },

  uploadPhotos: async (id, formData) => {
    try {
      const response = await api.post(`/activities/${id}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      logApiError(`/activities/${id}/photos`, error);
      throw error;
    }
  },
};

// Servicios para tickets
export const ticketService = {
  getTickets: async () => {
    const response = await api.get('/tickets');
    return response.data;
  },

  getTicket: async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  getUserTickets: async (userId) => {
    const response = await api.get(`/tickets/user/${userId}`);
    return response.data;
  },

  getEventTickets: async (eventId) => {
    const response = await api.get(`/tickets/event/${eventId}`);
    return response.data;
  },

  createTicket: async (ticketData) => {
    console.log('Creating ticket with data:', ticketData);
    const response = await api.post('/tickets', ticketData);
    return response.data;
  },

  updateTicket: async (id, ticketData) => {
    const response = await api.put(`/tickets/${id}`, ticketData);
    return response.data;
  },

  deleteTicket: async (id) => {
    const response = await api.delete(`/tickets/${id}`);
    return response.data;
  },
};

// Servicios para calificaciones
export const ratingService = {
  getRatings: async (targetModel, targetId) => {
    const response = await api.get(`/califications/${targetModel}/${targetId}`);
    return response.data;
  },

  getRating: async (id) => {
    const response = await api.get(`/califications/${id}`);
    return response.data;
  },

  createRating: async (ratingData) => {
    // Log the data for debugging
    console.log('Sending to API:', ratingData);
    const response = await api.post('/califications', ratingData);
    return response.data;
  },

  updateRating: async (id, ratingData) => {
    const response = await api.put(`/califications/${id}`, ratingData);
    return response.data;
  },

  deleteRating: async (id) => {
    const response = await api.delete(`/califications/${id}`);
    return response.data;
  },
};

// Exportar instancia de API para uso directo si es necesario
export default api;

// Add at the end of your api.js file
export { default as photoService } from './photoService';