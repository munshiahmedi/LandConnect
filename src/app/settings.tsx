import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function SettingsScreen() {
  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userData');
      router.replace('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Unable to sign out', 'Please try again.');
    }
  };

  const confirmSignOut = () => {
    Alert.alert('Sign out?', 'You will need to log in again to continue.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          void signOut();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/dashboard');
          }}
        >
          <Text style={styles.back}>← Back</Text>
        </Pressable>

        <Text style={styles.heading}>Settings</Text>
        <Text style={styles.subtitle}>Manage your account preferences.</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.signOutButton,
              pressed && styles.pressed,
            ]}
            onPress={confirmSignOut}
          >
            <Text style={styles.signOutTitle}>Sign out</Text>
            <Text style={styles.signOutDescription}>
              Sign out of your LandConnect account
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F3',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  back: {
    color: '#236B4A',
    fontSize: 16,
    marginBottom: 22,
  },
  heading: {
    color: '#183D2B',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#758078',
    fontSize: 14,
    marginTop: 7,
  },
  section: {
    marginTop: 30,
  },
  sectionTitle: {
    color: '#52685A',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  signOutButton: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECE5',
  },
  signOutTitle: {
    color: '#B42318',
    fontSize: 15,
    fontWeight: '700',
  },
  signOutDescription: {
    color: '#758078',
    fontSize: 12,
    marginTop: 5,
  },
  pressed: {
    opacity: 0.75,
  },
});
