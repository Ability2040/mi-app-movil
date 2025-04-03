import React from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RatingSummary = ({ averageRating, totalRatings }) => {
  return (
    <View style={styles.summaryContainer}>
      <Text style={styles.averageRating}>{averageRating ? averageRating.toFixed(1) : "0.0"}</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= Math.round(averageRating || 0) ? 'star' : 'star-outline'}
            size={20}
            color="#FFD700"
            style={styles.starIcon}
          />
        ))}
      </View>
      <Text style={styles.totalRatings}>
        {totalRatings || 0} {totalRatings === 1 ? 'calificación' : 'calificaciones'}
      </Text>
    </View>
  );
};

const RatingItem = ({ rating }) => {
  return (
    <View style={styles.ratingItem}>
      <View style={styles.ratingHeader}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(rating.calificator?.name || 'Usuario') }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{rating.calificator?.name || 'Usuario'}</Text>
        </View>
        <View style={styles.ratingStars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= rating.rating ? 'star' : 'star-outline'}
              size={16}
              color="#FFD700"
              style={styles.smallStar}
            />
          ))}
        </View>
      </View>
      
      {rating.comment && (
        <Text style={styles.comment}>{rating.comment}</Text>
      )}
      
      <Text style={styles.date}>
        {new Date(rating.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );
};

const RatingsList = ({ ratings, stats }) => {
  if (!ratings || ratings.length === 0) {
    return (
      <View style={styles.noRatingsContainer}>
        <Ionicons name="star-outline" size={40} color="#999" />
        <Text style={styles.noRatingsText}>
          No hay calificaciones para este evento todavía
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calificaciones y reseñas</Text>
      
      {stats && (
        <RatingSummary 
          averageRating={stats.averageRating} 
          totalRatings={stats.totalRatings} 
        />
      )}
      
      <FlatList
        data={ratings}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <RatingItem rating={item} />}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  summaryContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  averageRating: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  starsContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  starIcon: {
    marginHorizontal: 2,
  },
  smallStar: {
    marginHorizontal: 1,
  },
  totalRatings: {
    color: '#666',
    fontSize: 14,
  },
  ratingItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  ratingStars: {
    flexDirection: 'row',
  },
  comment: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  noRatingsContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  noRatingsText: {
    marginTop: 8,
    color: '#666',
    textAlign: 'center',
  },
});

export default RatingsList;