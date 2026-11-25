
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://192.168.29.105:5000';

type Conversation = {
  user_id: number;
  name: string;
  role: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
};

export default function MessagesScreen() {
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');

      if (!token) {
        setConversations([]);
        Alert.alert('Login Required', 'Please login again.');
        return;
      }

      const response = await fetch(`${API_URL}/api/messages`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load conversations');
      }

      setConversations(data.conversations || []);
    } catch (error: any) {
      console.log('Fetch conversations error:', error);
      Alert.alert(
        'Error',
        error.message || 'Unable to load messages.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch latest conversations whenever this screen becomes active
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchConversations();
    }, [])
  );

  const formatTime = (dateString: string) => {
    if (!dateString) return '';

    const date = new Date(dateString);

    if (isNaN(date.getTime())) return '';

    const today = new Date();

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return date.toLocaleDateString([], {
      day: '2-digit',
      month: 'short',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('');
  };

  const filteredConversations = conversations.filter((person) =>
    person.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/dashboard');
            }
          }}
        >
          <Text style={styles.back}>← Back</Text>
        </Pressable>

        <Text style={styles.heading}>Messages</Text>

        <Text style={styles.subtitle}>
          Connect with buyers, sellers and brokers.
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#176B45"
          style={{ marginTop: 40 }}
        />
      ) : (
        <ScrollView>
          {filteredConversations.length === 0 ? (
            <Text style={styles.empty}>
              {search
                ? 'No conversations found.'
                : 'No messages yet. Start a conversation!'}
            </Text>
          ) : (
            filteredConversations.map((person) => (
              <Pressable
                key={person.user_id}
                style={styles.chatCard}
                onPress={() =>
                  router.push({
                    pathname: '/chat',
                    params: {
                      userId: String(person.user_id),
                      name: person.name,
                      role: person.role,
                    },
                  })
                }
              >
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {getInitials(person.name)}
                  </Text>
                </View>

                <View style={styles.chatInfo}>
                  <View style={styles.nameRow}>
                    <View style={styles.personNameContainer}>
                      <Text style={styles.name}>
                        {person.name}
                      </Text>

                      <Text style={styles.role}>
                        {person.role}
                      </Text>
                    </View>

                    <Text style={styles.time}>
                      {formatTime(person.last_message_time)}
                    </Text>
                  </View>

                  <View style={styles.messageRow}>
                    <Text
                      style={styles.lastMessage}
                      numberOfLines={1}
                    >
                      {person.last_message}
                    </Text>

                    {person.unread_count > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>
                          {person.unread_count}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>
      )}
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
    color: '#176B45',
    fontSize: 16,
    marginBottom: 20,
  },
  heading: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#183D2B',
  },
  subtitle: {
    color: '#68776D',
    marginTop: 7,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDE5DD',
    marginBottom: 15,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    padding: 14,
    fontSize: 15,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 17,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 13,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F0E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#176B45',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 13,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  personNameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#183D2B',
  },
  role: {
    fontSize: 11,
    color: '#849087',
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    color: '#849087',
    marginLeft: 5,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 7,
  },
  lastMessage: {
    color: '#68776D',
    fontSize: 13,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#176B45',
    minWidth: 21,
    height: 21,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 5,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#68776D',
    paddingHorizontal: 20,
  },
});
