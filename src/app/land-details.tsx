
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const API_URL = 'http://192.168.29.105:5000';

type LandImage = {
  id: number;
  image_url: string;
};

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
  owner_name: string;
  owner_role: string;
  latitude: string | number | null;
  longitude: string | number | null;
};

export default function LandDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [land, setLand] = useState<Land | null>(null);
  const [images, setImages] = useState<LandImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLandDetails();
  }, [id]);

  const fetchLandDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_URL}/api/lands/${id}`);

      if (!response.ok) {
        throw new Error('Land details not found');
      }

      const data = await response.json();
      setLand(data.land || data);

      const imageResponse = await fetch(
        `${API_URL}/api/lands/${id}/images`
      );

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        setImages(imageData.images || []);
      } else {
        setImages([]);
      }
    } catch (err) {
      console.error('Land details error:', err);
      setError('Unable to load land details.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string | number) =>
    `₹${Number(price).toLocaleString('en-IN')}`;

  const latitude = Number(land?.latitude);
  const longitude = Number(land?.longitude);

  const hasCoordinates =
    land?.latitude !== null &&
    land?.latitude !== undefined &&
    land?.longitude !== null &&
    land?.longitude !== undefined &&
    land?.latitude !== '' &&
    land?.longitude !== '' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  const openGoogleMaps = async () => {
    if (!hasCoordinates) return;

    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    try {
      await Linking.openURL(url);
    } catch (err) {
      console.error('Unable to open Google Maps:', err);
    }
  };

  const mapHtml = hasCoordinates
    ? `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
        <style>
          html, body, #map {
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          const lat = ${latitude};
          const lng = ${longitude};

          const map = L.map('map').setView([lat, lng], 15);

          L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
              attribution: '&copy; OpenStreetMap contributors',
              maxZoom: 19
            }
          ).addTo(map);

          L.marker([lat, lng])
            .addTo(map)
            .bindPopup('LandConnect Property Location')
            .openPopup();
        </script>
      </body>
      </html>
    `
    : '';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace('/explore');
            }}
          >
            <Text style={styles.back}>← Back</Text>
          </Pressable>

          <Text style={styles.heading}>Land Details</Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#176B45"
            style={{ marginTop: 50 }}
          />
        ) : error || !land ? (
          <View style={styles.content}>
            <Text style={styles.error}>
              {error || 'Land not found'}
            </Text>

            <Pressable onPress={fetchLandDetails}>
              <Text style={styles.retry}>Try Again</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {images.length > 0 ? (
              <FlatList
                data={images}
                horizontal
                keyExtractor={(item) => String(item.id)}
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.propertyImage}
                    resizeMode="cover"
                  />
                )}
              />
            ) : (
              <View style={styles.image}>
                <Text style={styles.imageEmoji}>🌳🏡</Text>
                <Text style={styles.imageText}>
                  No property photos available
                </Text>
              </View>
            )}

            {images.length > 1 && (
              <Text style={styles.photoCount}>
                {images.length} property photos
              </Text>
            )}

            <View style={styles.content}>
              <Text style={styles.title}>{land.title}</Text>

              <Text style={styles.location}>
                📍 {[land.address, land.city, land.state]
                  .filter(Boolean)
                  .join(', ')}
              </Text>

              <Text style={styles.price}>
                {formatPrice(land.price)}
              </Text>

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>
                Property Information
              </Text>

              {land.area !== null && (
                <Text style={styles.info}>
                  Area: {land.area} {land.area_unit}
                </Text>
              )}

              <Text style={styles.info}>
                Availability: {land.status}
              </Text>

              <Text style={styles.info}>
                Seller: {land.owner_name}
              </Text>

              <Text style={styles.info}>
                Listed by: {land.owner_role}
              </Text>

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>
                Land Location
              </Text>

              {hasCoordinates ? (
                <>
                  <View style={styles.mapContainer}>
                    <WebView
                      originWhitelist={['*']}
                      source={{ html: mapHtml }}
                      javaScriptEnabled
                      domStorageEnabled
                      style={styles.map}
                      scrollEnabled={false}
                      onError={(event) =>
                        console.error(
                          'Map loading error:',
                          event.nativeEvent
                        )
                      }
                    />
                  </View>

                  <Text style={styles.coordinates}>
                    Latitude: {latitude}
                    {'\n'}
                    Longitude: {longitude}
                  </Text>

                  <Pressable
                    style={styles.mapButton}
                    onPress={openGoogleMaps}
                  >
                    <Text style={styles.buttonText}>
                      Open Directions in Google Maps
                    </Text>
                  </Pressable>
                </>
              ) : (
                <View style={styles.noMap}>
                  <Text style={styles.noMapEmoji}>📍</Text>

                  <Text style={styles.noMapTitle}>
                    Location coordinates unavailable
                  </Text>

                  <Text style={styles.noMapText}>
                    This listing does not have latitude and longitude yet.
                    The seller needs to add its location.
                  </Text>
                </View>
              )}

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>
                Description
              </Text>

              <Text style={styles.description}>
                {land.description || 'No description available.'}
              </Text>

              <Pressable
                style={styles.button}
                onPress={() => router.push('/messages')}
              >
                <Text style={styles.buttonText}>
                  Contact Seller
                </Text>
              </Pressable>
            </View>
          </>
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
    padding: 20,
  },
  back: {
    color: '#176B45',
    fontSize: 16,
    marginBottom: 18,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#183D2B',
  },
  image: {
    height: 210,
    backgroundColor: '#DDEBDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageEmoji: {
    fontSize: 65,
  },
  imageText: {
    color: '#45634D',
    marginTop: 10,
  },
  propertyImage: {
    width: 360,
    height: 240,
    backgroundColor: '#DDEBDD',
  },
  photoCount: {
    color: '#68776D',
    textAlign: 'center',
    marginTop: 10,
  },
  content: {
    padding: 22,
  },
  title: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#183D2B',
  },
  location: {
    color: '#68776D',
    marginTop: 10,
  },
  price: {
    color: '#176B45',
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#DDE5DD',
    marginVertical: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#183D2B',
    marginTop: 15,
    marginBottom: 12,
  },
  info: {
    color: '#526257',
    fontSize: 15,
    marginBottom: 12,
  },
  description: {
    color: '#68776D',
    fontSize: 15,
    lineHeight: 23,
  },
  mapContainer: {
    height: 280,
    overflow: 'hidden',
    borderRadius: 14,
    backgroundColor: '#EAF1E9',
  },
  map: {
    flex: 1,
  },
  coordinates: {
    color: '#68776D',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  noMap: {
    backgroundColor: '#EAF1E9',
    padding: 22,
    borderRadius: 14,
    alignItems: 'center',
  },
  noMapEmoji: {
    fontSize: 35,
  },
  noMapTitle: {
    color: '#183D2B',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  noMapText: {
    color: '#68776D',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  mapButton: {
    backgroundColor: '#176B45',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
    width: '100%',
  },
  button: {
    backgroundColor: '#176B45',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: '#C0392B',
    textAlign: 'center',
  },
  retry: {
    color: '#176B45',
    textAlign: 'center',
    marginTop: 15,
    fontWeight: 'bold',
  },
});
