import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

const PhotoMessageScreen = ({ navigation, route }) => {
  const { user, token } = route.params || {};
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('front');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const openCamera = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert('שגיאה', 'נדרשת הרשאה למצלמה');
        return;
      }
    }
    setShowCamera(true);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        setSelectedImage(photo.uri);
        setShowCamera(false);
      } catch (error) {
        Alert.alert('שגיאה', 'לא ניתן לצלם תמונה');
      }
    }
  };

  const toggleFacing = () => {
    setFacing(prev => prev === 'front' ? 'back' : 'front');
  };

  const retake = () => {
    setSelectedImage(null);
    setShowCamera(false);
  };

  const handleNext = () => {
    if (!selectedImage) {
      Alert.alert('שגיאה', 'אנא בחר תמונה');
      return;
    }

    navigation.navigate('MessageRecipient', {
      user,
      token,
      messageType: 'photo',
      photoUri: selectedImage,
      messageContent: selectedImage,
    });
  };

  // Camera Mode
  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        >
          {/* Top Bar */}
          <View style={styles.cameraTopBar}>
            <TouchableOpacity
              style={styles.cameraIconButton}
              onPress={() => setShowCamera(false)}
            >
              <Ionicons name="close" size={30} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cameraIconButton}
              onPress={toggleFacing}
            >
              <Ionicons name="camera-reverse" size={30} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Capture Button */}
          <View style={styles.cameraBottomBar}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  // Main Screen
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0E8" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-forward" size={28} color="#2D5B5B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>מסר תמונה</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {selectedImage ? (
          /* Image Preview */
          <View style={styles.previewSection}>
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            </View>

            <TouchableOpacity style={styles.retakeButton} onPress={retake}>
              <Ionicons name="refresh-outline" size={22} color="#F59E0B" />
              <Text style={styles.retakeText}>בחר תמונה אחרת</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Image Selection */
          <View style={styles.selectionSection}>
            <Ionicons name="image-outline" size={80} color="#7A8A8A" />
            <Text style={styles.selectionTitle}>בחר תמונה למסר</Text>
            <Text style={styles.selectionSubtitle}>
              צלם תמונה חדשה או בחר מהגלריה
            </Text>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={openCamera}
              >
                <LinearGradient
                  colors={['#F59E0B', '#FBBF24']}
                  style={styles.optionGradient}
                >
                  <Ionicons name="camera" size={32} color="#FFF" />
                  <Text style={styles.optionText}>צלם תמונה</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionButton}
                onPress={pickImage}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#A78BFA']}
                  style={styles.optionGradient}
                >
                  <Ionicons name="images" size={32} color="#FFF" />
                  <Text style={styles.optionText}>בחר מהגלריה</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Next Button */}
      {selectedImage && (
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#F59E0B', '#FBBF24']}
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.nextButtonText}>המשך</Text>
              <Ionicons name="arrow-back" size={22} color="#FFF" />
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
    backgroundColor: '#F5F0E8',
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
  selectionSection: {
    alignItems: 'center',
    width: '100%',
  },
  selectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D5B5B',
    marginTop: 20,
    marginBottom: 8,
  },
  selectionSubtitle: {
    fontSize: 16,
    color: '#7A8A8A',
    marginBottom: 40,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    gap: 16,
  },
  optionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  optionGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  optionText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  previewSection: {
    alignItems: 'center',
    width: '100%',
  },
  imagePreviewContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    marginBottom: 24,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  retakeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F59E0B',
  },
  bottomSection: {
    padding: 20,
  },
  nextButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
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
  // Camera Mode Styles
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraTopBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  cameraIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
  },
});

export default PhotoMessageScreen;
