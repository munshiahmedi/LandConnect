import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

const API_URL = 'https://landconnect-1yni.onrender.com';

export default function AddListingScreen() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [type, setType] = useState('Residential');
  const [description, setDescription] = useState('');

  const [selectedImage, setSelectedImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Select land photo
  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow gallery access to select a land photo.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Unable to open your gallery.');
    }
  };

  // Get current GPS location
  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);

      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow location access to select land location.'
        );
        return;
      }

      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      setLatitude(currentLocation.coords.latitude);
      setLongitude(currentLocation.coords.longitude);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert(
        'Location Error',
        'Unable to get current location. Please check GPS.'
      );
    } finally {
      setLocationLoading(false);
    }
  };

  // Open selected coordinates in Google Maps
  const openGoogleMaps = async () => {
    if (latitude === null || longitude === null) {
      Alert.alert('Location Required', 'Please get GPS location first.');
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'Unable to open Google Maps.');
    }
  };

  // Upload land image
  const uploadImage = async (landId: number, token: string) => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append('image', new File(selectedImage.uri));

    const response = await fetch(
      `${API_URL}/api/lands/${landId}/images`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Image upload failed.');
    }
  };

  // Create land listing
  const handleSubmit = async () => {
    if (
      !title.trim() ||
      !location.trim() ||
      !price.trim() ||
      !area.trim() ||
      !description.trim()
    ) {
      Alert.alert('Required', 'Please fill in all fields.');
      return;
    }

    if (latitude === null || longitude === null) {
      Alert.alert(
        'Location Required',
        'Please tap Use Current Location before submitting.'
      );
      return;
    }

    const numericPrice = Number(price);
    const areaMatch = area.trim().match(/^(\d+(?:\.\d+)?)\s*(.*)$/);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price.');
      return;
    }

    if (!areaMatch || Number(areaMatch[1]) <= 0) {
      Alert.alert(
        'Invalid Area',
        'Enter area like 1500 sq.ft or 200 sq yards.'
      );
      return;
    }

    try {
      setLoading(true);

      const token = await SecureStore.getItemAsync('authToken');

      if (!token) {
        Alert.alert('Login Required', 'Please login again.');
        router.replace('/login');
        return;
      }

      // Create listing with GPS coordinates
      const response = await fetch(`${API_URL}/api/lands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: `Property Type: ${type}\n\n${description.trim()}`,
          price: numericPrice,
          area: Number(areaMatch[1]),
          area_unit: areaMatch[2].trim() || 'sq yards',
          address: location.trim(),
          latitude,
          longitude,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || 'Unable to create listing.'
        );
      }

      const landId = data.landId || data.land?.id;

      if (!landId) {
        throw new Error('Listing created, but its ID was not returned.');
      }

      // Upload selected photo
      if (selectedImage) {
        try {
          await uploadImage(landId, token);
        } catch (imageError: any) {
          console.error('Image upload error:', imageError);

          Alert.alert(
            'Listing Created',
            `Your listing was created, but the photo could not be uploaded: ${
              imageError.message || 'Please try again.'
            }`,
            [
              {
                text: 'View Listings',
                onPress: () => router.replace('/explore'),
              },
            ]
          );
          return;
        }
      }

      Alert.alert(
        'Success',
        selectedImage
          ? 'Your land listing, GPS location and photo have been uploaded successfully!'
          : 'Your land listing and GPS location have been saved successfully!',
        [
          {
            text: 'View Listings',
            onPress: () => router.replace('/explore'),
          },
        ]
      );

      setTitle('');
      setLocation('');
      setPrice('');
      setArea('');
      setType('Residential');
      setDescription('');
      setSelectedImage(null);
      setLatitude(null);
      setLongitude(null);
    } catch (error: any) {
      console.error('Create listing error:', error);

      Alert.alert(
        'Error',
        error.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

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

        <Text style={styles.heading}>Add Land Listing</Text>

        <Text style={styles.subtitle}>
          Enter your property details to create a listing.
        </Text>

        <Text style={styles.label}>Property Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Residential Land"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Location / Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter property location"
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.label}>Price (₹)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter price"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <Text style={styles.label}>Area</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 1500 sq.ft"
          value={area}
          onChangeText={setArea}
        />

        <Text style={styles.label}>Property Type</Text>
        <View style={styles.types}>
          {['Residential', 'Agricultural', 'Commercial'].map((item) => (
            <Pressable
              key={item}
              style={[
                styles.typeButton,
                type === item && styles.selectedType,
              ]}
              onPress={() => setType(item)}
            >
              <Text
                style={[
                  styles.typeText,
                  type === item && styles.selectedTypeText,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.description]}
          placeholder="Describe your property..."
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        {/* GPS Location */}
        <Text style={styles.label}>Land GPS Location</Text>

        <Pressable
          style={styles.locationButton}
          onPress={getCurrentLocation}
          disabled={locationLoading}
        >
          {locationLoading ? (
            <ActivityIndicator color="#176B45" />
          ) : (
            <Text style={styles.locationButtonText}>
              📍 Use Current Location
            </Text>
          )}
        </Pressable>

        {latitude !== null && longitude !== null ? (
          <View style={styles.locationCard}>
            <Text style={styles.locationSuccess}>
              ✓ GPS Location Selected
            </Text>

            <Text style={styles.coordinates}>
              Latitude: {latitude.toFixed(6)}
              {'\n'}
              Longitude: {longitude.toFixed(6)}
            </Text>

            <Pressable
              style={styles.openMapButton}
              onPress={openGoogleMaps}
            >
              <Text style={styles.openMapText}>
                Open in Google Maps
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>
              GPS location not selected yet.
            </Text>
            <Text style={styles.mapPlaceholderSubtext}>
              Tap "Use Current Location" to get GPS coordinates.
            </Text>
          </View>
        )}

        {/* Property Photos */}
        <Text style={styles.label}>Property Photos</Text>

        <Pressable style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>
            {selectedImage ? 'Change Photo' : '＋ Select Land Photo'}
          </Text>
        </Pressable>

        {selectedImage && (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: selectedImage.uri }}
              style={styles.preview}
            />

            <Pressable
              style={styles.removeButton}
              onPress={() => setSelectedImage(null)}
            >
              <Text style={styles.removeText}>Remove Photo</Text>
            </Pressable>
          </View>
        )}

        <Pressable
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Submit Listing</Text>
          )}
        </Pressable>
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
    padding: 22,
    paddingBottom: 35,
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
    marginBottom: 25,
  },
  label: {
    color: '#183D2B',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE5DD',
    borderRadius: 11,
    padding: 14,
    fontSize: 15,
  },
  types: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    borderWidth: 1,
    borderColor: '#176B45',
    borderRadius: 9,
    padding: 10,
  },
  selectedType: {
    backgroundColor: '#176B45',
  },
  typeText: {
    color: '#176B45',
    fontSize: 13,
  },
  selectedTypeText: {
    color: '#FFFFFF',
  },
  description: {
    height: 110,
    textAlignVertical: 'top',
  },
  locationButton: {
    backgroundColor: '#E6F1E9',
    borderWidth: 1,
    borderColor: '#176B45',
    padding: 15,
    borderRadius: 11,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  locationButtonText: {
    color: '#176B45',
    fontSize: 15,
    fontWeight: 'bold',
  },
  locationCard: {
    marginTop: 12,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDE5DD',
  },
  locationSuccess: {
    color: '#176B45',
    fontWeight: 'bold',
    fontSize: 15,
  },
  coordinates: {
    color: '#526257',
    fontSize: 13,
    marginTop: 10,
    lineHeight: 22,
  },
  openMapButton: {
    marginTop: 14,
    padding: 12,
    backgroundColor: '#E6F1E9',
    borderRadius: 9,
    alignItems: 'center',
  },
  openMapText: {
    color: '#176B45',
    fontWeight: 'bold',
  },
  mapPlaceholder: {
    height: 130,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDE5DD',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  mapPlaceholderText: {
    color: '#183D2B',
    fontSize: 15,
    fontWeight: '600',
  },
  mapPlaceholderSubtext: {
    color: '#68776D',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  imageButton: {
    backgroundColor: '#E6F1E9',
    borderWidth: 1,
    borderColor: '#176B45',
    borderStyle: 'dashed',
    padding: 18,
    borderRadius: 11,
    alignItems: 'center',
  },
  imageButtonText: {
    color: '#176B45',
    fontSize: 15,
    fontWeight: 'bold',
  },
  previewContainer: {
    marginTop: 15,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#E5E5E5',
  },
  removeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  removeText: {
    color: '#C0392B',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#176B45',
    padding: 17,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 28,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});