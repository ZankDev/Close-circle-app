import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Rubik_400Regular, Rubik_500Medium, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Audio } from 'expo-av';

const TYPE_CONFIG = {
  video:  { label: 'סרטון',          icon: 'videocam',          color: '#C5A059' },
  audio:  { label: 'הקלטה קולית',    icon: 'mic',               color: '#7A8F74' },
  photo:  { label: 'תמונה',           icon: 'image',             color: '#5F7F85' },
  letter: { label: 'מכתב / ברכה',    icon: 'document-text',     color: '#D4AF37' },
};

// ─── Audio Player ────────────────────────────────────────────
const AudioPlayer = ({ uri }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const soundRef = useRef(null);

  const togglePlay = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (!soundRef.current) {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
        soundRef.current = sound;
        setIsPlaying(true);
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
            soundRef.current = null;
          }
        });
      } else if (isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (e) {
      Alert.alert('שגיאה', 'לא ניתן להפעיל את ההקלטה');
    }
    setIsLoading(false);
  };

  return (
    <View style={styles.audioPlayer}>
      <LinearGradient colors={['#3E4F46', '#2D3B34']} style={styles.audioGradient}>
        <View style={styles.audioWaveWrap}>
          {[...Array(20)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.audioBar,
                { height: 10 + Math.sin(i * 0.8) * 16 + 8, opacity: isPlaying ? 1 : 0.4 },
              ]}
            />
          ))}
        </View>
        <TouchableOpacity style={styles.audioPlayBtn} onPress={togglePlay} activeOpacity={0.8}>
          <LinearGradient colors={['#D4AF37', '#C5A059']} style={styles.audioPlayGradient}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.audioLabel}>{isPlaying ? 'מושמע...' : 'לחץ להשמעה'}</Text>
      </LinearGradient>
    </View>
  );
};

