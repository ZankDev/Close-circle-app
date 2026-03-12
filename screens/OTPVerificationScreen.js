import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useFonts, Rubik_400Regular, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { Ionicons } from '@expo/vector-icons';
import { verifyOTP, resendOTP } from '../api/OTPService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';

const OTPVerificationScreen = ({ navigation, route }) => {
  const { phoneNumber, displayNumber } = route.params;
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef([]);

  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_700Bold,
  });

  useEffect(() => {
    // Timer for resend button
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Auto-focus on first input and check clipboard for OTP
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    
    // Check clipboard for OTP code
    checkClipboardForOTP();
  }, []);

  const checkClipboardForOTP = async () => {
    try {
      const clipboardText = await Clipboard.getStringAsync();
      const otpMatch = clipboardText.match(/\b\d{4}\b/);
      
      if (otpMatch) {
        const detectedOtp = otpMatch[0].split('');
        setOtp(detectedOtp);
        
        Alert.alert(
          'קוד זוהה!',
          `זוהה קוד ${otpMatch[0]} בלוח הכותרות. האם לבצע אימות?`,
          [
            {
              text: 'ביטול',
              style: 'cancel'
            },
            {
              text: 'אמת',
              onPress: () => handleVerifyOTP(otpMatch[0])
            }
          ]
        );
      }
    } catch (error) {
      console.log('Clipboard check error:', error);
    }
  };

  const handleOtpChange = (value, index) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits are entered
    if (newOtp.every(digit => digit) && newOtp.join('').length === 4) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyPress = (key, index) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpValue = null) => {
    const enteredOTP = otpValue || otp.join('');

    if (enteredOTP.length !== 4) {
      Alert.alert('שגיאה', 'אנא הכנס קוד בן 4 ספרות');
      return;
    }

    setIsLoading(true);

    try {
      // Verify against local OTP store (code generated on send, validated here)
      const result = await verifyOTP(phoneNumber, enteredOTP);

      if (result.success) {
        const token = 'otp-verified';

        // Check if this user has already completed registration
        const storedData = await AsyncStorage.getItem('userData');
        const storedUser = storedData ? JSON.parse(storedData) : null;
        const isReturningUser = storedUser?.registrationCompleted === true;

        if (isReturningUser) {
          // Returning user — go straight to dashboard
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home', params: { user: storedUser, token } }],
          });
        } else {
          // New user — start registration flow
          const sessionUser = { phoneNumber };
          await AsyncStorage.setItem('userToken', token);
          await AsyncStorage.setItem('userData', JSON.stringify(sessionUser));

          navigation.navigate('PasswordSetup', {
            phoneNumber,
            user: sessionUser,
            token,
            isRecovery: false,
          });
        }
      } else {
        Alert.alert('שגיאה', result.error || 'קוד אימות שגוי, אנא נסה שוב');
        setOtp(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('OTP Verification Error:', error);
      Alert.alert('שגיאה', error.message || 'אירעה שגיאה במערכת', [
        { text: 'נסה שוב', onPress: () => { setOtp(['', '', '', '']); inputRefs.current[0]?.focus(); } },
        { text: 'חזור', style: 'cancel', onPress: () => navigation.goBack() },
      ]);
    }

    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    try {
      const result = await resendOTP(phoneNumber);
      if (result.success) {
        Alert.alert('קוד נשלח מחדש!', 'קוד אימות חדש נשלח למספר הטלפון שלך');
        setResendTimer(30);
        setOtp(['', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        Alert.alert('שגיאה', result.error || 'לא ניתן לשלוח קוד אימות');
      }
    } catch (error) {
      Alert.alert('שגיאה בשליחה מחדש', error.message || 'אירעה שגיאה במערכת');
    }
    setIsLoading(false);
  };

  const formatPhoneDisplay = (phone) => {
    // Use displayNumber if available, otherwise format the phone number
    if (displayNumber) {
      return displayNumber;
    }
    if (phone.startsWith('972')) {
      const localNumber = phone.substring(3);
      return `+972 ${localNumber.substring(0, 3)}-${localNumber.substring(3, 6)}-${localNumber.substring(6)}`;
    }
    return phone;
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <View style={styles.content}>
          {/* Header */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Text style={styles.title}>אימות קוד</Text>
            <Text style={styles.subtitle}>
              קוד אימות נשלח למספר{'\n'}
              {formatPhoneDisplay(phoneNumber)}
            </Text>
{/* message param removed — OTP sent via n8n webhook */}
            
            {/* Development hint - removed test code reference */}
          </View>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => inputRefs.current[index] = ref}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
                textAlign="center"
              />
            ))}
          </View>

          {/* Verify Button */}
          <TouchableOpacity 
            style={[styles.verifyButton, isLoading && styles.disabledButton]}
            onPress={() => handleVerifyOTP()}
            disabled={isLoading}
          >
            <Text style={styles.verifyButtonText}>
              {isLoading ? 'מאמת...' : 'אמת קוד'}
            </Text>
          </TouchableOpacity>

          {/* Paste Button */}
          <TouchableOpacity 
            style={styles.pasteButton}
            onPress={checkClipboardForOTP}
          >
            <Ionicons name="clipboard-outline" size={20} color="#2D8B8B" />
            <Text style={styles.pasteButtonText}>הדבק מהלוח</Text>
          </TouchableOpacity>

          {/* Resend */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>לא קיבלת קוד? </Text>
            <TouchableOpacity 
              onPress={handleResendOTP}
              disabled={resendTimer > 0}
            >
              <Text style={[
                styles.resendLink,
                resendTimer > 0 && styles.resendDisabled
              ]}>
                {resendTimer > 0 ? `שלח מחדש (${resendTimer}s)` : 'שלח מחדש'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Development info */}
          <Text style={styles.demoText}>
            מצב פיתוח: הקוד נשלח באמצעות SMS
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 24,
    color: '#2D5B5B',
    fontFamily: 'Rubik_400Regular',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
    textAlign: 'center',
    lineHeight: 24,
  },
  successMessage: {
    fontSize: 14,
    fontFamily: 'Rubik_500Medium',
    color: '#4ADE80',
    textAlign: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#059F4620',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4ADE8040',
  },
  devHint: {
    fontSize: 12,
    fontFamily: 'Rubik_400Regular',
    color: '#FFA726',
    textAlign: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FF980E20',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFA72640',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 12,
  },
  otpInput: {
    width: 56,
    height: 56,
    backgroundColor: '#E5DED3',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5DED3',
    fontSize: 24,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
  },
  otpInputFilled: {
    borderColor: '#2D8B8B',
    backgroundColor: '#E5DED3',
  },
  verifyButton: {
    backgroundColor: '#2D8B8B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#C5D0D0',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F0E8',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2D8B8B',
  },
  pasteButtonText: {
    color: '#2D8B8B',
    fontSize: 14,
    fontFamily: 'Rubik_400Regular',
    marginRight: 8,
  },
  resendText: {
    color: '#7A8A8A',
    fontSize: 14,
    fontFamily: 'Rubik_400Regular',
  },
  resendLink: {
    color: '#2D8B8B',
    fontSize: 14,
    fontFamily: 'Rubik_400Regular',
  },
  resendDisabled: {
    color: '#C5D0D0',
  },
  demoText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#7A8A8A',
    fontFamily: 'Rubik_400Regular',
    marginTop: 20,
  },
});

export default OTPVerificationScreen;