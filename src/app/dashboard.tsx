
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://landconnect-1yni.onrender.com';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function DashboardScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');

      if (!token) {
        Alert.alert('Session Expired', 'Please login again.');
        router.replace('/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        await SecureStore.deleteItemAsync('authToken');
        await SecureStore.deleteItemAsync('userData');

        Alert.alert('Session Expired', 'Please login again.');
        router.replace('/login');
        return;
      }

      const profile = data.user || data;

      setUser(profile);

      await SecureStore.setItemAsync(
        'userData',
        JSON.stringify(profile)
      );

    } catch (error) {
      console.error('Profile fetch error:', error);

      Alert.alert(
        'Connection Error',
        'Unable to fetch your profile. Please check your backend connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('userData');

    router.replace('/login');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#176B45" />
        <Text style={styles.loadingText}>
          Loading your profile...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>LandConnect</Text>

          <Text style={styles.welcome}>
            Welcome, {user?.name || 'User'}!
          </Text>

          <Text style={styles.subtitle}>
            Find, list and connect with land opportunities.
          </Text>

          {user && (
            <View style={styles.profile}>
              <Text style={styles.profileTitle}>
                Your Profile
              </Text>

              <Text style={styles.profileText}>
                Name: {user.name}
              </Text>

              <Text style={styles.profileText}>
                Email: {user.email}
              </Text>

              <Text style={styles.profileText}>
                Role: {user.role}
              </Text>

              <Text style={styles.verified}>
                ✓ Profile fetched from backend
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cards}>
          <Pressable
            style={styles.card}
            onPress={() => router.push('/explore')}
          >
            <Text style={styles.emoji}>🔍</Text>
            <Text style={styles.cardTitle}>
              Explore Lands
            </Text>
            <Text style={styles.cardText}>
              Discover available land listings.
            </Text>
          </Pressable>

          <Pressable
            style={styles.card}
            onPress={() => router.push('/my-listings')}
          >
            <Text style={styles.emoji}>🏡</Text>
            <Text style={styles.cardTitle}>
              My Listings
            </Text>
            <Text style={styles.cardText}>
              Manage your land properties.
            </Text>
          </Pressable>

          <Pressable
            style={styles.card}
            onPress={() => router.push('/messages')}
          >
            <Text style={styles.emoji}>💬</Text>
            <Text style={styles.cardTitle}>
              Messages
            </Text>
            <Text style={styles.cardText}>
              Connect with other users.
            </Text>
          </Pressable>

          <Pressable
            style={styles.card}
            onPress={() => router.push('/calls')}
          >
            <Text style={styles.emoji}>📞</Text>
            <Text style={styles.cardTitle}>
              Calls
            </Text>
            <Text style={styles.cardText}>
              Audio and video conversations.
            </Text>
          </Pressable>

          <Pressable
            style={styles.card}
            onPress={() => router.push('/meeting-rooms')}
          >
            <Text style={styles.emoji}>🎥</Text>
            <Text style={styles.cardTitle}>
              Meeting Rooms
            </Text>
            <Text style={styles.cardText}>
              Create a new meeting or join an existing room.
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.logout}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>
            Logout
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF7',
    paddingHorizontal: 22,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 15,
    paddingBottom: 25,
  },
  header: {
    marginBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#176B45',
  },
  welcome: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#183D2B',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 14,
    color: '#68776D',
    marginTop: 8,
  },
  profile: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#DCE5DD',
  },
  profileTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#176B45',
    marginBottom: 8,
  },
  profileText: {
    fontSize: 14,
    color: '#183D2B',
    marginTop: 4,
  },
  verified: {
    fontSize: 12,
    color: '#176B45',
    marginTop: 8,
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 12,
    color: '#176B45',
  },
  cards: {
    gap: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCE5DD',
  },
  emoji: {
    fontSize: 23,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#183D2B',
    marginTop: 5,
  },
  cardText: {
    fontSize: 12,
    color: '#68776D',
    marginTop: 3,
  },
  logout: {
    backgroundColor: '#176B45',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
