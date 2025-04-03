import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const SettingItem = ({ icon, title, subtitle, value, onValueChange, onPress, type = 'switch' }) => {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={24} color="#6c5ce7" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && (
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        )}
      </View>
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#e0e0e0', true: '#6c5ce7' }}
          thumbColor={value ? '#fff' : '#fff'}
        />
      )}
      {type === 'arrow' && (
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      )}
    </TouchableOpacity>
  );
};

const SettingSection = ({ title, children }) => {
  return (
    <View style={styles.settingSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
};

const SettingsScreen = ({ navigation }) => {
  const { userData, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: logout }
      ]
    );
  };
  
  const handleClearCache = () => {
    Alert.alert(
      'Limpiar caché',
      '¿Estás seguro de que deseas limpiar el caché de la aplicación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpiar', 
          onPress: () => {
            // Lógica para limpiar caché
            Alert.alert('Éxito', 'Caché limpiado correctamente');
          }
        }
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ajustes</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Perfil */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {userData?.name?.charAt(0) || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userData?.name || 'Usuario'}</Text>
            <Text style={styles.profileEmail}>{userData?.email || 'usuario@ejemplo.com'}</Text>
            <Text style={styles.profileRole}>{userData?.role || 'user'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="create-outline" size={20} color="#6c5ce7" />
          </TouchableOpacity>
        </View>
        
        {/* Notificaciones */}
        <SettingSection title="Notificaciones">
          <SettingItem
            icon="notifications-outline"
            title="Notificaciones push"
            subtitle="Recibir notificaciones push"
            value={notifications}
            onValueChange={setNotifications}
          />
          <SettingItem
            icon="mail-outline"
            title="Notificaciones por correo"
            subtitle="Recibir actualizaciones por correo electrónico"
            value={emailNotifications}
            onValueChange={setEmailNotifications}
          />
        </SettingSection>
        
        {/* Apariencia */}
        <SettingSection title="Apariencia">
          <SettingItem
            icon="moon-outline"
            title="Modo oscuro"
            subtitle="Cambiar a tema oscuro"
            value={darkMode}
            onValueChange={setDarkMode}
          />
        </SettingSection>
        
        {/* Seguridad */}
        <SettingSection title="Seguridad">
          <SettingItem
            icon="key-outline"
            title="Cambiar contraseña"
            type="arrow"
            onPress={() => navigation.navigate('ForgotPasswordScreen')}
          />
        </SettingSection>
        
        {/* Datos */}
        <SettingSection title="Datos">
          <SettingItem
            icon="trash-outline"
            title="Limpiar caché"
            subtitle="Eliminar datos temporales"
            type="arrow"
            onPress={handleClearCache}
          />
        </SettingSection>
        
        {/* Información */}
        <SettingSection title="Información">
          <SettingItem
            icon="information-circle-outline"
            title="Acerca de"
            subtitle="Versión 1.0.0"
            type="arrow"
            onPress={() => Alert.alert('Acerca de', 'Aplicación de Gestión de Eventos\nVersión 1.0.0')}
          />
          <SettingItem
            icon="document-text-outline"
            title="Términos de servicio"
            type="arrow"
            onPress={() => {
              // Mostrar términos de servicio
            }}
          />
          <SettingItem
            icon="shield-outline"
            title="Política de privacidad"
            type="arrow"
            onPress={() => {
              // Mostrar política de privacidad
            }}
          />
        </SettingSection>
        
        {/* Cerrar sesión */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  editProfileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff4757',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default SettingsScreen;