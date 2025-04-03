import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const NotificationsScreen = () => {
  const { userData } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulamos la carga de notificaciones
    setTimeout(() => {
      // Notificaciones de ejemplo
      const mockNotifications = [
        {
          id: '1',
          type: 'event',
          title: 'Nuevo evento disponible',
          message: 'Se ha publicado un nuevo evento que podría interesarte',
          read: false,
          date: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 horas atrás
        },
        {
          id: '2',
          type: 'activity',
          title: 'Recordatorio de actividad',
          message: 'Tu actividad programada comenzará en 1 hora',
          read: true,
          date: new Date(Date.now() - 1000 * 60 * 60 * 8) // 8 horas atrás
        },
        {
          id: '3',
          type: 'ticket',
          title: 'Ticket confirmado',
          message: 'Tu ticket ha sido confirmado para el evento',
          read: false,
          date: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 día atrás
        }
      ];
      
      setNotifications(mockNotifications);
      setIsLoading(false);
    }, 1000);
  }, []);

  const markAsRead = (id) => {
    setNotifications(notifications.map(
      notification => notification.id === id
        ? { ...notification, read: true }
        : notification
    ));
  };

  const renderNotificationItem = ({ item }) => {
    let iconName;
    switch (item.type) {
      case 'event':
        iconName = 'calendar-outline';
        break;
      case 'activity':
        iconName = 'time-outline';
        break;
      case 'ticket':
        iconName = 'ticket-outline';
        break;
      default:
        iconName = 'notifications-outline';
    }

    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.read && styles.notificationUnread]}
        onPress={() => markAsRead(item.id)}>
        <View style={styles.notificationIcon}>
          <Ionicons name={iconName} size={24} color="#6c5ce7" />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationDate}>
            {item.date.toLocaleString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit'
            })}
          </Text>
        </View>
        {!item.read && (
          <View style={styles.notificationBadge} />
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notificaciones</Text>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No tienes notificaciones</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  listContent: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  notificationUnread: {
    backgroundColor: '#f0f4ff',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8e3ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  notificationDate: {
    fontSize: 12,
    color: '#999',
  },
  notificationBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6c5ce7',
    marginLeft: 8,
    alignSelf: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default NotificationsScreen;