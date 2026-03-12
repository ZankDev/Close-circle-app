import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useFonts, Rubik_400Regular, Rubik_500Medium, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendOTP, formatPhoneNumber } from '../api/OTPService';

const SECRET_QUESTIONS = [
  { id: 'school', label: 'באיזה בית ספר למדת?' },
  { id: 'pet', label: 'מה שם חיית המחמד הראשונה שלך?' },
  { id: 'city', label: 'באיזו עיר נולדת?' },
  { id: 'mother', label: 'מה שם הנעורים של אמך?' },
  { id: 'friend', label: 'מה שם החבר הכי טוב שלך בילדות?' },
];

const ForgotPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState(1); // 1: phone, 2: secret question, 3: new password
  const [phoneNumber, setPhoneNumber] = useState('');
  const [secretQuestion, setSecretQuestion] = useState(null);
  const [secretAnswer, setSecretAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  
  const answerRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_700Bold,
  });

  const handleVerifyPhone = async () => {
    if (!phoneNumber || phoneNumber.trim().length < 9) {
      Alert.alert('שגיאה', 'אנא הכנס מספר טלפון תקין');
      return;
    }

    setIsLoading(true);

    try {
      const e164 = formatPhoneNumber(phoneNumber.trim(), '+972');
      const result = await sendOTP(e164);

      if (result.success) {
        navigation.navigate('OTPVerification', {
          phoneNumber: e164,
          displayNumber: phoneNumber.trim(),
        });
      } else {
        Alert.alert('שגיאה', result.error || 'לא ניתן לשלוח קוד אימות');
      }
    } catch (error) {
      console.error('Forgot password OTP error:', error);
      Alert.alert('שגיאה', 'אירעה שגיאה במערכת');
    }

    setIsLoading(false);
  };

  // Legacy step handlers — no longer used with Supabase OTP flow
  const handleVerifyAnswer = () => setStep(3);
  const handleResetPassword = () => navigation.replace('Login');
  const handleSendOTP = () => handleVerifyPhone();

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D8B8B" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (step > 1) {
                  setStep(step - 1);
                } else {
                  navigation.goBack();
                }
              }}
            >
              <Ionicons name="chevron-forward" size={24} color="#2D5B5B" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>שחזור סיסמה</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {[1, 2, 3].map((num) => (
              <View
                key={num}
                style={[
                  styles.progressDot,
                  step >= num && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons
                name={step === 1 ? 'phone-portrait' : step === 2 ? 'help-circle' : 'key'}
                size={40}
                color="#2D8B8B"
              />
            </View>
          </View>

          {/* Step 1: Enter Phone */}
          {step === 1 && (
            <>
              <Text style={styles.title}>הזן מספר טלפון</Text>
              <Text style={styles.subtitle}>
                נאתר את החשבון שלך ונציג את שאלת האבטחה
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>מספר טלפון</Text>
                <View style={styles.phoneInputWrapper}>
                  <TextInput
                    style={styles.phoneInput}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="05XXXXXXXX"
                    placeholderTextColor="#9A9A9A"
                    keyboardType="phone-pad"
                    maxLength={10}
                    returnKeyType="done"
                    onSubmitEditing={handleVerifyPhone}
                  />
                  <View style={styles.countryCode}>
                    <Text style={styles.countryCodeText}>🇮🇱 +972</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, !phoneNumber && styles.submitButtonDisabled]}
                onPress={handleVerifyPhone}
                disabled={isLoading || !phoneNumber}
              >
                <LinearGradient
                  colors={['#2D8B8B', '#1F6D6D']}
                  style={styles.submitButtonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>המשך</Text>
                      <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          {/* Step 2: Answer Secret Question */}
          {step === 2 && (
            <>
              <Text style={styles.title}>שאלת אבטחה</Text>
              <Text style={styles.subtitle}>
                ענה על שאלת האבטחה שהגדרת
              </Text>

              <View style={styles.questionBox}>
                <Ionicons name="help-circle" size={24} color="#D4AF37" />
                <Text style={styles.questionText}>{secretQuestion?.label}</Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>התשובה שלך</Text>
                <TextInput
                  ref={answerRef}
                  style={styles.textInput}
                  value={secretAnswer}
                  onChangeText={setSecretAnswer}
                  placeholder="הכנס את התשובה"
                  placeholderTextColor="#9A9A9A"
                  returnKeyType="done"
                  onSubmitEditing={handleVerifyAnswer}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, !secretAnswer && styles.submitButtonDisabled]}
                onPress={handleVerifyAnswer}
                disabled={isLoading || !secretAnswer}
              >
                <LinearGradient
                  colors={['#2D8B8B', '#1F6D6D']}
                  style={styles.submitButtonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>אמת תשובה</Text>
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.alternativeButton} onPress={handleSendOTP}>
                <Text style={styles.alternativeButtonText}>
                  לא זוכר? קבל קוד אימות בSMS
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Step 3: Set New Password */}
          {step === 3 && (
            <>
              <Text style={styles.title}>הגדר סיסמה חדשה</Text>
              <Text style={styles.subtitle}>
                בחר סיסמה חדשה לחשבונך
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>סיסמה חדשה</Text>
                <View style={styles.passwordInputWrapper}>
                  <TextInput
                    ref={newPasswordRef}
                    style={styles.passwordInput}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="הכנס סיסמה חדשה"
                    placeholderTextColor="#9A9A9A"
                    secureTextEntry={!showPassword}
                    returnKeyType="next"
                    onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                    autoFocus
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={22}
                      color="#7A8A8A"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>אימות סיסמה</Text>
                <View style={styles.passwordInputWrapper}>
                  <TextInput
                    ref={confirmPasswordRef}
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="הכנס את הסיסמה שוב"
                    placeholderTextColor="#9A9A9A"
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleResetPassword}
                  />
                </View>
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <Text style={styles.errorHint}>הסיסמאות אינן תואמות</Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!newPassword || !confirmPassword) && styles.submitButtonDisabled,
                ]}
                onPress={handleResetPassword}
                disabled={isLoading || !newPassword || !confirmPassword}
              >
                <LinearGradient
                  colors={['#D4AF37', '#C49A2C']}
                  style={styles.submitButtonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>שמור סיסמה חדשה</Text>
                      <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          {/* Back to Login */}
          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => navigation.replace('Login')}
          >
            <Text style={styles.backToLoginText}>חזור להתחברות</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F0E8',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 20,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5DED3',
  },
  progressDotActive: {
    backgroundColor: '#2D8B8B',
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(45, 139, 139, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Rubik_500Medium',
    color: '#2D5B5B',
    marginBottom: 8,
    textAlign: 'right',
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5DED3',
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
    color: '#2D5B5B',
    textAlign: 'right',
  },
  countryCode: {
    paddingHorizontal: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#E5DED3',
  },
  countryCodeText: {
    fontSize: 15,
    fontFamily: 'Rubik_500Medium',
    color: '#2D5B5B',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5DED3',
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
    color: '#2D5B5B',
    textAlign: 'right',
  },
  questionBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Rubik_500Medium',
    color: '#2D5B5B',
    textAlign: 'right',
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5DED3',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
    color: '#2D5B5B',
    textAlign: 'right',
  },
  eyeButton: {
    padding: 14,
  },
  errorHint: {
    fontSize: 12,
    fontFamily: 'Rubik_500Medium',
    color: '#E74C3C',
    marginTop: 6,
    textAlign: 'right',
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#2D8B8B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 18,
    fontFamily: 'Rubik_700Bold',
    color: '#FFFFFF',
  },
  alternativeButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 16,
  },
  alternativeButtonText: {
    fontSize: 14,
    fontFamily: 'Rubik_500Medium',
    color: '#2D8B8B',
    textDecorationLine: 'underline',
  },
  backToLogin: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 20,
  },
  backToLoginText: {
    fontSize: 15,
    fontFamily: 'Rubik_500Medium',
    color: '#7A8A8A',
  },
});

export default ForgotPasswordScreen;
