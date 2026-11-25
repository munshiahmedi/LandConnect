
import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { io, Socket } from 'socket.io-client';

const API_URL = 'http://192.168.29.105:5000';

type IncomingCall = {
  callerId: string | number;
  callerName: string;
  roomName: string;
  callType: 'audio' | 'video';
};

type OutgoingCall = {
  roomName: string;
  callType: 'audio' | 'video';
  receiverId: string;
};

export default function CallsScreen() {
  const router = useRouter();

  const socketRef = useRef<Socket | null>(null);
  const outgoingCallRef = useRef<OutgoingCall | null>(null);

  const [userId, setUserId] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);
  const [connected, setConnected] = useState(false);

 

useEffect(() => {
  let active = true;
  let socket: Socket | null = null;

  const setupSocket = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');

      if (!token) {
        Alert.alert('Login required', 'Please login again.');
        return;
      }

      // Fetch the logged-in user's profile
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.user?.id) {
        Alert.alert('Profile Error', 'Unable to fetch your User ID. Please login again.');
        return;
      }

      const id = String(data.user.id);

      if (!active) return;

      setUserId(id);

      // Connect to Socket.IO
      socket = io(API_URL, {
        transports: ['websocket'],
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        setConnected(true);
        socket?.emit('register-user', id);
        console.log('Registered user:', id);
      });

      socket.on('disconnect', () => {
        setConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.log('Socket connection error:', error.message);
      });

      socket.on('incoming-call', (incomingData: IncomingCall) => {
        setIncomingCall(incomingData);
      });

      socket.on('call-accepted', () => {
        const call = outgoingCallRef.current;

        if (!call) return;

        setWaitingForAnswer(false);
        outgoingCallRef.current = null;

        router.push({
          pathname: '/call-screen',
          params: {
            type: call.callType,
            callerName: `User ${call.receiverId}`,
            roomName: call.roomName,
          },
        });
      });

      socket.on('call-rejected', () => {
        setWaitingForAnswer(false);
        outgoingCallRef.current = null;
        Alert.alert('Call rejected', 'The other user rejected your call.');
      });

    } catch (error) {
      console.error('Socket setup error:', error);
      Alert.alert('Error', 'Unable to connect to the call service.');
    }
  };

  setupSocket();

  return () => {
    active = false;
    socket?.disconnect();
    socketRef.current = null;
  };
}, [router]);

  const startCall = (type: 'audio' | 'video') => {
    const receiver = receiverId.trim();

    if (!userId) {
      Alert.alert('Error', 'Your user account could not be identified.');
      return;
    }

    if (!receiver) {
      Alert.alert('Receiver required', 'Enter the other user ID first.');
      return;
    }

    if (receiver === userId) {
      Alert.alert('Invalid user', 'You cannot call yourself.');
      return;
    }

    if (!socketRef.current?.connected) {
      Alert.alert('Not connected', 'Call server is not connected. Try again.');
      return;
    }

    const roomName = `landconnect-${userId}-${receiver}-${Date.now()}`;

    outgoingCallRef.current = {
      roomName,
      callType: type,
      receiverId: receiver,
    };

    socketRef.current.emit('call-user', {
      callerId: userId,
      receiverId: receiver,
      callerName: `User ${userId}`,
      roomName,
      callType: type,
    });

    setWaitingForAnswer(true);
  };

  const acceptCall = () => {
    if (!incomingCall || !socketRef.current?.connected) return;

    socketRef.current.emit('accept-call', {
      callerId: incomingCall.callerId,
      roomName: incomingCall.roomName,
    });

    const call = incomingCall;
    setIncomingCall(null);

    router.push({
      pathname: '/call-screen',
      params: {
        type: call.callType,
        callerName: call.callerName,
        roomName: call.roomName,
      },
    });
  };

  const rejectCall = () => {
    if (!incomingCall) return;

    socketRef.current?.emit('reject-call', {
      callerId: incomingCall.callerId,
    });

    setIncomingCall(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/dashboard');
          }}
        >
          <Text style={styles.back}>← Back</Text>
        </Pressable>

        <Text style={styles.heading}>Calls</Text>
        <Text style={styles.subtitle}>
          Connect with buyers and sellers.
        </Text>

        <Text style={styles.connection}>
          {connected ? '● Connected to call server' : '● Connecting...'}
        </Text>
        <Text style={styles.userId}>Your User ID: {userId || 'Loading...'}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {incomingCall && (
          <View style={styles.incomingCard}>
            <Text style={styles.incomingLabel}>
              INCOMING {incomingCall.callType.toUpperCase()} CALL
            </Text>

            <View style={styles.incomingProfile}>
              <View style={styles.largeAvatar}>
                <Text style={styles.largeAvatarText}>
                  {incomingCall.callerName.slice(0, 2).toUpperCase()}
                </Text>
              </View>

              <View>
                <Text style={styles.incomingName}>
                  {incomingCall.callerName}
                </Text>
                <Text style={styles.incomingSubtitle}>
                  Wants to talk with you
                </Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <Pressable style={styles.rejectButton} onPress={rejectCall}>
                <Text style={styles.actionEmoji}>✕</Text>
                <Text style={styles.actionText}>Reject</Text>
              </Pressable>

              <Pressable style={styles.acceptButton} onPress={acceptCall}>
                <Text style={styles.actionEmoji}>✓</Text>
                <Text style={styles.actionText}>Accept</Text>
              </Pressable>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Start a Call</Text>

        <View style={styles.receiverCard}>
          <Text style={styles.receiverLabel}>Enter receiver's User ID</Text>
          <TextInput
            style={styles.receiverInput}
            value={receiverId}
            onChangeText={setReceiverId}
            placeholder="Example: 2"
            keyboardType="number-pad"
            placeholderTextColor="#849087"
          />
          <Text style={styles.receiverHint}>
            Ask the other registered user for their User ID.
          </Text>
        </View>

        {waitingForAnswer && (
          <Text style={styles.waitingText}>
            Calling user {receiverId}... Waiting for answer.
          </Text>
        )}

        <View style={styles.callOptions}>
          <Pressable
            style={styles.optionCard}
            onPress={() => startCall('audio')}
            disabled={waitingForAnswer}
          >
            <Text style={styles.optionEmoji}>📞</Text>
            <Text style={styles.optionTitle}>Audio Call</Text>
            <Text style={styles.optionDescription}>
              Start a voice conversation
            </Text>
          </Pressable>

          <Pressable
            style={styles.optionCard}
            onPress={() => startCall('video')}
            disabled={waitingForAnswer}
          >
            <Text style={styles.optionEmoji}>📹</Text>
            <Text style={styles.optionTitle}>Video Call</Text>
            <Text style={styles.optionDescription}>
              Talk face to face
            </Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Sample Recent Calls</Text>
        <Text style={styles.receiverHint}>
          This is sample history; real call history is not saved yet.
        </Text>

        {[
          { name: 'Rahul Sharma', initials: 'RS', type: 'Audio', time: 'Today, 09:30 AM', status: 'Incoming' },
          { name: 'Priya Reddy', initials: 'PR', type: 'Video', time: 'Today, 08:45 AM', status: 'Outgoing' },
          { name: 'Arjun Kumar', initials: 'AK', type: 'Audio', time: 'Yesterday, 06:20 PM', status: 'Missed' },
          { name: 'Sneha Patel', initials: 'SP', type: 'Video', time: 'Yesterday, 11:15 AM', status: 'Outgoing' },
        ].map((call, index) => (
          <View key={index} style={styles.callCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{call.initials}</Text>
            </View>

            <View style={styles.callInfo}>
              <Text style={styles.personName}>{call.name}</Text>
              <Text style={styles.callStatus}>{call.status} {call.type} Call</Text>
              <Text style={styles.callTime}>{call.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF7',
  },
  header: {
    padding: 20,
  },
  back: {
    fontSize: 16,
    color: '#176B45',
    marginBottom: 18,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#183D2B',
  },
  subtitle: {
    color: '#68776D',
    marginTop: 7,
  },
  connection: {
    color: '#176B45',
    marginTop: 12,
    fontWeight: 'bold',
  },
  userId: {
    color: '#68776D',
    marginTop: 5,
    fontSize: 12,
  },
  incomingCard: {
    backgroundColor: '#E7F3E9',
    marginHorizontal: 18,
    padding: 18,
    borderRadius: 16,
    marginBottom: 25,
  },
  incomingLabel: {
    color: '#176B45',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  incomingProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  largeAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#176B45',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  largeAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  incomingName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#183D2B',
  },
  incomingSubtitle: {
    color: '#68776D',
    marginTop: 5,
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#D94B4B',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#176B45',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionEmoji: {
    color: '#FFFFFF',
    fontSize: 19,
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#183D2B',
    marginHorizontal: 20,
    marginBottom: 14,
    marginTop: 10,
  },
  receiverCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 18,
    padding: 16,
    borderRadius: 14,
    marginBottom: 15,
  },
  receiverLabel: {
    color: '#183D2B',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  receiverInput: {
    borderWidth: 1,
    borderColor: '#D5DED7',
    borderRadius: 9,
    padding: 12,
    color: '#183D2B',
    fontSize: 16,
  },
  receiverHint: {
    color: '#849087',
    fontSize: 12,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  waitingText: {
    color: '#176B45',
    textAlign: 'center',
    marginVertical: 12,
    fontWeight: 'bold',
  },
  callOptions: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 18,
    marginBottom: 25,
  },
  optionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  optionEmoji: {
    fontSize: 30,
    marginBottom: 10,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#176B45',
  },
  optionDescription: {
    fontSize: 11,
    color: '#68776D',
    textAlign: 'center',
    marginTop: 7,
  },
  callCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 18,
    marginBottom: 10,
    padding: 14,
    borderRadius: 13,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#E3F0E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#176B45',
    fontWeight: 'bold',
  },
  callInfo: {
    flex: 1,
    marginLeft: 12,
  },
  personName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#183D2B',
  },
  callStatus: {
    color: '#20A464',
    fontSize: 12,
    marginTop: 5,
  },
  callTime: {
    color: '#849087',
    fontSize: 11,
    marginTop: 4,
  },
});
