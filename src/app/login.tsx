
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://192.168.29.105:5000';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter email and password.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          'Login Failed',
          data.message || 'Invalid email or password.'
        );
        return;
      }

      if (!data.token) {
        Alert.alert(
          'Error',
          'Login successful, but authentication token was not received.'
        );
        return;
      }

      // Securely save authentication token
      await SecureStore.setItemAsync('authToken', data.token);

      // Save user details if returned by backend
      if (data.user) {
        await SecureStore.setItemAsync(
          'userData',
          JSON.stringify(data.user)
        );
      }

      console.log('Login successful. Token saved securely.');

      router.replace('/dashboard');

    } catch (error) {
      console.error('Login error:', error);

      Alert.alert(
        'Connection Error',
        'Unable to connect to server or save login details. Please check your backend and try again.'
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
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
        >
          <Text style={styles.back}>← Back</Text>
        </Pressable>

        <Text style={styles.logo}>LandConnect</Text>

        <Text style={styles.title}>Welcome Back!</Text>

        <Text style={styles.subtitle}>
          Login to continue your land journey.
        </Text>

        <Text style={styles.label}>Email Address</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable
          style={[
            styles.button,
            loading && styles.disabledButton,
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </Pressable>

        <View style={styles.signupRow}>
          <Text style={styles.normalText}>
            Don't have an account?{' '}
          </Text>

          <Pressable onPress={() => router.push('/signup')}>
            <Text style={styles.link}>Sign Up</Text>
          </Pressable>
        </View>
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
    flexGrow: 1,
    padding: 25,
    justifyContent: 'center',
  },
  back: {
    fontSize: 16,
    color: '#176B45',
    marginBottom: 35,
  },
  logo: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#176B45',
    marginBottom: 35,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#183D2B',
  },
  subtitle: {
    fontSize: 15,
    color: '#68776D',
    marginTop: 10,
    marginBottom: 35,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#183D2B',
    marginBottom: 8,
  },
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: '#DCE5DD',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
    marginBottom: 22,
  },
  button: {
    backgroundColor: '#176B45',
    padding: 17,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 17,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  normalText: {
    color: '#68776D',
  },
  link: {
    color: '#176B45',
    fontWeight: 'bold',
  },
});
