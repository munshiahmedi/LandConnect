
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

const API_URL = 'https://landconnect-1yni.onrender.com';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
          autoComplete="email"
          textContentType="emailAddress"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter your password"
            autoComplete="current-password"
            textContentType="password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            style={styles.passwordToggle}
            onPress={() => setShowPassword((visible) => !visible)}
          >
            <View style={styles.eyeIcon}>
              <View style={styles.eyePupil} />
            </View>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          style={styles.forgotPassword}
          onPress={() =>
            Alert.alert(
              'Password reset',
              'Password reset is not available in the app yet. Please contact LandConnect support.'
            )
          }
        >
          <Text style={styles.link}>Forgot Password?</Text>
        </Pressable>

        <Pressable
          style={[
            styles.button,
            loading && styles.disabledButton,
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContent}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.buttonText}>Logging in...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </Pressable>

        <View style={styles.signupRow}>
          <Text style={styles.normalText}>
            Don&apos;t have an account?{' '}
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
  passwordContainer: {
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCE5DD',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 15,
    fontSize: 15,
    color: '#183D2B',
  },
  passwordToggle: {
    minWidth: 48,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeIcon: {
    width: 20,
    height: 13,
    borderWidth: 2,
    borderColor: '#176B45',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyePupil: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#176B45',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 12,
    paddingVertical: 5,
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
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
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
