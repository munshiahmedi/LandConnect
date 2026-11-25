
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

export default function MeetingRoomsScreen() {
  const router = useRouter();

  const [roomId, setRoomId] = useState('');
  const [createdRoomId, setCreatedRoomId] = useState('');
  const [callType, setCallType] = useState<'audio' | 'video'>('video');

  const createRoom = () => {
    const newRoomId =
      `landconnect-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    setCreatedRoomId(newRoomId);
  };

  const copyRoomId = async () => {
    try {
      await Clipboard.setStringAsync(createdRoomId);
      Alert.alert('Copied', 'Meeting Room ID copied to clipboard.');
    } catch (error) {
      console.error('Copy Room ID error:', error);
      Alert.alert('Unable to copy', 'Please try again.');
    }
  };

  const shareRoomId = async () => {
    try {
      await Share.share({
        title: 'Join my LandConnect meeting',
        message: `Join my LandConnect meeting. Room ID: ${createdRoomId}`,
      });
    } catch (error) {
      console.error('Share Room ID error:', error);
      Alert.alert('Unable to share', 'Please try again.');
    }
  };

  const startMeeting = () => {
    if (!createdRoomId) {
      Alert.alert('Create Room', 'Please create a meeting room first.');
      return;
    }

    router.push({
      pathname: '/call-screen',
      params: {
        type: callType,
        roomName: createdRoomId,
      },
    });
  };

  const joinMeeting = () => {
    const enteredRoomId = roomId.trim();

    if (!enteredRoomId) {
      Alert.alert('Room ID Required', 'Please enter a meeting Room ID.');
      return;
    }

    if (enteredRoomId.length < 3) {
      Alert.alert('Invalid Room ID', 'Please enter a valid Room ID.');
      return;
    }

    router.push({
      pathname: '/call-screen',
      params: {
        type: callType,
        roomName: enteredRoomId,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>

        <Text style={styles.heading}>Meeting Rooms</Text>
        <Text style={styles.subtitle}>
          Create a new meeting or join an existing room.
        </Text>

        <View style={styles.typeCard}>
          <Text style={styles.sectionTitle}>Meeting Type</Text>

          <View style={styles.typeRow}>
            <Pressable
              style={[
                styles.typeButton,
                callType === 'audio' && styles.selectedType,
              ]}
              onPress={() => setCallType('audio')}
            >
              <Text
                style={[
                  styles.typeText,
                  callType === 'audio' && styles.selectedTypeText,
                ]}
              >
                Audio
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.typeButton,
                callType === 'video' && styles.selectedType,
              ]}
              onPress={() => setCallType('video')}
            >
              <Text
                style={[
                  styles.typeText,
                  callType === 'video' && styles.selectedTypeText,
                ]}
              >
                Video
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create a Meeting</Text>
          <Text style={styles.description}>
            Generate a unique Room ID and share it with other participants.
          </Text>

          <Pressable style={styles.primaryButton} onPress={createRoom}>
            <Text style={styles.primaryButtonText}>Create Room</Text>
          </Pressable>

          {createdRoomId !== '' && (
            <View style={styles.roomResult}>
              <Text style={styles.roomLabel}>Your Meeting Room ID</Text>
              <Text selectable style={styles.roomId}>
                {createdRoomId}
              </Text>

              <Text style={styles.hint}>
                Share this ID with the person you want to invite.
              </Text>

              <View style={styles.roomActions}>
                <Pressable
                  accessibilityRole="button"
                  style={styles.secondaryButton}
                  onPress={copyRoomId}
                >
                  <Text style={styles.secondaryButtonText}>Copy Room ID</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  style={styles.secondaryButton}
                  onPress={shareRoomId}
                >
                  <Text style={styles.secondaryButtonText}>Share</Text>
                </Pressable>
              </View>

              <Pressable
                style={styles.startButton}
                onPress={startMeeting}
              >
                <Text style={styles.primaryButtonText}>Start Meeting</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Join a Meeting</Text>
          <Text style={styles.description}>
            Enter the Room ID shared by the meeting host.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter Meeting Room ID"
            placeholderTextColor="#849087"
            value={roomId}
            onChangeText={setRoomId}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Pressable style={styles.primaryButton} onPress={joinMeeting}>
            <Text style={styles.primaryButtonText}>Join Room</Text>
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
    padding: 20,
    paddingBottom: 35,
  },
  back: {
    color: '#176B45',
    fontSize: 16,
    marginBottom: 22,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#183D2B',
  },
  subtitle: {
    color: '#68776D',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 22,
  },
  typeCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#183D2B',
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 13,
    borderWidth: 1,
    borderColor: '#D5DED7',
    borderRadius: 10,
    alignItems: 'center',
  },
  selectedType: {
    backgroundColor: '#176B45',
    borderColor: '#176B45',
  },
  typeText: {
    color: '#183D2B',
    fontWeight: 'bold',
  },
  selectedTypeText: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#DCE5DD',
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#183D2B',
  },
  description: {
    color: '#68776D',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#176B45',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  roomResult: {
    backgroundColor: '#E7F3E9',
    padding: 14,
    borderRadius: 10,
    marginTop: 16,
  },
  roomLabel: {
    color: '#176B45',
    fontWeight: 'bold',
    fontSize: 13,
  },
  roomId: {
    color: '#183D2B',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 9,
  },
  hint: {
    color: '#68776D',
    fontSize: 12,
    marginTop: 10,
    marginBottom: 14,
  },
  roomActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B7D3BB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#176B45',
    fontSize: 13,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#183D2B',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D5DED7',
    borderRadius: 10,
    padding: 14,
    color: '#183D2B',
    fontSize: 14,
    marginBottom: 14,
  },
});
