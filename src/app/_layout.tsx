
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="explore" />
      <Stack.Screen name="land-details" />
      <Stack.Screen name="add-listing" />
      <Stack.Screen name="my-listings" />
      <Stack.Screen name="messages" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="calls" />
      <Stack.Screen name="call-screen" />
      <Stack.Screen name="meeting-rooms" />
    </Stack>
  );
}
