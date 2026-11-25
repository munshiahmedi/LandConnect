
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const API_URL = 'http://192.168.29.105:5000';

type Land = {
  id: number;
  title: string;
  description: string;
  price: string | number;
  area: string | number | null;
  area_unit: string;
  address: string;
  city: string;
  state: string;
  status: string;
  images?: { id: number; image_url: string }[];
};

export default function ExploreScreen() {
  const router = useRouter();

  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLands();
  }, []);

  const fetchLands = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_URL}/api/lands`);

      if (!response.ok) {
        throw new Error('Unable to fetch land listings');
      }

      const data = await response.json();
      const landList: Land[] = data.lands || [];

      const landsWithImages = await Promise.all(
        landList.map(async (land) => {
          try {
            const imageResponse = await fetch(
              `${API_URL}/api/lands/${land.id}/images`
            );

            if (!imageResponse.ok) return { ...land, images: [] };

            const imageData = await imageResponse.json();

            return {
              ...land,
              images: imageData.images || [],
            };
          } catch {
            return { ...land, images: [] };
          }
        })
      );

      setLands(landsWithImages);
    } catch (err) {
      console.error('Fetch lands error:', err);
      setError('Unable to load lands. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string | number) =>
    `₹${Number(price).toLocaleString('en-IN')}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace('/dashboard');
            }}
          >
            <Text style={styles.back}>← Back</Text>
          </Pressable>

          <Text style={styles.heading}>Explore Lands</Text>
          <Text style={styles.subtitle}>
            Find land opportunities around you.
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#176B45"
            style={styles.loader}
          />
        ) : error ? (
          <View style={styles.messageContainer}>
            <Text style={styles.error}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={fetchLands}>
              <Text style={styles.retryText}>Try Again</Text>
            </Pressable>
          </View>
        ) : lands.length === 0 ? (
          <Text style={styles.empty}>
            No land listings available yet.
          </Text>
        ) : (
          lands.map((land) => (
            <Pressable
              key={land.id}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: '/land-details',
                  params: { id: String(land.id) },
                })
              }
            >
              {land.images && land.images.length > 0 ? (
                <Image
                  source={{ uri: land.images[0].image_url }}
                  style={styles.landImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.emoji}>🌳</Text>
                  <Text style={styles.placeholderText}>
                    No property photo
                  </Text>
                </View>
              )}

              <Text style={styles.title}>{land.title}</Text>

              <Text style={styles.location}>
                📍 {[land.address, land.city, land.state]
                  .filter(Boolean)
                  .join(', ')}
              </Text>

              {land.area !== null && (
                <Text style={styles.area}>
                  Area: {land.area} {land.area_unit || ''}
                </Text>
              )}

              <Text style={styles.price}>
                {formatPrice(land.price)}
              </Text>

              <Text style={styles.status}>
                Status: {land.status}
              </Text>

              <Text style={styles.viewDetails}>
                Tap to view details →
              </Text>
            </Pressable>
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
  header: {
    padding: 22,
  },
  back: {
    color: '#176B45',
    fontSize: 16,
    marginBottom: 20,
  },
  heading: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#183D2B',
  },
  subtitle: {
    color: '#68776D',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
  },
  landImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 14,
  },
  imagePlaceholder: {
    height: 150,
    backgroundColor: '#E6F1E9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emoji: {
    fontSize: 40,
  },
  placeholderText: {
    color: '#68776D',
    marginTop: 5,
  },
  title: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#183D2B',
  },
  location: {
    color: '#68776D',
    marginTop: 10,
  },
  area: {
    color: '#68776D',
    marginTop: 8,
  },
  price: {
    color: '#176B45',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
  },
  status: {
    color: '#68776D',
    marginTop: 8,
  },
  viewDetails: {
    color: '#176B45',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 12,
  },
  loader: {
    marginTop: 50,
  },
  messageContainer: {
    alignItems: 'center',
    padding: 25,
  },
  error: {
    color: '#C0392B',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: '#176B45',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    color: '#68776D',
    marginTop: 40,
  },
});
