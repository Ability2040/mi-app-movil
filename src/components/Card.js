import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * Componente Card reutilizable
 * @param {node} children - Contenido del card
 * @param {function} onPress - Función al presionar (opcional)
 * @param {object} style - Estilos adicionales
 * @param {boolean} noPadding - Sin padding interno
 * @param {boolean} noShadow - Sin sombra
 */
const Card = ({
  children,
  onPress,
  style,
  noPadding = false,
  noShadow = false,
  ...rest
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[
        styles.card,
        noPadding && styles.noPadding,
        !noShadow && styles.shadow,
        style
      ]}
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
      {...rest}
    >
      {children}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  noPadding: {
    padding: 0,
  },
  shadow: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});

export default Card;