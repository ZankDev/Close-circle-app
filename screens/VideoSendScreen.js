import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { fileUploadService } from '../api/databaseService';
import { getCurrentUserId } from '../utils/supabase';

const VideoSendScreen = ({ navigation, route }) => {
  const { videoUri, user, token } = route.params || {};
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const player = useVideoPlayer(videoUri || null, (p) => {
    p.loop = true;
  });

  React.useEffect(() => {
    if (player && videoUri) {
      setTimeout(() => {
        player.play();
        setIsPlaying(true);
      }, 300);
    }
  }, [player, videoUri]);

  const togglePlayback = () => {
    if (!player) return;
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  };

  const uploadAndNavigate = async (extraParams = {}) => {
    setIsUploading(true);
    let finalVideoUri = videoUri;

    try {
      const userId = await getCurrentUserId();
      if (userId && videoUri) {
        const ext = videoUri.split('.').pop() || 'mp4';
        const uploadResult = await fileUploadService.uploadMedia(userId, 'VIDEO', {
          uri: videoUri,
          name: `video_${Date.now()}.${ext}`,
          mimeType: 'video/mp4',
        });
        finalVideoUri = uploadResult.fileUrl;
      }
    } catch (error) {
      console.error('Video upload error:', error);
      // Continue with local URI on failure
    }

    setIsUploading(false);
    navigation.navigate('MessageRecipient', {
      user,
      token,
      videoUri: finalVideoUri,
      attachmentType: 'video',
      messageType: 'video',
      ...extraParams,
    });
  };

  const handleAddLetter = () => uploadAndNavigate({ addLetter: true });
  const handleAddPhoto = () => uploadAndNavigate({ addPhoto: true });
  const handleSendWithout = () => uploadAndNavigate();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#DED9CC" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-forward" size={24} color="#3E4F46" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>שליחת הסרטון</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Video Preview with gold frame */}
        <View style={styles.videoWrapper}>
          <LinearGradient
            colors={['#E5DED3', '#D4AF37', '#C9A830', '#D4AF37', '#E5DED3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.videoBorder}
          >
            <View style={styles.videoInner}>
              {videoUri ? (
                <View style={{ flex: 1 }}>
                  <VideoView
                    player={player}
                    style={styles.video}
                    contentFit="cover"
                    nativeControls={false}
                  />
                  <View style={styles.videoControlsBar}>
                    <TouchableOpacity style={styles.playPauseBtn} onPress={togglePlayback} activeOpacity={0.7}>
                      <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.noVideoPlaceholder}>
                  <Ionicons name="videocam-off-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.noVideoText}>אין סרטון</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Options */}
        <Text style={styles.sectionTitle}>האם תרצה להוסיף לסרטון?</Text>

        {isUploading ? (
          <View style={{ alignItems: 'center', paddingVertical: 24 }}>
            <Text style={{ color: '#C5A059', fontFamily: 'Rubik_500Medium', fontSize: 16 }}>מעלה סרטון...</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity style={styles.optionCard} onPress={handleAddLetter} activeOpacity={0.7}>
              <View style={styles.optionCardInner}>
                <Ionicons name="chevron-back" size={20} color="#C5A059" />
                <View style={styles.optionTextWrap}>
                  <Text style={styles.optionTitle}>הוסף מכתב / ברכה</Text>
                  <Text style={styles.optionDesc}>צרף מכתב אישי או ברכה לסרטון</Text>
                </View>
                <View style={styles.optionIconWrap}>
                  <Ionicons name="document-text-outline" size={26} color="#C5A059" />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={handleAddPhoto} activeOpacity={0.7}>
              <View style={styles.optionCardInner}>
                <Ionicons name="chevron-back" size={20} color="#C5A059" />
                <View style={styles.optionTextWrap}>
                  <Text style={styles.optionTitle}>הוסף תמונה מהעבר</Text>
                  <Text style={styles.optionDesc}>בחר תמונה מהגלריה לצירוף</Text>
                </View>
                <View style={styles.optionIconWrap}>
                  <Ionicons name="image-outline" size={26} color="#7A8F74" />
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>או</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.sendWithoutBtn} onPress={handleSendWithout} activeOpacity={0.85}>
              <LinearGradient
                colors={['#D4AF37', '#C5A059']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sendWithoutGradient}
              >
                <Ionicons name="send-outline" size={20} color="#fff" />
                <Text style={styles.sendWithoutText}>שגר מסר ללא מכתב / תמונה</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#DED9CC',
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3E4F46',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  videoWrapper: {
    height: 300,
    marginBottom: 28,
  },
  videoBorder: {
    flex: 1,
    borderRadius: 16,
    padding: 3,
  },
  videoInner: {
    flex: 1,
    borderRadius: 13,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  videoControlsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 46,
    backgroundColor: 'rgba(0,0,0,0.45)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 13,
    borderBottomRightRadius: 13,
  },
  playPauseBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noVideoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noVideoText: {
    color: '#9CA3AF',
    fontSize: 15,
    marginTop: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3E4F46',
    textAlign: 'center',
    marginBottom: 20,
  },

  optionCard: {
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: '#F7F5EF',
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  optionCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D8D2C2',
  },
  optionIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#F3F1EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  optionTextWrap: {
    flex: 1,
    marginHorizontal: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3E4F46',
    textAlign: 'right',
    marginBottom: 3,
  },
  optionDesc: {
    fontSize: 13,
    color: '#6F8F90',
    textAlign: 'right',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D8D2C2',
  },
  dividerText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginHorizontal: 12,
  },

  sendWithoutBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  sendWithoutGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  sendWithoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default VideoSendScreen;
