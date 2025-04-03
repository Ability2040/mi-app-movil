import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente Button reutilizable
 * @param {string} title - Texto del botón
 * @param {function} onPress - Función a ejecutar al presionar
 * @param {string} type - Tipo de botón (primary, secondary, danger, success)
 * @param {boolean} loading - Mostrar loader
 * @param {boolean} disabled - Deshabilitar botón
 * @param {string} iconName - Nombre del icono (Ionicons)
 * @param {object} style - Estilos adicionales
 */
const Button = ({ 
  title, 
  onPress, 
  type = 'primary', 
  loading = false, 
  disabled = false,
  iconName,
  style,
  textStyle,
  ...rest
}) => {
  // Determinar estilos según el tipo
  const getButtonStyle = () => {
    switch (type) {
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'danger':
        return styles.dangerButton;
      case 'success':
        return styles.successButton;
      case 'light':
        return styles.lightButton;
      default:
        return styles.primaryButton;
    }
  };
  
  // Determinar estilos del texto según el tipo
  const getTextStyle = () => {
    switch (type) {
      case 'outline':
        return styles.outlineButtonText;
      case 'light':
        return styles.lightButtonText;
      case 'secondary':
      case 'primary':
      case 'danger':
      case 'success':
        return styles.primaryButtonText;
      default:
        return styles.primaryButtonText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        disabled && styles.disabledButton,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator 
          color={type === 'outline' || type === 'light' ? '#6c5ce7' : '#fff'} 
          size="small" 
        />
      ) : (
        <View style={styles.contentContainer}>
          {iconName && (
            <Ionicons 
              name={iconName} 
              size={18} 
              color={type === 'outline' || type === 'light' ? '#6c5ce7' : '#fff'} 
              style={styles.icon} 
            />
          )}
          <Text 
            style={[
              getTextStyle(),
              disabled && styles.disabledButtonText,
              textStyle
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  primaryButton: {
    backgroundColor: '#6c5ce7',
  },
  secondaryButton: {
    backgroundColor: '#b2bec3',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6c5ce7',
    elevation: 0,
    shadowOpacity: 0,
  },
  dangerButton: {
    backgroundColor: '#ff4757',
  },
  successButton: {
    backgroundColor: '#26de81',
  },
  lightButton: {
    backgroundColor: '#f5f6fa',
    elevation: 0,
    shadowOpacity: 0,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  outlineButtonText: {
    color: '#6c5ce7',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lightButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButtonText: {
    opacity: 0.8,
  },
});

export default Button;