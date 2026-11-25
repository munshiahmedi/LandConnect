
import { useCallback, useEffect, useState } from 'react';
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

  const fetchProfile = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchProfile);
  }, [fetchProfile]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>L</Text>
          </View>
          <ActivityIndicator size="small" color="#236B4A" />
          <Text style={styles.loadingText}>Getting things ready...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.brand}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>L</Text>
          </View>
          <Text style={styles.logo}>LandConnect</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Settings"
            style={styles.settingsButton}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.settingsIcon}>⚙</Text>
          </Pressable>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.trim().charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>YOUR LAND JOURNEY</Text>
          <Text style={styles.welcome}>
            Good to see you,{' '}
            <Text style={styles.welcomeName}>{user?.name || 'there'}.</Text>
          </Text>
          <Text style={styles.subtitle}>
            Find the right place for what comes next.
          </Text>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroDecoration} />
          <View style={styles.heroDecorationInner} />
          <Text style={styles.heroEyebrow}>A LITTLE ROOM TO GROW</Text>
          <Text style={styles.heroTitle}>Your next chapter{'\n'}starts with land.</Text>
          <Text style={styles.heroText}>
            Explore places and possibilities, all in one place.
          </Text>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.heroButton, pressed && styles.pressed]}
            onPress={() => router.push('/explore')}
          >
            <Text style={styles.heroButtonText}>Explore lands</Text>
            <Text style={styles.heroButtonArrow}>↗</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Your workspace</Text>
            <Text style={styles.sectionSubtitle}>Everything, right where you need it.</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <WorkspaceAction
            icon="⌂"
            title="My listings"
            description="Manage your land"
            onPress={() => router.push('/my-listings')}
          />
          <WorkspaceAction
            icon="✉"
            title="Messages"
            description="Stay connected"
            onPress={() => router.push('/messages')}
          />
        </View>
        <View style={styles.actionRow}>
          <WorkspaceAction
            icon="◉"
            title="Calls"
            description="Talk it through"
            onPress={() => router.push('/calls')}
          />
          <WorkspaceAction
            icon="▦"
            title="Meeting rooms"
            description="Meet face to face"
            onPress={() => router.push('/meeting-rooms')}
          />
        </View>

        {user && (
          <View style={styles.profile}>
            <View style={styles.profileHeading}>
              <Text style={styles.profileTitle}>Your account</Text>
              <View style={styles.connectedBadge}>
                <View style={styles.connectedDot} />
                <Text style={styles.connectedText}>Connected</Text>
              </View>
            </View>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            <Text style={styles.profileRole}>{user.role}</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

type WorkspaceActionProps = {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
};

function WorkspaceAction({ icon, title, description, onPress }: WorkspaceActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.actionIcon}>
        <Text style={styles.actionIconText}>{icon}</Text>
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionDescription}>{description}</Text>
      <Text style={styles.actionArrow}>↗</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F3',
    paddingHorizontal: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 36,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#236B4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    color: '#236B4A',
    fontSize: 24,
  },
  logo: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: '#183D2B',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E4EDE5',
    borderWidth: 1,
    borderColor: '#D5E2D6',
  },
  avatarText: {
    color: '#236B4A',
    fontSize: 16,
    fontWeight: '700',
  },
  intro: {
    marginBottom: 16,
  },
  eyebrow: {
    color: '#658171',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.7,
    marginBottom: 9,
  },
  welcome: {
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '700',
    color: '#183D2B',
    letterSpacing: -0.8,
  },
  welcomeName: {
    color: '#236B4A',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#758078',
    marginTop: 7,
  },
  hero: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1D5039',
    borderRadius: 24,
    padding: 18,
    minHeight: 194,
    marginBottom: 20,
    justifyContent: 'center',
  },
  heroDecoration: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    right: -78,
    top: -88,
  },
  heroDecorationInner: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    right: -48,
    top: -58,
  },
  heroEyebrow: {
    color: '#B6D7BC',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 7,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  heroText: {
    maxWidth: 250,
    color: '#D4E3D8',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  heroButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#F1F4E9',
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: 13,
    marginTop: 12,
  },
  heroButtonText: {
    color: '#204C36',
    fontSize: 13,
    fontWeight: '700',
  },
  heroButtonArrow: {
    color: '#204C36',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#183D2B',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    color: '#7A847D',
    fontSize: 12,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  actionCard: {
    flex: 1,
    minHeight: 108,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8ECE5',
  },
  actionIcon: {
    width: 30,
    height: 30,
    borderRadius: 12,
    backgroundColor: '#EEF4EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },
  actionIconText: {
    color: '#236B4A',
    fontSize: 20,
    lineHeight: 24,
  },
  actionTitle: {
    color: '#203D2D',
    fontSize: 14,
    fontWeight: '700',
  },
  actionDescription: {
    color: '#7A847D',
    fontSize: 11,
    marginTop: 4,
  },
  actionArrow: {
    position: 'absolute',
    right: 14,
    top: 16,
    color: '#9AA99D',
    fontSize: 14,
    fontWeight: '600',
  },
  profile: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E8ECE5',
  },
  profileHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },
  profileTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#52685A',
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF5EC',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  connectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4C9B61',
  },
  connectedText: {
    color: '#39724A',
    fontSize: 10,
    fontWeight: '600',
  },
  profileName: {
    color: '#203D2D',
    fontSize: 16,
    fontWeight: '700',
  },
  profileEmail: {
    color: '#77827A',
    fontSize: 12,
    marginTop: 4,
  },
  profileRole: {
    alignSelf: 'flex-start',
    color: '#597362',
    fontSize: 10,
    fontWeight: '600',
    backgroundColor: '#F2F5EF',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 8,
    marginTop: 10,
  },
  loadingText: {
    color: '#758078',
    fontSize: 13,
  },
  pressed: {
    opacity: 0.75,
  },
});
