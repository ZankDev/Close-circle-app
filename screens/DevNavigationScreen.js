import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const screens = [
  { name: 'Landing', icon: 'infinite-outline', label: 'דף נחיתה' },
  { name: 'Login', icon: 'log-in-outline', label: 'התחברות' },
  { name: 'OTPVerification', icon: 'keypad-outline', label: 'אימות OTP', params: { phoneNumber: '0532231535' } },
  { name: 'PasswordSetup', icon: 'lock-closed-outline', label: 'הגדרת סיסמה', params: { phoneNumber: '0532231535', isNewUser: true } },
  { name: 'ForgotPassword', icon: 'key-outline', label: 'שחזור סיסמה' },
  { name: 'RegistrationStep1', icon: 'person-add-outline', label: 'הרשמה שלב 1' },
  { name: 'RegistrationStep3', icon: 'checkmark-circle-outline', label: 'הרשמה שלב 3' },
  { name: 'WelcomeScreen', icon: 'happy-outline', label: 'ברוכים הבאים' },
  { name: 'Plans', icon: 'pricetags-outline', label: 'תוכניות' },
  { name: 'Dashboard', icon: 'home-outline', label: 'דשבורד', params: { user: { firstName: 'משתמש' }, token: 'demo' } },
  { name: 'Profile', icon: 'person-outline', label: 'פרופיל', params: { user: { firstName: 'משתמש' }, token: 'demo' } },
  { name: 'Notifications', icon: 'notifications-outline', label: 'התראות' },
  { name: 'Privacy', icon: 'shield-outline', label: 'פרטיות' },
  { name: 'Subscription', icon: 'card-outline', label: 'מנוי', params: { user: { firstName: 'משתמש' }, token: 'demo' } },
  { name: 'Help', icon: 'help-circle-outline', label: 'עזרה' },
  { name: 'CreateMessage', icon: 'create-outline', label: 'יצירת מסר', params: { user: { firstName: 'משתמש' }, token: 'demo' } },
  { name: 'FlowerPayment', icon: 'flower-outline', label: 'תשלום פרחים' },
  { name: 'PackageCategories', icon: 'pricetag-outline', label: 'בחירת חבילה', params: { user: { firstName: 'משתמש' }, token: 'demo' } },
  { name: 'PackageOptions', icon: 'options-outline', label: 'אפשרויות חבילה', params: { categoryId: 'flowers', categoryTitle: 'זר פרחים + ברכה', user: { firstName: 'משתמש' }, token: 'demo' } },
  { name: 'Settings', icon: 'settings-outline', label: 'הגדרות', params: { user: { firstName: 'משתמש' }, token: 'demo' } },
  { name: 'VideoSend', icon: 'send-outline', label: 'שליחת סרטון', params: { videoUri: '' } },
];

const DevNavigationScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0E8" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔧 ניווט פיתוח</Text>
        <Text style={styles.headerSubtitle}>לחץ על כפתור לצפייה במסך</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {screens.map((screen, index) => (
          <TouchableOpacity
            key={screen.name}
            style={styles.screenButton}
            onPress={() => navigation.navigate(screen.name, screen.params || {})}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={screen.icon} size={24} color="#2D8B8B" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.screenLabel}>{screen.label}</Text>
              <Text style={styles.screenName}>{screen.name}</Text>
            </View>
            <Ionicons name="chevron-back" size={20} color="#7A8A8A" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5DED3',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D5B5B',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7A8A8A',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  screenButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5DED3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(45, 139, 139, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  textContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  screenLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D5B5B',
    marginBottom: 2,
  },
  screenName: {
    fontSize: 12,
    color: '#7A8A8A',
  },
});

export default DevNavigationScreen;
