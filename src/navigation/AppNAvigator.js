import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text } from 'react-native';

// Importación de contextos
import { AuthProvider, useAuth } from '../context/AuthContext';
import { EventProvider } from '../context/EventContext';

// Importación de pantallas de autenticación
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// Importación de pantallas principales
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import ActivityDetailScreen from '../screens/ActivityDetailScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import CreateActivityScreen from '../screens/CreateActivityScreen';
import EditEventScreen from '../screens/EditEventScreen';
import EditActivityScreen from '../screens/EditActivityScreen';
import UserListScreen from '../screens/UserListScreen';
import UserDetailScreen from '../screens/UserDetailScreen';
import EditUserScreen from '../screens/EditUserScreen';
import TicketListScreen from '../screens/TicketListScreen';
import TicketDetailScreen from '../screens/TicketDetailScreen';
import CreateTicketScreen from '../screens/CreateTicketScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddOperatorScreen from '../screens/AddOperatorScreen';
import AddAssistantScreen from '../screens/AddAssistantScreen';

// Handler para errores de navegación
const handleScreenNotFound = (name) => {
  const FallbackScreen = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
        La pantalla "{name}" no está disponible en este momento.
      </Text>
      <Text style={{ fontSize: 16, textAlign: 'center', color: '#666' }}>
        Por favor, contacta al equipo de desarrollo.
      </Text>
    </View>
  );
  
  return FallbackScreen;
};

// Verificar que las pantallas existan, de lo contrario, usar una pantalla de respaldo
const getScreen = (screenModule, name) => {
  return screenModule || handleScreenNotFound(name);
};

// Creación de navegadores
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Navegador de autenticación
const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={getScreen(LoginScreen, 'Login')} />
      <Stack.Screen name="Register" component={getScreen(RegisterScreen, 'Register')} />
      <Stack.Screen name="ForgotPassword" component={getScreen(ForgotPasswordScreen, 'ForgotPassword')} />
    </Stack.Navigator>
  );
};

// Navegador de pestañas (tabs) para la aplicación principal
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'HomeStack') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6c5ce7',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
      })}>
      <Tab.Screen 
        name="HomeStack" 
        component={HomeStackNavigator} 
        options={{ tabBarLabel: 'Inicio' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={getScreen(ProfileScreen, 'Profile')} 
        options={{ tabBarLabel: 'Perfil' }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={getScreen(NotificationsScreen, 'Notifications')} 
        options={{ tabBarLabel: 'Notificaciones' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={getScreen(SettingsScreen, 'Settings')} 
        options={{ tabBarLabel: 'Ajustes' }}
      />
    </Tab.Navigator>
  );
};

// Navegador de pila para la pantalla de inicio y relacionadas
const HomeStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={getScreen(HomeScreen, 'Home')} />
      <Stack.Screen name="EventDetail" component={getScreen(EventDetailScreen, 'EventDetail')} />
      <Stack.Screen name="ActivityDetail" component={getScreen(ActivityDetailScreen, 'ActivityDetail')} />
      <Stack.Screen name="CreateEvent" component={getScreen(CreateEventScreen, 'CreateEvent')} />
      <Stack.Screen name="CreateActivity" component={getScreen(CreateActivityScreen, 'CreateActivity')} />
      <Stack.Screen name="EditEvent" component={getScreen(EditEventScreen, 'EditEvent')} />
      <Stack.Screen name="EditActivity" component={getScreen(EditActivityScreen, 'EditActivity')} />
      <Stack.Screen name="UserList" component={getScreen(UserListScreen, 'UserList')} />
      <Stack.Screen name="UserDetail" component={getScreen(UserDetailScreen, 'UserDetail')} />
      <Stack.Screen name="EditUser" component={getScreen(EditUserScreen, 'EditUser')} />
      <Stack.Screen name="TicketList" component={getScreen(TicketListScreen, 'TicketList')} />
      <Stack.Screen name="TicketDetail" component={getScreen(TicketDetailScreen, 'TicketDetail')} />
      <Stack.Screen name="CreateTicket" component={getScreen(CreateTicketScreen, 'CreateTicket')} />
      <Stack.Screen name="AddOperator" component={getScreen(AddOperatorScreen, 'AddOperator')} />
      <Stack.Screen name="AddAssistant" component={getScreen(AddAssistantScreen, 'AddAssistant')} />
    </Stack.Navigator>
  );
};

// Componente para manejar errores en la carga
const LoadingErrorBoundary = ({ children }) => {
  try {
    return children;
  } catch (error) {
    console.error('Error en la navegación:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error al cargar la aplicación. Por favor reiníciala.</Text>
      </View>
    );
  }
};

// Navegador principal que decide qué mostrar basado en el estado de autenticación
const MainNavigator = () => {
  const { isLoading, userToken } = useAuth();
  
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }
  
  return (
    <LoadingErrorBoundary>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken ? (
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </LoadingErrorBoundary>
  );
};

// Componente principal con proveedores de contexto
const AppNavigator = () => {
  return (
    <NavigationContainer
      fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6c5ce7" />
        </View>
      }
    >
      <StatusBar style="auto" />
      <AuthProvider>
        <EventProvider>
          <MainNavigator />
        </EventProvider>
      </AuthProvider>
    </NavigationContainer>
  );
};

export default AppNavigator;