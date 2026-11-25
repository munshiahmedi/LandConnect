
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://landconnect-1yni.onrender.com';

type Listing = {
  id: number;
  owner_id: number;
  title: string;
  description: string;
  price: string | number;
  area: string | number | null;
  area_unit: string;
  address: string;
  city: string;
  state: string;
  status: string;
  imageUrl?: string;
};

export default function MyListingsScreen() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchMyListings = async () => {
    try {
      setLoading(true);

      const token = await SecureStore.getItemAsync('authToken');

      if (!token) {
        Alert.alert('Login Required', 'Please login again.');
        router.replace('/login');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const profileResponse = await fetch(
        `${API_URL}/api/auth/profile`,
        { headers }
      );

      const profileData = await profileResponse.json();

      if (!profileResponse.ok) {
        throw new Error('Unable to verify your account. Please login again.');
      }

      const userId = profileData.user?.id ?? profileData.id;

      if (!userId) {
        throw new Error('User information not found.');
      }

      const response = await fetch(`${API_URL}/api/lands`, { headers });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to fetch listings.');
      }

      const myLands = (data.lands || []).filter(
        (land: Listing) => Number(land.owner_id) === Number(userId)
      );

      // Fetch images for each listing
      const listingsWithImages = await Promise.all(
        myLands.map(async (land: Listing) => {
          try {
            const imageResponse = await fetch(
              `${API_URL}/api/lands/${land.id}/images`,
              { headers }
            );

            if (!imageResponse.ok) return land;

            const imageData = await imageResponse.json();

            const images = Array.isArray(imageData)
              ? imageData
              : imageData.images || [];

            const firstImage = images[0];

            const imagePath =
              firstImage?.image_url ||
              firstImage?.imageUrl ||
              firstImage?.url;

            if (!imagePath) return land;

            const imageUrl = imagePath.startsWith('http')
              ? imagePath
              : `${API_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;

            return { ...land, imageUrl };
          } catch (error) {
            console.log(`Image fetch failed for listing ${land.id}:`, error);
            return land;
          }
        })
      );

      setListings(listingsWithImages);
    } catch (error: any) {
      console.error('My listings error:', error);
      Alert.alert(
        'Error',
        error.message || 'Unable to load your listings.'
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyListings();
    }, [])
  );

  const handleDelete = (id: number) => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(id);

              const token = await SecureStore.getItemAsync('authToken');

              if (!token) {
                throw new Error('Please login again.');
              }

              const response = await fetch(
                `${API_URL}/api/lands/${id}`,
                {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.message || 'Unable to delete listing.');
              }

              setListings((previous) =>
                previous.filter((item) => item.id !== id)
              );

              Alert.alert('Success', 'Listing deleted successfully.');
            } catch (error: any) {
              Alert.alert(
                'Delete Failed',
                error.message || 'Please try again.'
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const formatPrice = (price: string | number) =>
    `₹${Number(price).toLocaleString('en-IN')}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/dashboard');
          }}
        >
          <Text style={styles.back}>← Back</Text>
        </Pressable>

        <View style={styles.header}>
          <View>
            <Text style={styles.heading}>My Listings</Text>
            <Text style={styles.subtitle}>
              Manage your land properties.
            </Text>
          </View>

          <Pressable
            style={styles.addButton}
            onPress={() => router.push('/add-listing')}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </Pressable>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryNumber}>{listings.length}</Text>
          <Text style={styles.summaryLabel}>Total Listings</Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#176B45"
            style={{ marginTop: 30 }}
          />
        ) : listings.length === 0 ? (
          <Text style={styles.empty}>
            You have no listings yet.
          </Text>
        ) : (
          listings.map((item) => (
            <View style={styles.card} key={item.id}>
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.landImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.emoji}>🌳</Text>
                  <Text style={styles.placeholderText}>
                    No photo available
                  </Text>
                </View>
              )}

              <Text style={styles.title}>{item.title}</Text>

              <Text style={styles.location}>
                📍 {[item.address, item.city, item.state]
                  .filter(Boolean)
                  .join(', ')}
              </Text>

              <Text style={styles.info}>
                Area: {item.area ?? 'Not specified'} {item.area_unit || ''}
              </Text>

              <Text style={styles.price}>
                {formatPrice(item.price)}
              </Text>

              <Text
                style={[
                  styles.status,
                  item.status === 'Sold'
                    ? styles.sold
                    : styles.available,
                ]}
              >
                {item.status}
              </Text>

              <View style={styles.actions}>
                <Pressable
                  style={styles.editButton}
                  onPress={() =>
                    router.push({
                      pathname: '/edit-listing',
                      params: { id: String(item.id) },
                    })
                  }
                >
                  <Text style={styles.editText}>Edit</Text>
                </Pressable>

                <Pressable
                  style={styles.deleteButton}
                  disabled={deletingId === item.id}
                  onPress={() => handleDelete(item.id)}
                >
                  {deletingId === item.id ? (
                    <ActivityIndicator color="#B42318" />
                  ) : (
                    <Text style={styles.deleteText}>Delete</Text>
                  )}
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF7',
  },
  content: {
    padding: 20,
    paddingBottom: 35,
  },
  back: {
    color: '#176B45',
    fontSize: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#183D2B',
  },
  subtitle: {
    color: '#68776D',
    marginTop: 7,
  },
  addButton: {
    backgroundColor: '#176B45',
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  summary: {
    backgroundColor: '#E3F0E5',
    padding: 18,
    borderRadius: 13,
    marginTop: 25,
    marginBottom: 20,
  },
  summaryNumber: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#176B45',
  },
  summaryLabel: {
    color: '#526257',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 2,
  },
  landImage: {
    width: '100%',
    height: 190,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: '#E5E5E5',
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: '#E3F0E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
  },
  placeholderText: {
    color: '#68776D',
    fontSize: 12,
    marginTop: 5,
  },
  title: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#183D2B',
  },
  location: {
    color: '#68776D',
    marginTop: 9,
  },
  info: {
    color: '#68776D',
    marginTop: 9,
  },
  price: {
    color: '#176B45',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
  },
  status: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    overflow: 'hidden',
  },
  available: {
    backgroundColor: '#E3F0E5',
    color: '#176B45',
  },
  sold: {
    backgroundColor: '#FCE8E8',
    color: '#B42318',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  editButton: {
    flex: 1,
    padding: 12,
    borderRadius: 9,
    backgroundColor: '#E3F0E5',
    alignItems: 'center',
  },
  editText: {
    color: '#176B45',
    fontWeight: 'bold',
  },
  deleteButton: {
    flex: 1,
    padding: 12,
    borderRadius: 9,
    backgroundColor: '#FCE8E8',
    alignItems: 'center',
  },
  deleteText: {
    color: '#B42318',
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    color: '#68776D',
    marginTop: 35,
    fontSize: 16,
  },
});
