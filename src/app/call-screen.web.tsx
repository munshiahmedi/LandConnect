import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function CallScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Calls are available in the mobile app</Text>
        <Text style={styles.message}>
          LiveKit calling requires the native mobile app.
        </Text>
        <Pressable style={styles.button} onPress={() => router.replace('/calls')}>
          <Text style={styles.buttonText}>Back to Calls</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#183D2B',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  message: {
    color: '#B8D9C1',
    marginTop: 12,
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#176B45',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
