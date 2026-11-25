
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://192.168.29.105:5000';

type Land = {
  id: number;
  title: string;
  description: string;
  price: string | number;
  area: string | number | null;
  area_unit: string;
  address: string;
  status: string;
};

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Available');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const response = await fetch(`${API_URL}/api/lands/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load listing.');
      }

      const land: Land = data.land || data;

      setTitle(land.title || '');
      setLocation(land.address || '');
      setPrice(String(land.price || ''));
      setArea(
        land.area !== null && land.area !== undefined
          ? `${land.area} ${land.area_unit || ''}`.trim()
          : ''
      );
      setDescription(land.description || '');
      setStatus(land.status || 'Available');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Unable to load listing.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
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

    const numericPrice = Number(price);
    const areaMatch = area.trim().match(/^(\d+(?:\.\d+)?)\s*(.*)$/);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      Alert.alert('Invalid Price', 'Enter a valid price.');
      return;
    }

    if (!areaMatch || Number(areaMatch[1]) <= 0) {
      Alert.alert('Invalid Area', 'Enter area like 300 sq yards.');
      return;
    }

    try {
      setSaving(true);

      const token = await SecureStore.getItemAsync('authToken');

      if (!token) {
        throw new Error('Please login again.');
      }

      const response = await fetch(`${API_URL}/api/lands/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          address: location.trim(),
          price: numericPrice,
          area: Number(areaMatch[1]),
          area_unit: areaMatch[2].trim() || 'sq yards',
          description: description.trim(),
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to update listing.');
      }

      Alert.alert('Success', 'Listing updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Update Failed',
        error.message || 'Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#176B45"
          style={{ flex: 1 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>

        <Text style={styles.heading}>Edit Listing</Text>
        <Text style={styles.subtitle}>
          Update your property information.
        </Text>

        <Text style={styles.label}>Property Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Property title"
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Property location"
        />

        <Text style={styles.label}>Price (₹)</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholder="Enter price"
        />

        <Text style={styles.label}>Area</Text>
        <TextInput
          style={styles.input}
          value={area}
          onChangeText={setArea}
          placeholder="e.g. 300 sq yards"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.description]}
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="Describe your property"
        />

        <Text style={styles.label}>Listing Status</Text>
        <View style={styles.statusOptions}>
          {['Available', 'Sold', 'Inactive'].map((item) => (
            <Pressable
              key={item}
              style={[
                styles.statusButton,
                status === item && styles.selectedStatus,
              ]}
              onPress={() => setStatus(item)}
            >
              <Text
                style={[
                  styles.statusText,
                  status === item && styles.selectedStatusText,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.button, saving && styles.disabledButton]}
          onPress={handleUpdate}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
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
    marginBottom: 20,
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
  description: {
    height: 120,
    textAlignVertical: 'top',
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    borderWidth: 1,
    borderColor: '#176B45',
    borderRadius: 9,
    padding: 10,
  },
  selectedStatus: {
    backgroundColor: '#176B45',
  },
  statusText: {
    color: '#176B45',
    fontSize: 13,
  },
  selectedStatusText: {
    color: '#FFFFFF',
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
