import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList
} from 'react-native';
import { useFonts, Rubik_400Regular, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { Ionicons, AntDesign, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendOTP, formatPhoneNumber } from '../api/OTPService';

// Simple countries data
const countries = [
  { code: 'IL', name: 'Israel', flag: '🇮🇱', callingCode: '+972' },
  { code: 'US', name: 'United States', flag: '🇺🇸', callingCode: '+1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', callingCode: '+44' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', callingCode: '+49' },
  { code: 'FR', name: 'France', flag: '🇫🇷', callingCode: '+33' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', callingCode: '+39' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', callingCode: '+34' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', callingCode: '+1' },
  { code: 'CA', name: 'Canada', flag: '��', callingCode: '+1' },
];

// Web-compatible font helper
const getWebFont = (weight = '400') => {
  if (Platform.OS === 'web') {
    return {
      fontFamily: '"Rubik", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: weight,
    };
  }
  
  switch (weight) {
    case '700':
      return { fontFamily: 'Rubik_700Bold' };
    default:
      return { fontFamily: 'Rubik_400Regular' };
  }
};

const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default to Israel
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_700Bold,
  });

  // Web-compatible font loading
  const [webFontsLoaded, setWebFontsLoaded] = useState(Platform.OS === 'web' ? false : true);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Load web fonts
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      
      // Set a timeout to assume fonts are loaded
      setTimeout(() => {
        setWebFontsLoaded(true);
      }, 1000);
    }
  }, []);

  const handleSendOTP = async () => {
    if (phoneNumber.trim() === '') {
      Alert.alert('שגיאה', 'אנא הכנס מספר טלפון');
      return;
    }

    // Normalise to E.164 format
    const e164 = formatPhoneNumber(phoneNumber.trim(), selectedCountry.callingCode);
    const displayNumber = `${selectedCountry.callingCode} ${phoneNumber.trim()}`;

    setIsLoading(true);

    try {
      const result = await sendOTP(e164);

      if (result.success) {
        navigation.navigate('OTPVerification', {
          phoneNumber: e164,
          displayNumber,
        });
      } else {
        Alert.alert('שגיאה', result.error || 'לא ניתן לשלוח קוד אימות');
      }
    } catch (error) {
      Alert.alert('שגיאה', 'אירעה שגיאה במערכת');
      console.error('OTP send error:', error);
    }

    setIsLoading(false);
  };

  if (!fontsLoaded || !webFontsLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#ffffff', fontSize: 18 }}>טוען...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <View style={styles.loginContainer}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.welcomeTitle}>ברוכים הבאים</Text>
            <Text style={styles.subtitle}>רגע קטן משמעות לחיים שלמים</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>

            {/* Phone Input with Country Selector */}
            <View style={styles.phoneInputContainer}>
              <TouchableOpacity 
                style={styles.countrySelector}
                onPress={() => setShowCountryPicker(true)}
              >
                <Text style={styles.flagText}>{selectedCountry.flag}</Text>
                <Text style={styles.callingCodeText}>{selectedCountry.callingCode}</Text>
                <Ionicons name="chevron-down" size={16} color="#9CA3AF" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
              <TextInput
                style={styles.phoneInput}
                placeholder="0532231535"
                placeholderTextColor="#9CA3AF"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={12}
              />
            </View>

            {/* Country Picker Modal */}
            <Modal
              visible={showCountryPicker}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setShowCountryPicker(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>בחר מדינה</Text>
                    <TouchableOpacity 
                      onPress={() => setShowCountryPicker(false)}
                      style={styles.closeButton}
                    >
                      <Ionicons name="close" size={24} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={countries}
                    keyExtractor={(item) => item.code}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.countryItem}
                        onPress={() => {
                          setSelectedCountry(item);
                          setShowCountryPicker(false);
                        }}
                      >
                        <Text style={styles.countryFlag}>{item.flag}</Text>
                        <Text style={styles.countryName}>{item.name}</Text>
                        <Text style={styles.countryCode}>{item.callingCode}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            </Modal>

            <TouchableOpacity 
              style={[styles.continueButton, isLoading && styles.disabledButton]} 
              onPress={handleSendOTP}
              disabled={isLoading}
            >
              <Ionicons name="call-outline" size={20} color="#ffffff" style={styles.buttonIcon} />
              <Text style={styles.continueButtonText}>
                {isLoading ? 'שולח...' : 'המשך עם מספר טלפון'}
              </Text>
            </TouchableOpacity>

            {/* Alternative Login Methods */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>או</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
              <AntDesign name="google" size={20} color="#DB4437" style={styles.buttonIcon} />
              <Text style={styles.socialButtonText}>המשך עם Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.socialButton, styles.appleButton]}>
            <Ionicons name="logo-apple" size={20} color="#000000" style={styles.buttonIcon} />
              <Text style={styles.socialButtonText}>המשך עם Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.socialButton, styles.facebookButton]}>
              <FontAwesome name="facebook" size={20} color="#ffffff" style={styles.buttonIcon} />
              <Text style={[styles.socialButtonText, styles.lightButtonText]}>המשך עם Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.socialButton, styles.twitterButton]}>
              <AntDesign name="twitter" size={20} color="#ffffff" style={styles.buttonIcon} />
              <Text style={[styles.socialButtonText, styles.lightButtonText]}>המשך עם Twitter</Text>
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>כבר יש לך חשבון? </Text>
              <TouchableOpacity>
                <Text style={styles.signInLink}>התחבר</Text>
              </TouchableOpacity>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Ionicons name="key-outline" size={16} color="#D4AF37" />
              <Text style={styles.forgotPasswordText}>שחזור סיסמה</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  keyboardContainer: {
    flex: 1,
  },
  loginContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  welcomeTitle: {
    fontSize: 32,
    fontFamily: 'Rubik',
    fontWeight: '900',
    color: '#2D5B5B',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Rubik_400Regular',
    color: '#2D5B5B',
    textAlign: 'center',
    opacity: 0.8,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  getStartedTitle: {
    fontSize: 18,
    fontFamily: 'Rubik_400Regular',
    color: '#2D5B5B',
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.9,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    paddingHorizontal: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5DED3',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#E5DED3',
    marginRight: 12,
    paddingVertical: 16,
  },
  flagText: {
    fontSize: 20,
    marginRight: 8,
  },
  callingCodeText: {
    fontSize: 16,
    color: '#2D5B5B',
    fontFamily: 'Rubik_400Regular',
    marginRight: 4,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
    color: '#2D5B5B',
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxHeight: '70%',
    paddingVertical: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE3',
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
    color: '#2D5B5B',
  },
  countryCode: {
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
  },
  continueButton: {
    backgroundColor: '#2D8B8B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#D8D0C4',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5DED3',
  },
  dividerText: {
    color: '#7A8A8A',
    fontSize: 14,
    fontFamily: 'Rubik_400Regular',
    marginHorizontal: 16,
    opacity: 0.7,
  },
  socialButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5DED3',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appleButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  facebookButton: {
    backgroundColor: '#1877F2',
    borderColor: '#1877F2',
  },
  twitterButton: {
    backgroundColor: '#1DA1F2',
    borderColor: '#1DA1F2',
  },
  socialButtonText: {
    color: '#2D5B5B',
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
  },
  lightButtonText: {
    color: '#FFFFFF',
  },
  buttonIcon: {
    marginRight: 8,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  signInText: {
    color: '#7A8A8A',
    fontSize: 14,
    fontFamily: 'Rubik_400Regular',
    opacity: 0.7,
  },
  signInLink: {
    paddingLeft: 4,
    color: '#2D8B8B',
    fontSize: 14,
    fontFamily: 'Rubik_400Regular',
  },
  forgotPasswordContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  forgotPasswordText: {
    color: '#D4AF37',
    fontSize: 14,
    fontFamily: 'Rubik_400Regular',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;