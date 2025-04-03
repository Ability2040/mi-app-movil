import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shakeAnimation] = useState(new Animated.Value(0));
  const { login, error, isLoading, clearError } = useAuth();

  // Limpiar errores cuando se desmonta el componente
  useEffect(() => {
    return () => {
      clearError();
    };
  }, []);

  // Efecto para actualizar el error de inicio de sesión cuando cambia el error del contexto
  useEffect(() => {
    if (error) {
      setLoginError(error);
      startShakeAnimation();
    }
  }, [error]);

  // Limpiar errores cuando cambian los campos
  useEffect(() => {
    setEmailError('');
    setLoginError('');
  }, [email]);

  useEffect(() => {
    setPasswordError('');
    setLoginError('');
  }, [password]);

  const startShakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('El correo electrónico es obligatorio');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Introduce un correo electrónico válido');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password) => {
    if (!password) {
      setPasswordError('La contraseña es obligatoria');
      return false;
    } else if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    // Limpiar errores previos
    setLoginError('');
    setEmailError('');
    setPasswordError('');
    
    // Validar campos
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      const success = await login(email, password);
      
      if (!success) {
        // Interpretar el error según su contenido
        if (error) {
          console.log('Error de inicio de sesión:', error);
          // Añadir más condiciones para capturar diferentes formatos de error
          if (error.toLowerCase().includes('no encontrado') || 
              error.toLowerCase().includes('no existe') || 
              error.toLowerCase().includes('no registrado') || 
              error.toLowerCase().includes('not found')) {
            setEmailError('Este correo no está registrado');
            startShakeAnimation();
          } else if (error.toLowerCase().includes('contraseña') || 
                    error.toLowerCase().includes('password') || 
                    error.toLowerCase().includes('credenciales') || 
                    error.toLowerCase().includes('incorrecta') || 
                    error.toLowerCase().includes('invalid')) {
            setPasswordError('Contraseña incorrecta');
            startShakeAnimation();
          } else {
            setLoginError(error);
            startShakeAnimation();
          }
        } else {
          // Si no hay mensaje específico, mostrar mensaje genérico
          setLoginError('Error al iniciar sesión. Comprueba tus credenciales e intenta de nuevo.');
          startShakeAnimation();
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Analizar el error para dar feedback más específico
      const errorMsg = err.message || 'Error desconocido';
      
      if (errorMsg.toLowerCase().includes('network') || 
          errorMsg.toLowerCase().includes('red') || 
          errorMsg.toLowerCase().includes('conexión')) {
        setLoginError('Error de conexión. Verifica tu conexión a internet.');
      } else if (errorMsg.toLowerCase().includes('timeout') || 
                errorMsg.toLowerCase().includes('tiempo')) {
        setLoginError('Tiempo de espera agotado. Intenta de nuevo más tarde.');
      } else {
        setLoginError('Ha ocurrido un error. Por favor, intenta de nuevo más tarde.');
      }
      
      startShakeAnimation();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo-placeholder.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Inicia sesión</Text>
        <Text style={styles.subtitle}>
          Inicia sesión para continuar con tu experiencia en Evento
        </Text>

        {/* Mostrar error general de inicio de sesión */}
        {loginError ? (
          <Animated.View 
            style={[
              styles.errorContainer,
              { transform: [{ translateX: shakeAnimation }] }
            ]}
          >
            <Ionicons name="alert-circle" size={20} color="#ff4757" />
            <Text style={styles.errorText}>{loginError}</Text>
          </Animated.View>
        ) : null}

        <View style={styles.formContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Correo electrónico</Text>
            <View style={[styles.inputContainer, emailError ? styles.inputContainerError : null]}>
              <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                testID="email-input"
              />
            </View>
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : (
              <Text style={styles.helperText}>Usa tu correo electrónico registrado</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={[styles.inputContainer, passwordError ? styles.inputContainerError : null]}>
              <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                testID="password-input"
              />
              <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#999" 
                />
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : (
              <Text style={styles.helperText}>Mínimo 6 caracteres</Text>
            )}
          </View>

          <TouchableOpacity 
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity
  style={[styles.primaryButton, (emailError || passwordError) && styles.disabledButton]}
  onPress={handleLogin}
  disabled={isLoading || !!emailError || !!passwordError}
  testID="login-button">
  {isLoading ? (
    <ActivityIndicator color="#fff" />
  ) : (
    <Text style={styles.buttonText}>Continuar</Text>
  )}
</TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('Register')}
            style={styles.registerContainer}
          >
            <Text style={styles.registerText}>
              ¿No tienes una cuenta? <Text style={styles.registerLink}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  inputContainerError: {
    borderColor: '#ff4757',
  },
  inputIcon: {
    marginLeft: 15,
  },
  eyeIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  errorText: {
    fontSize: 12,
    color: '#ff4757',
    marginTop: 5,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe8e8',
    borderWidth: 1,
    borderColor: '#ff4757',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  forgotPassword: {
    color: '#6c5ce7',
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#6c5ce7',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#a29bea',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 16,
    color: '#333',
  },
  registerLink: {
    color: '#6c5ce7',
    fontWeight: 'bold',
  },
});

export default LoginScreen;