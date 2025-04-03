import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente Input reutilizable
 * @param {string} label - Etiqueta del input
 * @param {string} value - Valor del input
 * @param {function} onChangeText - Función para cambiar el valor
 * @param {string} placeholder - Texto del placeholder
 * @param {string} error - Mensaje de error
 * @param {string} helperText - Texto de ayuda
 * @param {boolean} secureTextEntry - Campo de contraseña
 * @param {boolean} multiline - Campo multilínea
 * @param {string} leftIconName - Nombre del icono izquierdo (Ionicons)
 * @param {string} rightIconName - Nombre del icono derecho (Ionicons)
 * @param {function} onRightIconPress - Función al presionar icono derecho
 * @param {object} style - Estilos adicionales
 */
const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  secureTextEntry,
  multiline,
  leftIconName,
  rightIconName,
  onRightIconPress,
  style,
  inputStyle,
  ...rest
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        multiline && styles.multilineContainer,
        error && styles.errorContainer
      ]}>
        {leftIconName && (
          <Ionicons
            name={leftIconName}
            size={20}
            color="#999"
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={[
            styles.input,
            leftIconName && styles.inputWithLeftIcon,
            rightIconName && styles.inputWithRightIcon,
            multiline && styles.multilineInput,
            inputStyle
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          {...rest}
        />
        
        {rightIconName && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name={rightIconName}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        )}
      </View>
      
      {(error || helperText) && (
        <Text style={[
          styles.helperText,
          error && styles.errorText
        ]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  multilineContainer: {
    minHeight: 120,
    alignItems: 'flex-start',
  },
  errorContainer: {
    borderColor: '#ff4757',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 12,
  },
  multilineInput: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 36,
  },
  leftIcon: {
    marginLeft: 12,
  },
  rightIconContainer: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    marginLeft: 2,
  },
  errorText: {
    color: '#ff4757',
  },
});

export default Input;