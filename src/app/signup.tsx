
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const API_URL = 'https://landconnect-1yni.onrender.com';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Buyer');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert('Required', 'Please fill all fields.');
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        'Invalid Password',
        'Password must contain at least 8 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Error', 'Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          'Registration Failed',
          data.message || 'Unable to create account.'
        );
        return;
      }

      Alert.alert(
        'Success',
        'Your LandConnect account has been created!',
        [
          {
            text: 'Go to Login',
            onPress: () => router.replace('/login'),
          },
        ]
      );

    } catch (error) {
      console.error('Signup error:', error);

      Alert.alert(
        'Connection Error',
        'Unable to connect to server. Please check your backend.'
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
              router.replace('/login');
            }
          }}
        >
          <Text style={styles.back}>← Back</Text>
        </Pressable>

        <Text style={styles.logo}>LandConnect</Text>

        <Text style={styles.title}>Create Account</Text>

        <Text style={styles.subtitle}>
          Join LandConnect and start your journey.
        </Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
        />

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

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Create password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Text style={styles.label}>Select Your Role</Text>

        <View style={styles.roles}>
          {['Buyer', 'Seller', 'Broker'].map((item) => (
            <Pressable
              key={item}
              style={[
                styles.roleButton,
                role === item && styles.selectedRole,
              ]}
              onPress={() => setRole(item)}
            >
              <Text
                style={[
                  styles.roleText,
                  role === item && styles.selectedRoleText,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[
            styles.button,
            loading && styles.disabledButton,
          ]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </Pressable>

        <View style={styles.loginRow}>
          <Text style={styles.normalText}>
            Already have an account?{' '}
          </Text>

          <Pressable onPress={() => router.push('/login')}>
            <Text style={styles.link}>Login</Text>
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
  },
  back: {
    fontSize: 16,
    color: '#176B45',
    marginBottom: 25,
  },
  logo: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#176B45',
    marginBottom: 20,
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
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#183D2B',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#DCE5DD',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
    marginBottom: 18,
  },
  roles: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 25,
  },
  roleButton: {
    flex: 1,
    padding: 13,
    borderWidth: 1,
    borderColor: '#DCE5DD',
    borderRadius: 10,
    alignItems: 'center',
  },
  selectedRole: {
    backgroundColor: '#176B45',
    borderColor: '#176B45',
  },
  roleText: {
    color: '#183D2B',
    fontWeight: '600',
  },
  selectedRoleText: {
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#176B45',
    padding: 17,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 17,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
    marginBottom: 20,
  },
  normalText: {
    color: '#68776D',
  },
  link: {
    color: '#176B45',
    fontWeight: 'bold',
  },
});
