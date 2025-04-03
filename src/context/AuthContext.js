import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';

// Crear contexto de autenticación
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar si ya hay un token guardado y cargar los datos del usuario
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          setUserToken(token);
          await fetchUserProfile();
        }
      } catch (e) {
        console.error('Error al cargar el token:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await authService.getProfile();
      setUserData(response);
    } catch (error) {
      console.error('Error al obtener perfil de usuario:', error);
      // Si hay error al obtener el perfil, limpiar el token
      await logout();
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      const { token, ...user } = response;
      await AsyncStorage.setItem('userToken', token);
      setUserToken(token);
      setUserData(user);
      return true;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError(error.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register({ name, email, password });
      const { token, ...user } = response;
      await AsyncStorage.setItem('userToken', token);
      setUserToken(token);
      setUserData(user);
      return true;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      setError(error.response?.data?.message || 'Error al registrar usuario. Inténtalo de nuevo.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('userToken');
      setUserToken(null);
      setUserData(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserData = async (updatedData) => {
    try {
      const response = await authService.updateProfile(updatedData);
      setUserData(prev => ({ ...prev, ...response }));
      return true;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setError(error.response?.data?.message || 'Error al actualizar perfil');
      return false;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const contextValue = {
    isLoading,
    userToken,
    userData,
    error,
    login,
    register,
    logout,
    updateUserData,
    clearError,
    fetchUserProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};