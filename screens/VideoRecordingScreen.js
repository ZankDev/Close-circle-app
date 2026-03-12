import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';

const VideoRecordingScreen = ({ navigation, route }) => {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [facing, setFacing] = useState('front');
  const [recordingTime, setRecordingTime] = useState(0);
  const [showSavedNotif, setShowSavedNotif] = useState(false);

  const cameraRef = useRef(null);
  const timerRef = useRef(null);
  // Flag to prevent setting previewMode when stopRecording is called for pause
  const pausingRef = useRef(false);
  // Keep accumulated time so resume continues from same point
  const accumulatedTimeRef = useRef(0);

  useEffect(() => {
    (async () => {
      await requestCameraPermission();
      await requestMicPermission();
      await MediaLibrary.requestPermissionsAsync();
    })();
  }, []);

  const player = useVideoPlayer(recordedVideo, (p) => {
    p.loop = false;
  });

  // Timer management
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        const videoData = await cameraRef.current.recordAsync({
          maxDuration: 120, // 2 minutes per PDF spec
        });
        // Only enter preview mode if this stop was NOT triggered by pause
        if (!pausingRef.current && videoData && videoData.uri) {
          setRecordedVideo(videoData.uri);
          setIsPreviewMode(true);
        }
        pausingRef.current = false;
        setIsRecording(false);
      } catch (error) {
        console.error('Recording error:', error);
        pausingRef.current = false;
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
    setIsRecording(false);
  };

  const toggleFacing = () => {
    setFacing(prev => prev === 'front' ? 'back' : 'front');
  };

  const retakeVideo = () => {
    Alert.alert(
      'הקלטה חדשה',
      'האם אתה בטוח? בהמשך כל ההקלטה שבוצעה עד כה תימחק',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'אישור',
          style: 'destructive',
          onPress: () => {
            setRecordedVideo(null);
            setIsPreviewMode(false);
            setIsPaused(false);
            setRecordingTime(0);
            accumulatedTimeRef.current = 0;
          },
        },
      ]
    );
  };

  const pauseRecording = () => {
    if (isRecording && cameraRef.current) {
      pausingRef.current = true;
      accumulatedTimeRef.current = recordingTime;
      cameraRef.current.stopRecording();
      setIsRecording(false);
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const resumeRecording = async () => {
    setIsPaused(false);
    await startRecording();
  };

  const retakeFromPause = () => {
    Alert.alert(
      'הקלטה חדשה',
      'האם אתה בטוח? בהמשך כל ההקלטה שבוצעה עד כה תימחק',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'אישור',
          style: 'destructive',
          onPress: () => {
            setRecordedVideo(null);
            setIsPaused(false);
            setRecordingTime(0);
            accumulatedTimeRef.current = 0;
          },
        },
      ]
    );
  };

  const saveVideo = async () => {
    if (recordedVideo) {
      try {
        await MediaLibrary.createAssetAsync(recordedVideo);
        setShowSavedNotif(true);
        setTimeout(() => {
          setShowSavedNotif(false);
          navigation.replace('VideoSend', {
            videoUri: recordedVideo,
            ...(route?.params || {}),
          });
        }, 3000);
      } catch (error) {
        console.error('Error saving video:', error);
        Alert.alert('שגיאה', 'לא ניתן לשמור את הסרטון');
      }
    }
  };

  // ── Permission screens ──
  if (!cameraPermission || !micPermission) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#DED9CC" />
        <Text style={styles.permissionText}>מבקש הרשאות מצלמה...</Text>
      </View>
    );
  }

  if (!cameraPermission.granted || !micPermission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#DED9CC" />
        <Ionicons name="videocam-off-outline" size={60} color="#C5A059" />
        <Text style={styles.permissionTitle}>נדרשת הרשאה</Text>
        <Text style={styles.permissionText}>
          יש לאשר גישה למצלמה ולמיקרופון כדי להקליט וידאו
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={async () => {
            await requestCameraPermission();
            await requestMicPermission();
          }}
        >
          <Text style={styles.permissionButtonText}>אשר הרשאות</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>חזור</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Main screen ──
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View style={styles.fullScreenVideo}>
        {isPreviewMode && recordedVideo ? (
          <VideoView
            player={player}
            style={styles.video}
            contentFit="cover"
            nativeControls={true}
          />
        ) : (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            mode="video"
          />
        )}

        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={30} color="#FFF" />
          </TouchableOpacity>

          {!isPreviewMode && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={toggleFacing}
            >
              <Ionicons name="camera-reverse" size={30} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Recording Timer Overlay */}
        {isRecording && (
          <View style={styles.recordingOverlay}>
            <View style={styles.recordingIndicator}>
              <View style={styles.pulseDot} />
              <Text style={styles.recordingText}>REC {formatTime(recordingTime)}</Text>
            </View>
          </View>
        )}

        {/* Paused timer */}
        {isPaused && (
          <View style={styles.recordingOverlay}>
            <View style={[styles.recordingIndicator, styles.pausedIndicator]}>
              <Ionicons name="pause" size={12} color="#FFF" />
              <Text style={styles.recordingText}>מושהה {formatTime(recordingTime)}</Text>
            </View>
          </View>
        )}

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {isPreviewMode ? (
            <View style={styles.previewButtons}>
              <TouchableOpacity style={styles.retakeButton} onPress={retakeVideo}>
                <Ionicons name="refresh-outline" size={26} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveVideo}>
                <Ionicons name="checkmark" size={32} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : isPaused ? (
            <View style={styles.pausedButtons}>
              <TouchableOpacity style={styles.retakeButton} onPress={retakeFromPause}>
                <Ionicons name="refresh-outline" size={26} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.playButton} onPress={resumeRecording} activeOpacity={0.8}>
                <Ionicons name="play" size={32} color="#FFF" />
              </TouchableOpacity>
              <View style={{ width: 64 }} />
            </View>
          ) : (
            <View style={styles.recordingButtons}>
              <View style={{ width: 60 }} />
              <TouchableOpacity
                style={styles.recordButtonOuter}
                onPress={isRecording ? stopRecording : startRecording}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.recordButtonInner,
                  isRecording && styles.recordButtonRecording,
                ]} />
              </TouchableOpacity>
              {isRecording ? (
                <TouchableOpacity
                  style={styles.pauseButtonSmall}
                  onPress={pauseRecording}
                  activeOpacity={0.8}
                >
                  <Ionicons name="pause" size={22} color="#FFF" />
                </TouchableOpacity>
              ) : (
                <View style={{ width: 60 }} />
              )}
            </View>
          )}
        </View>

        {/* Success notification */}
        {showSavedNotif && (
          <View style={styles.savedNotif}>
            <Ionicons name="checkmark-circle" size={20} color="#D4AF37" />
            <Text style={styles.savedNotifText}>הסרטון נשמר בהצלחה</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  /* Permission Screens */
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#DED9CC',
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3E4F46',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    color: '#6F8F90',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  backButtonText: {
    color: '#C5A059',
    fontSize: 16,
    fontWeight: '600',
  },

  /* Full Screen Video */
  fullScreenVideo: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  video: {
    flex: 1,
    backgroundColor: '#000',
  },

  /* Top Bar */
  topBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Recording Overlay */
  recordingOverlay: {
    position: 'absolute',
    top: 120,
    left: 20,
    zIndex: 10,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 8,
  },
  pausedIndicator: {
    backgroundColor: 'rgba(197, 160, 89, 0.95)',
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFF',
  },
  recordingText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },

  /* Bottom Controls */
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 10,
  },

  /* Record Mode Buttons */
  recordingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DC2626',
  },
  recordButtonRecording: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#DC2626',
  },

  /* Preview Mode Buttons */
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  retakeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  saveButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  pausedButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  pauseButtonSmall: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  savedNotif: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -25 }],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
    zIndex: 50,
  },
  savedNotifText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VideoRecordingScreen;
