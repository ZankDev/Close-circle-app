import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  TextInput,
  Image,
  I18nManager
} from 'react-native';
import { useFonts, Rubik_400Regular, Rubik_500Medium, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavBar from '../components/BottomNavBar';
import { userService } from '../api/databaseService';
import { getCurrentUserId } from '../utils/supabase';

const ProfileScreen = ({ navigation, route }) => {
  const { user, token } = route.params || {};
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_700Bold,
  });

  // Enable RTL layout
  useEffect(() => {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const userId = await getCurrentUserId();
      const profileData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phoneNumber.trim(),
        email: email.trim() || null,
      };

      if (userId) {
        await userService.upsertProfile(userId, profileData);
      }

      // Also persist to AsyncStorage for offline access
      const updatedUser = { ...user, firstName, lastName, phoneNumber, email };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));

      setIsEditing(false);
      Alert.alert('הצלחה', 'הפרופיל עודכן בהצלחה!');
    } catch (error) {
      console.error('Profile save error:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה בעדכון הפרופיל');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setPhoneNumber(user?.phoneNumber || '');
    setEmail(user?.email || '');
    setIsEditing(false);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient
      colors={['#F5F0E8', '#FFFFFF', '#F5F0E8']}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0E8" />
      
      {/* Header */}
      <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-forward" size={24} color="#2D5B5B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>פרופיל אישי</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Ionicons 
            name={isEditing ? "close" : "create-outline"} 
            size={24} 
            color="#2D8B8B" 
          />
        </TouchableOpacity>
      </Animatable.View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Avatar Section */}
        <Animatable.View animation="fadeInUp" duration={600} delay={200} style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#2D8B8B', '#4AA8A8']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {firstName?.charAt(0) || phoneNumber?.slice(-2) || 'מ'}
              </Text>
            </LinearGradient>
            {isEditing && (
              <TouchableOpacity style={styles.changeAvatarButton}>
                <Ionicons name="camera" size={20} color="#2D8B8B" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.userName}>{firstName} {lastName}</Text>
          <Text style={styles.userPhone}>{phoneNumber}</Text>
        </Animatable.View>

        {/* Form Section */}
        <Animatable.View animation="fadeInUp" duration={600} delay={400} style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>שם פרטי</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="הכנס שם פרטי"
              placeholderTextColor="#6B7280"
              editable={isEditing}
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>שם משפחה</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="הכנס שם משפחה"
              placeholderTextColor="#6B7280"
              editable={isEditing}
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>מספר טלפון</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="הכנס מספר טלפון"
              placeholderTextColor="#6B7280"
              keyboardType="phone-pad"
              editable={isEditing}
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>כתובת אימייל</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={email}
              onChangeText={setEmail}
              placeholder="הכנס כתובת אימייל"
              placeholderTextColor="#6B7280"
              keyboardType="email-address"
              editable={isEditing}
              textAlign="right"
            />
          </View>
        </Animatable.View>

        {/* Action Buttons */}
        {isEditing && (
          <Animatable.View animation="fadeInUp" duration={600} delay={600} style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>ביטול</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
              disabled={loading}
            >
              <LinearGradient
                colors={['#2D8B8B', '#4AA8A8']}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'שומר...' : 'שמור שינויים'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
        )}

        {/* Account Stats */}
        <Animatable.View animation="fadeInUp" duration={600} delay={800} style={styles.statsSection}>
          <Text style={styles.statsTitle}>סטטיסטיקות חשבון</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="mail" size={24} color="#2D8B8B" />
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>מסרים נשלחו</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="folder" size={24} color="#4AA8A8" />
              <Text style={styles.statNumber}>4</Text>
              <Text style={styles.statLabel}>תיקיות</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="calendar" size={24} color="#EC4899" />
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>מסרים מתוזמנים</Text>
            </View>
          </View>
        </Animatable.View>
      </ScrollView>
      <BottomNavBar navigation={navigation} activeTab="profile" user={user} token={token} phoneNumber={user?.phoneNumber} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5DED3',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#E5DED3',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    textAlign: 'center',
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2D8B8B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarText: {
    fontSize: 36,
    fontFamily: 'Rubik_700Bold',
    color: '#ffffff',
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#2D8B8B',
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    textAlign: 'center',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
    textAlign: 'center',
  },
  formSection: {
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Rubik_500Medium',
    color: '#2D5B5B',
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
    color: '#2D5B5B',
    borderWidth: 1,
    borderColor: '#E5DED3',
    writingDirection: 'rtl',
  },
  inputDisabled: {
    backgroundColor: '#F0EBE3',
    color: '#7A8A8A',
  },
  actionButtons: {
    flexDirection: 'row-reverse',
    gap: 12,
    marginTop: 30,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E5DED3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D5CEC3',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Rubik_500Medium',
    color: '#2D5B5B',
  },
  saveButton: {
    flex: 1,
  },
  saveButtonGradient: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Rubik_700Bold',
    color: '#ffffff',
  },
  statsSection: {
    marginTop: 40,
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    textAlign: 'right',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5DED3',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
    textAlign: 'center',
  },
});

export default ProfileScreen;