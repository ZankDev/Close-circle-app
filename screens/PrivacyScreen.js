import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Switch,
  Alert,
  TextInput,
  Modal,
  I18nManager
} from 'react-native';
import { useFonts, Rubik_400Regular, Rubik_500Medium, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PrivacyScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    biometricLogin: true,
    dataBackup: true,
    analyticsSharing: false,
    locationServices: false,
    contactsAccess: true,
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('privacySettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.log('Error loading privacy settings:', error);
    }
  };

  const savePrivacySettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('privacySettings', JSON.stringify(newSettings));
    } catch (error) {
      console.log('Error saving privacy settings:', error);
    }
  };

  const toggleSetting = (key) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key]
    };
    setSettings(newSettings);
    savePrivacySettings(newSettings);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('שגיאה', 'הסיסמאות החדשות אינן תואמות');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('שגיאה', 'הסיסמה החדשה חייבת להיות באורך של לפחות 6 תווים');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert('הצלחה', 'הסיסמה שונתה בהצלחה!');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('שגיאה', 'אירעה שגיאה בשינוי הסיסמה');
    } finally {
      setLoading(false);
    }
  };

  const handleDataExport = () => {
    Alert.alert(
      'ייצוא נתונים',
      'האם ברצונך לייצא את כל הנתונים שלך? זה עלול לקחת מספר דקות.',
      [
        { text: 'ביטול', style: 'cancel' },
        { 
          text: 'ייצא', 
          onPress: () => {
            Alert.alert('בתהליך', 'הנתונים שלך מיוצאים. תקבל הודעה כשהתהליך יסתיים.');
          }
        }
      ]
    );
  };

  const handleAccountDeletion = () => {
    Alert.alert(
      'מחיקת חשבון',
      'פעולה זו תמחק לצמיתות את החשבון ואת כל הנתונים שלך. האם אתה בטוח?',
      [
        { text: 'ביטול', style: 'cancel' },
        { 
          text: 'מחק חשבון', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('אישור מחיקה', 'זוהי פעולה בלתי הפיכה. לחץ "אשר מחיקה" כדי להמשיך.', [
              { text: 'ביטול', style: 'cancel' },
              { text: 'אשר מחיקה', style: 'destructive' }
            ]);
          }
        }
      ]
    );
  };

  const SettingItem = ({ title, description, icon, value, onToggle, iconColor, type = 'switch' }) => (
    <Animatable.View animation="fadeInUp" duration={600}>
      <TouchableOpacity 
        style={styles.settingItem}
        onPress={type === 'button' ? onToggle : undefined}
      >
        <View style={styles.settingContent}>
          <View style={[styles.settingIcon, { backgroundColor: `${iconColor}20` }]}>
            <Ionicons name={icon} size={24} color={iconColor} />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{title}</Text>
            <Text style={styles.settingDescription}>{description}</Text>
          </View>
        </View>
        {type === 'switch' ? (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: '#E5DED3', true: '#2D8B8B' }}
            thumbColor={value ? '#2D5B5B' : '#7A8A8A'}
            ios_backgroundColor="#E5DED3"
          />
        ) : (
          <Ionicons name="chevron-back" size={20} color="#7A8A8A" />
        )}
      </TouchableOpacity>
    </Animatable.View>
  );

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
        <Text style={styles.headerTitle}>פרטיות ואבטחה</Text>
        <View style={styles.placeholder} />
      </Animatable.View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Security Section */}
        <Animatable.View animation="fadeInUp" duration={600} delay={200}>
          <Text style={styles.sectionTitle}>אבטחת חשבון</Text>
          <View style={styles.section}>
            <SettingItem
              title="אימות דו-שלבי"
              description="הוסף שכבת אבטחה נוספת לחשבון שלך"
              icon="shield-checkmark"
              iconColor="#10B981"
              value={settings.twoFactorAuth}
              onToggle={() => toggleSetting('twoFactorAuth')}
            />
            <SettingItem
              title="התחברות ביומטרית"
              description="השתמש בטביעת אצבע או זיהוי פנים"
              icon="finger-print"
              iconColor="#2D8B8B"
              value={settings.biometricLogin}
              onToggle={() => toggleSetting('biometricLogin')}
            />
            <SettingItem
              title="שינוי סיסמה"
              description="עדכן את סיסמת החשבון שלך"
              icon="key"
              iconColor="#F59E0B"
              type="button"
              onToggle={() => setShowPasswordModal(true)}
            />
          </View>
        </Animatable.View>

        {/* Data & Privacy Section */}
        <Animatable.View animation="fadeInUp" duration={600} delay={400}>
          <Text style={styles.sectionTitle}>נתונים ופרטיות</Text>
          <View style={styles.section}>
            <SettingItem
              title="גיבוי אוטומטי"
              description="גבה את הנתונים שלך באופן אוטומטי"
              icon="cloud-upload"
              iconColor="#06B6D4"
              value={settings.dataBackup}
              onToggle={() => toggleSetting('dataBackup')}
            />
            <SettingItem
              title="שיתוף נתוני ניתוח"
              description="עזור לנו לשפר את האפליקציה"
              icon="analytics"
              iconColor="#4AA8A8"
              value={settings.analyticsSharing}
              onToggle={() => toggleSetting('analyticsSharing')}
            />
            <SettingItem
              title="ייצוא נתונים"
              description="הורד עותק של כל הנתונים שלך"
              icon="download"
              iconColor="#EC4899"
              type="button"
              onToggle={handleDataExport}
            />
          </View>
        </Animatable.View>

        {/* Permissions Section */}
        <Animatable.View animation="fadeInUp" duration={600} delay={600}>
          <Text style={styles.sectionTitle}>הרשאות</Text>
          <View style={styles.section}>
            <SettingItem
              title="שירותי מיקום"
              description="אפשר לאפליקציה לגשת למיקום שלך"
              icon="location"
              iconColor="#EF4444"
              value={settings.locationServices}
              onToggle={() => toggleSetting('locationServices')}
            />
            <SettingItem
              title="גישה לאנשי קשר"
              description="אפשר לאפליקציה לגשת לאנשי הקשר שלך"
              icon="people"
              iconColor="#10B981"
              value={settings.contactsAccess}
              onToggle={() => toggleSetting('contactsAccess')}
            />
          </View>
        </Animatable.View>

        {/* Danger Zone */}
        <Animatable.View animation="fadeInUp" duration={600} delay={800}>
          <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>אזור סכנה</Text>
          <View style={styles.section}>
            <SettingItem
              title="מחיקת חשבון"
              description="מחק לצמיתות את החשבון ואת כל הנתונים"
              icon="trash"
              iconColor="#EF4444"
              type="button"
              onToggle={handleAccountDeletion}
            />
          </View>
        </Animatable.View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="slideInUp" duration={500} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>שינוי סיסמה</Text>
              <TouchableOpacity 
                onPress={() => setShowPasswordModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#7A8A8A" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>סיסמה נוכחית</Text>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="הכנס סיסמה נוכחית"
                placeholderTextColor="#6B7280"
                secureTextEntry
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>סיסמה חדשה</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="הכנס סיסמה חדשה"
                placeholderTextColor="#6B7280"
                secureTextEntry
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>אישור סיסמה חדשה</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="הכנס שוב סיסמה חדשה"
                placeholderTextColor="#6B7280"
                secureTextEntry
                textAlign="right"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.cancelButtonText}>ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleChangePassword}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#2D8B8B', '#4AA8A8']}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>
                    {loading ? 'שומר...' : 'שמור סיסמה'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </View>
      </Modal>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    textAlign: 'right',
    marginTop: 30,
    marginBottom: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5DED3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  settingItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5DED3',
  },
  settingContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Rubik_500Medium',
    color: '#2D5B5B',
    textAlign: 'right',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
    textAlign: 'right',
    lineHeight: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#E5DED3',
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
  },
  closeButton: {
    padding: 4,
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
    backgroundColor: '#F5F0E8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
    color: '#2D5B5B',
    borderWidth: 1,
    borderColor: '#E5DED3',
  },
  modalActions: {
    flexDirection: 'row-reverse',
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E5DED3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CFC7BB',
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
    color: '#FFFFFF',
  },
});

export default PrivacyScreen;