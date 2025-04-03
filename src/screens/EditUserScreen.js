import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const EditUserScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const { userData } = useAuth();
  
  // Estado del formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [isOperator, setIsOperator] = useState(false);
  const [isAssistant, setIsAssistant] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Comprobar si el usuario actual es administrador
  useEffect(() => {
    if (userData && userData.role !== 'admin') {
      Alert.alert('Acceso denegado', 'Solo los administradores pueden acceder a esta pantalla');
      navigation.goBack();
    }
  }, [userData]);
  
  // Cargar datos del usuario
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/users/${userId}`);
        const user = response.data;
        
        setName(user.name || '');
        setEmail(user.email || '');
        setRole(user.role || 'user');
        setIsOperator(user.permissions?.isOperator || false);
        setIsAssistant(user.permissions?.isAssistant || false);
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        setError('No se pudo cargar la información del usuario');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, [userId]);
  
  // Validar formulario
  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para el usuario');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico');
      return false;
    }
    // Validar formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido');
      return false;
    }
    return true;
  };
  
  // Guardar cambios
  const handleSaveChanges = async () => {
    if (!validateForm()) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      // Preparar datos de usuario
      const userData = {
        name,
        email,
        role,
        permissions: {
          isOperator,
          isAssistant
        }
      };
      
      // Actualizar usuario
      await api.put(`/users/${userId}`, userData);
      
      Alert.alert(
        'Éxito',
        'Usuario actualizado correctamente',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      setError('No se pudo actualizar el usuario. Inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
        <Text style={styles.loadingText}>Cargando información del usuario...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Editar Usuario</Text>
          </View>
          
          {/* Mensaje de error */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          {/* Formulario */}
          <View style={styles.form}>
            {/* Nombre */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre*</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nombre del usuario"
              />
            </View>
            
            {/* Email */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Correo electrónico*</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Correo electrónico"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            {/* Rol */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Rol</Text>
              <View style={styles.rolePickerContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    role === 'user' && styles.roleOptionSelected
                  ]}
                  onPress={() => setRole('user')}>
                  <Text style={[
                    styles.roleOptionText,
                    role === 'user' && styles.roleOptionTextSelected
                  ]}>Usuario</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    role === 'admin' && styles.roleOptionSelected
                  ]}
                  onPress={() => setRole('admin')}>
                  <Text style={[
                    styles.roleOptionText,
                    role === 'admin' && styles.roleOptionTextSelected
                  ]}>Administrador</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Permisos */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Permisos</Text>
              <View style={styles.permissionsContainer}>
                <View style={styles.permissionItem}>
                  <Text style={styles.permissionLabel}>Operador</Text>
                  <Switch
                    value={isOperator}
                    onValueChange={setIsOperator}
                    trackColor={{ false: '#e0e0e0', true: '#6c5ce7' }}
                    thumbColor={isOperator ? '#fff' : '#fff'}
                  />
                </View>
                
                <View style={styles.permissionItem}>
                  <Text style={styles.permissionLabel}>Asistente</Text>
                  <Switch
                    value={isAssistant}
                    onValueChange={setIsAssistant}
                    trackColor={{ false: '#e0e0e0', true: '#6c5ce7' }}
                    thumbColor={isAssistant ? '#fff' : '#fff'}
                  />
                </View>
              </View>
            </View>
            
            {/* Botones */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => navigation.goBack()}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveChanges}
                disabled={isSaving}>
                {isSaving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
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
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  rolePickerContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  roleOptionSelected: {
    backgroundColor: '#6c5ce7',
  },
  roleOptionText: {
    fontSize: 16,
    color: '#666',
  },
  roleOptionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  permissionsContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  permissionLabel: {
    fontSize: 16,
    color: '#333',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#6c5ce7',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditUserScreen;