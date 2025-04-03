import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

/**
 * Componente LoadingIndicator reutilizable
 * @param {string} text - Texto mostrado bajo el indicador
 * @param {string} size - Tamaño del indicador (small, large)
 * @param {string} color - Color del indicador
 * @param {boolean} fullScreen - Ocupar toda la pantalla
 * @param {object} style - Estilos adicionales
 */
const LoadingIndicator = ({
  text,
  size = 'large',
  color = '#6c5ce7',
  fullScreen = false,
  style,
  ...rest
}) => {
  return (
    <View style={[
      styles.container,
      fullScreen && styles.fullScreen,
      style
    ]}>
      <ActivityIndicator size={size} color={color} {...rest} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 999,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});

export default LoadingIndicator;