import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  const events = [
    { id: '1', title: 'Conferencia Tech', description: 'Evento de tecnología con expertos.' },
    { id: '2', title: 'Hackathon 2025', description: 'Competencia de programación.' },
    { id: '3', title: 'Meetup Startups', description: 'Encuentro con emprendedores.' }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eventos Disponibles</Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.eventItem} 
            onPress={() => navigation.navigate('EventDetail', { event: item })}
          >
            <Text style={styles.eventTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  eventItem: { padding: 15, backgroundColor: '#f1f1f1', marginBottom: 10, borderRadius: 5 },
  eventTitle: { fontSize: 18, fontWeight: 'bold' }
});