// ─── Video Player ────────────────────────────────────────────
const VideoPlayer = ({ uri }) => {
  const player = useVideoPlayer(uri, (p) => { p.loop = false; });
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!player) return;
    if (isPlaying) { player.pause(); setIsPlaying(false); }
    else { player.play(); setIsPlaying(true); }
  };

  return (
    <View style={styles.videoContainer}>
      <VideoView player={player} style={styles.video} contentFit="contain" />
      <TouchableOpacity style={styles.videoPlayOverlay} onPress={togglePlay} activeOpacity={0.8}>
        {!isPlaying && (
          <View style={styles.videoPlayBtn}>
            <Ionicons name="play" size={36} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────
const MessageDetailScreen = ({ navigation, route }) => {
  const { message } = route.params || {};

  const [fontsLoaded] = useFonts({ Rubik_400Regular, Rubik_500Medium, Rubik_700Bold });

  if (!fontsLoaded || !message) return null;

  const typeKey = message.type || 'letter';
  const cfg = TYPE_CONFIG[typeKey] || TYPE_CONFIG.letter;

  const dateStr = message.scheduled_date || message.scheduledDate;
  const displayDate = dateStr
    ? new Date(dateStr).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null;

  const firstRecipient = message.recipients?.[0];
  const title =
    message.title ||
    (firstRecipient ? `${cfg.label} ל${firstRecipient.name}` : cfg.label);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#DED9CC" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-forward" size={24} color="#3E4F46" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>פרטי המסר</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Type Badge */}
        <View style={styles.typeBadgeRow}>
          <View style={[styles.typeBadge, { backgroundColor: cfg.color + '20', borderColor: cfg.color }]}>
            <Ionicons name={cfg.icon} size={16} color={cfg.color} />
            <Text style={[styles.typeBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          {displayDate && (
            <View style={styles.dateBadge}>
              <Ionicons name="calendar-outline" size={14} color="#7A8F74" />
              <Text style={styles.dateBadgeText}>{displayDate}</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={styles.messageTitle}>{title}</Text>

        {/* ─── Content ─── */}
        {typeKey === 'video' && message.videoUri ? (
          <VideoPlayer uri={message.videoUri} />
        ) : typeKey === 'audio' && message.audioUri ? (
          <AudioPlayer uri={message.audioUri} />
        ) : typeKey === 'photo' && message.photoUri ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri: message.photoUri }} style={styles.photo} resizeMode="cover" />
          </View>
        ) : message.content ? (
          <View style={styles.letterCard}>
            <LinearGradient colors={['#FDFAF4', '#F7F2E8']} style={styles.letterGradient}>
              <Ionicons name="document-text" size={28} color="#D4AF37" style={{ marginBottom: 12 }} />
              <Text style={styles.letterText}>{message.content}</Text>
            </LinearGradient>
          </View>
        ) : (
          <View style={styles.noContentCard}>
            <Ionicons name="cloud-offline-outline" size={40} color="#D8D2C2" />
            <Text style={styles.noContentText}>תוכן המסר אינו זמין במכשיר זה</Text>
            <Text style={styles.noContentSub}>המסר נשמר בשרת ויישלח בתאריך שנקבע</Text>
          </View>
        )}

        {/* Recipients */}
        {message.recipients?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>נמענים</Text>
            {message.recipients.map((r, i) => (
              <View key={i} style={styles.recipientRow}>
                <View style={styles.recipientAvatar}>
                  <Text style={styles.recipientAvatarText}>{r.name?.[0] || '?'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recipientName}>{r.name}</Text>
                  <Text style={styles.recipientPhone}>{r.phone}</Text>
                  {r.email ? <Text style={styles.recipientEmail}>{r.email}</Text> : null}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Scheduled Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color="#7A8F74" />
            <Text style={styles.infoLabel}>סטטוס</Text>
            <View style={[styles.statusBadge, { backgroundColor: message.status === 'scheduled' ? '#7A8F7420' : '#D4AF3720' }]}>
              <Text style={[styles.statusText, { color: message.status === 'scheduled' ? '#7A8F74' : '#D4AF37' }]}>
                {message.status === 'scheduled' ? 'מתוזמן' : message.status === 'draft' ? 'טיוטה' : message.status || 'מתוזמן'}
              </Text>
            </View>
          </View>
          {displayDate && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={18} color="#C5A059" />
              <Text style={styles.infoLabel}>תאריך שליחה</Text>
              <Text style={styles.infoValue}>{displayDate}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Ionicons name="create-outline" size={18} color="#5F7F85" />
            <Text style={styles.infoLabel}>נוצר</Text>
            <Text style={styles.infoValue}>
              {message.createdAt
                ? new Date(message.createdAt).toLocaleDateString('he-IL')
                : '—'}
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#DED9CC' },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'Rubik_700Bold', fontSize: 18, color: '#3E4F46' },
  scroll: { padding: 16, paddingBottom: 40 },

  typeBadgeRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 10 },
  typeBadge: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
  },
  typeBadgeText: { fontFamily: 'Rubik_500Medium', fontSize: 12 },
  dateBadge: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 4,
    backgroundColor: '#F5F0E8', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  dateBadgeText: { fontFamily: 'Rubik_400Regular', fontSize: 12, color: '#7A8F74' },

  messageTitle: {
    fontFamily: 'Rubik_700Bold', fontSize: 22, color: '#3E4F46',
    textAlign: 'right', marginBottom: 16,
  },

  // Video
  videoContainer: { borderRadius: 16, overflow: 'hidden', marginBottom: 20, backgroundColor: '#000', aspectRatio: 16 / 9 },
  video: { flex: 1 },
  videoPlayOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  videoPlayBtn: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Audio
  audioPlayer: { borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  audioGradient: { padding: 24, alignItems: 'center' },
  audioWaveWrap: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 20, height: 48 },
  audioBar: { width: 4, borderRadius: 2, backgroundColor: '#C5A059' },
  audioPlayBtn: { marginBottom: 12 },
  audioPlayGradient: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  audioLabel: { fontFamily: 'Rubik_400Regular', fontSize: 13, color: '#EDE8DD' },

  // Photo
  photoContainer: { borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  photo: { width: '100%', height: 280 },

  // Letter
  letterCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  letterGradient: { padding: 24, alignItems: 'center' },
  letterText: { fontFamily: 'Rubik_400Regular', fontSize: 16, color: '#3E4F46', textAlign: 'right', lineHeight: 26 },

  // No content
  noContentCard: {
    backgroundColor: '#F5F0E8', borderRadius: 16, padding: 32,
    alignItems: 'center', marginBottom: 20,
  },
  noContentText: { fontFamily: 'Rubik_500Medium', fontSize: 15, color: '#3E4F46', marginTop: 12, textAlign: 'center' },
  noContentSub: { fontFamily: 'Rubik_400Regular', fontSize: 13, color: '#9CA3AF', marginTop: 6, textAlign: 'center' },

  // Recipients
  section: { marginBottom: 20 },
  sectionTitle: { fontFamily: 'Rubik_700Bold', fontSize: 15, color: '#3E4F46', textAlign: 'right', marginBottom: 10 },
  recipientRow: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 12,
    backgroundColor: '#F5F0E8', borderRadius: 12, padding: 12, marginBottom: 8,
  },
  recipientAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#D4AF37', alignItems: 'center', justifyContent: 'center',
  },
  recipientAvatarText: { fontFamily: 'Rubik_700Bold', fontSize: 16, color: '#fff' },
  recipientName: { fontFamily: 'Rubik_500Medium', fontSize: 15, color: '#3E4F46', textAlign: 'right' },
  recipientPhone: { fontFamily: 'Rubik_400Regular', fontSize: 13, color: '#7A8F74', textAlign: 'right' },
  recipientEmail: { fontFamily: 'Rubik_400Regular', fontSize: 12, color: '#9CA3AF', textAlign: 'right' },

  // Info card
  infoCard: { backgroundColor: '#F5F0E8', borderRadius: 16, padding: 16, gap: 12 },
  infoRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  infoLabel: { fontFamily: 'Rubik_400Regular', fontSize: 14, color: '#6B7280', flex: 1, textAlign: 'right' },
  infoValue: { fontFamily: 'Rubik_500Medium', fontSize: 14, color: '#3E4F46' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  statusText: { fontFamily: 'Rubik_500Medium', fontSize: 12 },
});

export default MessageDetailScreen;
