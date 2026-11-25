
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>L</Text>
        </View>

        <Text style={styles.brand}>LandConnect</Text>

        <View style={styles.hero}>
          <Text style={styles.emoji}>🌳</Text>

          <Text style={styles.title}>
            Find the Perfect Land
          </Text>

          <Text style={styles.subtitle}>
            Discover, connect and invest in land
            with confidence.
          </Text>
        </View>

        <View style={styles.bottom}>
          <Pressable
            style={styles.button}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.buttonText}>
              Get Started
            </Text>
          </Pressable>

          <Text style={styles.footer}>
            Your land journey starts here.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF7',
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    paddingVertical: 20,
    alignItems: 'center',
  },
  logoContainer: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: '#176B45',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
  },
  brand: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#176B45',
    marginTop: 12,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 100,
    marginBottom: 25,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#183D2B',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#68776D',
    textAlign: 'center',
    lineHeight: 25,
    marginTop: 15,
    paddingHorizontal: 15,
  },
  bottom: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#176B45',
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  footer: {
    color: '#849087',
    textAlign: 'center',
    marginTop: 18,
    fontSize: 13,
  },
});
