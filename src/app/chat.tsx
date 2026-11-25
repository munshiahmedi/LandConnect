
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://landconnect-1yni.onrender.com';

type Message = {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  is_read: number;
  created_at: string;
};

export default function ChatScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    userId: string;
    name: string;
    role: string;
  }>();

  const receiverId = Number(params.userId);
  const receiverName = params.name || 'User';
  const receiverRole = params.role || '';

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const getToken = async () => {
    return await SecureStore.getItemAsync('authToken');
  };

  const loadChat = async () => {
    try {
      const token = await getToken();

      if (!token) {
        throw new Error('Login required. Please login again.');
      }

      if (!receiverId || Number.isNaN(receiverId)) {
        throw new Error('Invalid conversation user.');
      }

      // Get logged-in user's profile
      const profileResponse = await fetch(
        `${API_URL}/api/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const profileData = await profileResponse.json();

      if (!profileResponse.ok) {
        throw new Error(
          profileData.message || 'Unable to get user profile'
        );
      }

      const loggedInUser = profileData.user || profileData;
      const userId = Number(loggedInUser.id);

      if (!userId) {
        throw new Error('Unable to identify logged-in user.');
      }

      setCurrentUserId(userId);

      // Get conversation history
      const response = await fetch(
        `${API_URL}/api/messages/${receiverId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Unable to load chat messages'
        );
      }

      setMessages(data.messages || []);
    } catch (error: any) {
      console.log('Load chat error:', error);
      Alert.alert('Chat Error', error.message || 'Unable to load chat.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChat();
  }, [receiverId]);

  const handleSend = async () => {
    const text = message.trim();

    if (!text || sending) return;

    try {
      setSending(true);

      const token = await getToken();

      if (!token) {
        throw new Error('Please login again.');
      }

      const response = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId,
          message: text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Message could not be sent.');
      }

      setMessage('');

      // Reload messages from database
      await loadChat();
    } catch (error: any) {
      console.log('Send message error:', error);
      Alert.alert('Message Error', error.message || 'Unable to send message.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return '';

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.replace('/messages')}>
            <Text style={styles.back}>←</Text>
          </Pressable>

          <View style={styles.profile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {receiverName
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((word) => word[0].toUpperCase())
                  .join('')}
              </Text>
            </View>

            <View>
              <Text style={styles.name}>{receiverName}</Text>
              <Text style={styles.online}>
                {receiverRole || 'LandConnect User'}
              </Text>
            </View>
          </View>

          <Pressable onPress={() => router.push('/calls')}>
            <Text style={styles.callIcon}>📞</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#176B45"
            style={{ flex: 1 }}
          />
        ) : (
          <ScrollView
            style={styles.messages}
            contentContainerStyle={styles.messageContent}
          >
            <Text style={styles.date}>Conversation</Text>

            {messages.length === 0 ? (
              <Text style={styles.empty}>
                No messages yet. Start a conversation!
              </Text>
            ) : (
              messages.map((item) => {
                const isMine = item.sender_id === currentUserId;

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.messageRow,
                      isMine ? styles.myRow : styles.otherRow,
                    ]}
                  >
                    <View
                      style={[
                        styles.bubble,
                        isMine ? styles.myBubble : styles.otherBubble,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          isMine ? styles.myText : styles.otherText,
                        ]}
                      >
                        {item.message}
                      </Text>

                      <Text
                        style={[
                          styles.time,
                          isMine ? styles.myTime : styles.otherTime,
                        ]}
                      >
                        {formatTime(item.created_at)}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={handleSend}
            editable={!sending}
          />

          <Pressable
            style={[
              styles.sendButton,
              sending && { opacity: 0.5 },
            ]}
            onPress={handleSend}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.sendText}>➤</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF7',
  },
  keyboard: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5EAE5',
  },
  back: {
    fontSize: 28,
    color: '#176B45',
    marginRight: 15,
  },
  profile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: '#E3F0E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#176B45',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#183D2B',
  },
  online: {
    color: '#20A464',
    fontSize: 12,
    marginTop: 3,
  },
  callIcon: {
    fontSize: 23,
    paddingHorizontal: 8,
  },
  messages: {
    flex: 1,
  },
  messageContent: {
    padding: 16,
  },
  date: {
    textAlign: 'center',
    color: '#849087',
    marginBottom: 20,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  myRow: {
    justifyContent: 'flex-end',
  },
  otherRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    padding: 12,
    borderRadius: 14,
  },
  myBubble: {
    backgroundColor: '#176B45',
    borderBottomRightRadius: 3,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 3,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  myText: {
    color: '#FFFFFF',
  },
  otherText: {
    color: '#183D2B',
  },
  time: {
    fontSize: 10,
    textAlign: 'right',
    marginTop: 6,
  },
  myTime: {
    color: '#D5E9DC',
  },
  otherTime: {
    color: '#849087',
  },
  empty: {
    textAlign: 'center',
    color: '#849087',
    marginTop: 30,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5EAE5',
  },
  input: {
    flex: 1,
    backgroundColor: '#F2F5F1',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#176B45',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendText: {
    color: '#FFFFFF',
    fontSize: 20,
  },
});
