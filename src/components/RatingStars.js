import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ratingService from './ratingService'; // Import the rating service
import { fetchEvent } from './eventService'; // Import the event service

/**
 * Componente RatingStars reutilizable para mostrar y/o seleccionar calificación por estrellas
 * @param {number} rating - Valor de la calificación (1-5)
 * @param {function} onRatingChange - Función que se ejecuta al seleccionar una calificación
 * @param {boolean} readOnly - Modo solo lectura
 * @param {number} size - Tamaño de las estrellas
 * @param {string} activeColor - Color de las estrellas activas
 * @param {string} inactiveColor - Color de las estrellas inactivas
 * @param {object} style - Estilos adicionales
 */
const RatingStars = ({
  rating = 0,
  onRatingChange,
  readOnly = false,
  size = 20,
  activeColor = '#FFD700',
  inactiveColor = '#E5E5E5',
  style,
  eventId,
  userData,
  ...rest
}) => {
  const [loadingRating, setLoadingRating] = useState(false);
  const [userRating, setUserRating] = useState(rating);

  // Crear array de 5 elementos para las estrellas
  const stars = [1, 2, 3, 4, 5];
  
  // Manejar selección de calificación
  const handleRate = async (rating) => {
    try {
      setLoadingRating(true);

      // Get the complete request object by analyzing API requirements
      const ratingData = {
        rating: rating,           // Changed from calification to rating
        target: eventId,          // Changed from targetId to target
        targetModel: 'Event',
        comment: ''               // Optional comment field
      };

      console.log('Sending rating data:', ratingData); // Debug what's being sent

      await ratingService.createRating(ratingData);

      setUserRating(rating);

      // Recargar evento para actualizar rating promedio
      await fetchEvent(eventId);

      Alert.alert('¡Gracias por tu calificación!');
    } catch (error) {
      console.error('Error al calificar:', error);
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Data:', error.response.data);
        console.log('Headers:', error.response.headers);
      } else if (error.request) {
        console.log('Request was made but no response received');
        console.log(error.request);
      } else {
        console.log('Error setting up request:', error.message);
      }
      Alert.alert('Error', 'No se pudo guardar tu calificación');
    } finally {
      setLoadingRating(false);
    }
  };
  
  // Renderizar estrellas
  const renderStars = () => {
    return stars.map((star) => {
      const isFilled = star <= Math.round(userRating || 0);
      
      return (
        <TouchableOpacity
          key={star}
          onPress={() => handleRate(star)}
          activeOpacity={readOnly ? 1 : 0.7}
          disabled={readOnly || loadingRating}
          style={styles.starContainer}
        >
          <Ionicons
            name={isFilled ? 'star' : 'star-outline'}
            size={size}
            color={isFilled ? activeColor : inactiveColor}
          />
        </TouchableOpacity>
      );
    });
  };
  
  return (
    <View style={[styles.container, style]} {...rest}>
      {renderStars()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    padding: 2,
  },
});

export default RatingStars;