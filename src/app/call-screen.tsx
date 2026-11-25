
import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import {
  AudioSession,
  LiveKitRoom,
  VideoTrack,
  useTracks,
  useRoomContext,
  isTrackReference,
  registerGlobals,
} from '@livekit/react-native';

import { Track, RoomEvent } from 'livekit-client';

registerGlobals();

const API_URL = 'https://landconnect-1yni.onrender.com';

type CallControlsProps = {
  callType: string;
  onEnd: () => void;
  setStatus: (value: string) => void;
};

function CallControls({
  callType,
  onEnd,
  setStatus,
}: CallControlsProps) {
  const room = useRoomContext();

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(
    callType === 'Video'
  );

  const tracks = useTracks([Track.Source.Camera]);

  useEffect(() => {
    const connected = () => setStatus('Connected');
    const disconnected = () => setStatus('Disconnected');
    const reconnecting = () => setStatus('Reconnecting...');

    room.on(RoomEvent.Connected, connected);
    room.on(RoomEvent.Disconnected, disconnected);
    room.on(RoomEvent.Reconnecting, reconnecting);

    if (room.state === 'connected') {
      setStatus('Connected');
    }

    return () => {
      room.off(RoomEvent.Connected, connected);
      room.off(RoomEvent.Disconnected, disconnected);
      room.off(RoomEvent.Reconnecting, reconnecting);
    };
  }, [room, setStatus]);

  const toggleMicrophone = async () => {
    try {
      await room.localParticipant.setMicrophoneEnabled(isMuted);
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Microphone error:', error);
      setStatus('Microphone error');
    }
  };

  const toggleCamera = async () => {
    try {
      await room.localParticipant.setCameraEnabled(!isCameraOn);
      setIsCameraOn(!isCameraOn);
    } catch (error) {
      console.error('Camera error:', error);
      setStatus('Camera error');
    }
  };

  const endCall = async () => {
    await room.disconnect();
    onEnd();
  };

  return (
    <View style={styles.controlsSection}>
      {callType === 'Video' && (
        <View style={styles.videoContainer}>
          {tracks.map((trackRef, index) =>
            isTrackReference(trackRef) ? (
              <VideoTrack
                key={`${trackRef.participant.identity}-${index}`}
                trackRef={trackRef}
                style={styles.videoTrack}
              />
            ) : null
          )}
        </View>
      )}

      <View style={styles.controlRow}>
        <Pressable
          style={[styles.controlButton, isMuted && styles.activeControl]}
          onPress={toggleMicrophone}
        >
          <Text style={styles.controlEmoji}>
            {isMuted ? '🔇' : '🎙️'}
          </Text>
          <Text style={styles.controlText}>
            {isMuted ? 'Unmute' : 'Mute'}
          </Text>
        </Pressable>

        {callType === 'Video' && (
          <Pressable
            style={[
              styles.controlButton,
              !isCameraOn && styles.activeControl,
            ]}
            onPress={toggleCamera}
          >
            <Text style={styles.controlEmoji}>
              {isCameraOn ? '📹' : '🚫'}
            </Text>
            <Text style={styles.controlText}>
              {isCameraOn ? 'Camera On' : 'Camera Off'}
            </Text>
          </Pressable>
        )}
      </View>

      <Pressable
        style={styles.endCallButton}
        onPress={endCall}
      >
        <Text style={styles.endCallEmoji}>📵</Text>
        <Text style={styles.endCallText}>End Call</Text>
      </Pressable>
    </View>
  );
}

export default function CallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const callType = params.type === 'video' ? 'Video' : 'Audio';

  const roomName = Array.isArray(params.roomName)
    ? params.roomName[0]
    : params.roomName || 'landconnect-demo-room';

  const participantName = useMemo(
    () => `LandConnect-${Date.now()}`,
    []
  );

  const [token, setToken] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [status, setStatus] = useState('Connecting...');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const connectToBackend = async () => {
      try {
        await AudioSession.startAudioSession();

        const response = await fetch(`${API_URL}/api/calls/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomName,
            participantName,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Token request failed');
        }

        if (!data.token || !data.serverUrl) {
          throw new Error('Invalid LiveKit token response');
        }

        if (active) {
          setToken(data.token);
          setServerUrl(data.serverUrl);
        }
      } catch (err) {
        console.error('Call connection error:', err);

        if (active) {
          setError(
            err instanceof Error ? err.message : 'Connection failed'
          );
          setStatus('Connection failed');
        }
      }
    };

    connectToBackend();

    return () => {
      active = false;
      AudioSession.stopAudioSession().catch(console.error);
    };
  }, [roomName, participantName]);

  const handleEnd = () => {
    router.replace('/calls');
  };

  if (error) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.title}>Call Connection Failed</Text>
        <Text style={styles.errorText}>{error}</Text>

        <Pressable style={styles.endCallButton} onPress={handleEnd}>
          <Text style={styles.endCallText}>Back to Calls</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!token || !serverUrl) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#176B45" />
        <Text style={styles.loadingText}>
          Connecting to LandConnect...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LiveKitRoom
        serverUrl={serverUrl}
        token={token}
        connect={true}
        audio={true}
        video={callType === 'Video'}
      >
        <View style={styles.topSection}>
          <Text style={styles.callLabel}>
            LANDCONNECT {callType.toUpperCase()} CALL
          </Text>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>LC</Text>
          </View>

          <Text style={styles.callerName}>LandConnect User</Text>
          <Text style={styles.callStatus}>{status}</Text>
        </View>

        <CallControls
          callType={callType}
          onEnd={handleEnd}
          setStatus={setStatus}
        />

        <Text style={styles.footer}>
          LandConnect • Private Conversations
        </Text>
      </LiveKitRoom>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#183D2B',
    justifyContent: 'space-between',
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#183D2B',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  topSection: {
    alignItems: 'center',
    marginTop: 35,
  },
  callLabel: {
    color: '#B8D9C1',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E3F0E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#176B45',
  },
  callerName: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 20,
  },
  callStatus: {
    color: '#B8D9C1',
    fontSize: 15,
    marginTop: 10,
  },
  videoContainer: {
    width: '100%',
    height: 220,
    marginBottom: 25,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#244E39',
  },
  videoTrack: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  controlsSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 30,
  },
  controlButton: {
    width: 95,
    height: 85,
    borderRadius: 18,
    backgroundColor: '#315C45',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeControl: {
    backgroundColor: '#557C62',
  },
  controlEmoji: {
    fontSize: 25,
  },
  controlText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 8,
  },
  endCallButton: {
    width: 160,
    backgroundColor: '#D94B4B',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  endCallEmoji: {
    fontSize: 23,
  },
  endCallText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 4,
  },
  footer: {
    color: '#B8D9C1',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 15,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    color: '#FFBABA',
    marginTop: 15,
    textAlign: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 15,
  },
});
