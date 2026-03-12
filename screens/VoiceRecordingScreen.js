import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { fileUploadService } from '../api/databaseService';
import { getCurrentUserId } from '../utils/supabase';

const VoiceRecordingScreen = ({ navigation, route }) => {
  const { user, token } = route.params || {};
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedUri, setRecordedUri] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const timerRef = useRef(null);

  // Animation values
  const wave1 = useRef(new Animated.Value(0.3)).current;
  const wave2 = useRef(new Animated.Value(0.5)).current;
  const wave3 = useRef(new Animated.Value(0.7)).current;
  const wave4 = useRef(new Animated.Value(0.5)).current;
  const wave5 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    setupAudio();
    return () => {
      if (recording) recording.stopAndUnloadAsync();
      if (sound) sound.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      startWaveAnimation();
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      stopWaveAnimation();
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const setupAudio = async () => {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
  };

  const startWaveAnimation = () => {
    const animateWave = (wave, min, max) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(wave, {
            toValue: max,
            duration: 400,
            useNativeDriver: false,
          }),
          Animated.timing(wave, {
            toValue: min,
            duration: 400,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    animateWave(wave1, 0.3, 0.8);
    animateWave(wave2, 0.4, 0.9);
    animateWave(wave3, 0.5, 1);
    animateWave(wave4, 0.4, 0.9);
    animateWave(wave5, 0.3, 0.8);
  };

  const stopWaveAnimation = () => {
    wave1.stopAnimation();
    wave2.stopAnimation();
    wave3.stopAnimation();
    wave4.stopAnimation();
    wave5.stopAnimation();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      Alert.alert('שגיאה', 'לא ניתן להתחיל הקלטה');
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri);
      setRecording(null);
    } catch (error) {
      Alert.alert('שגיאה', 'בעיה בעצירת ההקלטה');
    }
  };

  const playRecording = async () => {
    try {
      if (isPlaying && sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: recordedUri },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      Alert.alert('שגיאה', 'לא ניתן לנגן את ההקלטה');
    }
  };

  const retake = async () => {
    Alert.alert(
      'הקלטה חדשה',
      'האם אתה בטוח? בהמשך כל ההקלטה שבוצעה עד כה תימחק',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'אישור',
          style: 'destructive',
          onPress: async () => {
            if (sound) {
              await sound.unloadAsync();
              setSound(null);
            }
            setRecordedUri(null);
            setRecordingTime(0);
            setIsPlaying(false);
          },
        },
      ]
    );
  };

  const handleNext = async () => {
    if (!recordedUri) {
      Alert.alert('שגיאה', 'אנא הקלט הודעה קולית');
      return;
    }

    setIsUploading(true);
    try {
      const userId = await getCurrentUserId();
      let uploadedUrl = null;

      if (userId) {
        const ext = recordedUri.split('.').pop() || 'm4a';
        const uploadResult = await fileUploadService.uploadMedia(userId, 'AUDIO', {
          uri: recordedUri,
          name: `audio_${Date.now()}.${ext}`,
          mimeType: 'audio/m4a',
        });
        uploadedUrl = uploadResult.fileUrl;
      }

      navigation.navigate('MessageRecipient', {
        user,
        token,
        messageType: 'audio',
        attachmentType: 'audio',
        audioUri: uploadedUrl || recordedUri,
        messageContent: {
          audioUri: uploadedUrl || recordedUri,
          duration: recordingTime,
        },
      });
    } catch (error) {
      console.error('Audio upload error:', error);
      // Navigate even on upload failure — attachment will be local URI
      navigation.navigate('MessageRecipient', {
        user,
        token,
        messageType: 'audio',
        attachmentType: 'audio',
        audioUri: recordedUri,
        messageContent: { audioUri: recordedUri, duration: recordingTime },
      });
    }
    setIsUploading(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0E8" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-forward" size={28} color="#2D5B5B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>צור מסר קולי</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {recordedUri ? (
          /* Preview Mode */
          <View style={styles.previewContainer}>
            <View style={styles.audioPreview}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={playRecording}
              >
                <LinearGradient
                  colors={['#D4AF37', '#C5A059']}
                  style={styles.playButtonGradient}
                >
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={48}
                    color="#FFF"
                  />
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.previewInfo}>
                <Text style={styles.previewTitle}>
                  {isPlaying ? 'מנגן...' : 'הקלטה מוכנה'}
                </Text>
                <Text style={styles.previewDuration}>
                  משך: {formatTime(recordingTime)}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.retakeButton} onPress={retake}>
              <Ionicons name="refresh-outline" size={22} color="#EF4444" />
              <Text style={styles.retakeText}>הקלט מחדש</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Recording Mode */
          <View style={styles.recordingContainer}>
            {/* Wave Animation */}
            <View style={styles.waveContainer}>
              <Animated.View
                style={[
                  styles.wave,
                  {
                    height: wave1.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['20%', '80%'],
                    }),
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.wave,
                  {
                    height: wave2.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['20%', '80%'],
                    }),
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.wave,
                  {
                    height: wave3.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['20%', '80%'],
                    }),
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.wave,
                  {
                    height: wave4.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['20%', '80%'],
                    }),
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.wave,
                  {
                    height: wave5.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['20%', '80%'],
                    }),
                  },
                ]}
              />
            </View>

            {/* Timer */}
            {isRecording && (
              <Text style={styles.timer}>{formatTime(recordingTime)}</Text>
            )}

            {/* Record Button */}
            <TouchableOpacity
              style={[
                styles.recordButton,
                isRecording && styles.recordButtonActive,
              ]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <View
                style={[
                  styles.recordButtonInner,
                  isRecording && styles.recordButtonInnerActive,
                ]}
              />
            </TouchableOpacity>

            <Text style={styles.hint}>
              {isRecording ? 'לחץ לעצירה' : 'לחץ להקלטה'}
            </Text>
          </View>
        )}
      </View>

      {/* Next Button */}
      {recordedUri && (
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.nextButton, isUploading && { opacity: 0.7 }]}
            onPress={handleNext}
            disabled={isUploading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#D4AF37', '#C5A059']}
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.nextButtonText}>{isUploading ? 'מעלה...' : 'המשך'}</Text>
              {!isUploading && <Ionicons name="arrow-back" size={22} color="#FFF" />}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DED9CC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5DED3',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D5B5B',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  recordingContainer: {
    alignItems: 'center',
    width: '100%',
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    gap: 8,
    marginBottom: 40,
  },
  wave: {
    width: 8,
    backgroundColor: '#D4AF37',
    borderRadius: 4,
  },
  timer: {
    fontSize: 48,
    fontWeight: '700',
    color: '#C5A059',
    marginBottom: 40,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F7F5EF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#D4AF37',
    marginBottom: 20,
  },
  recordButtonActive: {
    borderColor: '#EF4444',
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D4AF37',
  },
  recordButtonInnerActive: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  hint: {
    fontSize: 16,
    color: '#5A6B6B',
    fontWeight: '500',
  },
  previewContainer: {
    width: '100%',
    alignItems: 'center',
  },
  audioPreview: {
    backgroundColor: '#F7F5EF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  playButton: {
    marginBottom: 20,
  },
  playButtonGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewInfo: {
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D5B5B',
    marginBottom: 8,
  },
  previewDuration: {
    fontSize: 14,
    color: '#7A8A8A',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  retakeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  bottomSection: {
    padding: 20,
  },
  nextButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default VoiceRecordingScreen;
