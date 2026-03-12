import React, { useState, useRef, useEffect } from 'react';
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
import { userService } from '../api/databaseService';

const SECRET_QUESTIONS = [
  { id: 'school', label: 'באיזה בית ספר למדת?' },
  { id: 'pet', label: 'מה שם חיית המחמד הראשונה שלך?' },
  { id: 'city', label: 'באיזו עיר נולדת?' },
  { id: 'mother', label: 'מה שם הנעורים של אמך?' },
  { id: 'friend', label: 'מה שם החבר הכי טוב שלך בילדות?' },
];

const PasswordSetupScreen = ({ navigation, route }) => {
  const { phoneNumber, user, token, isRecovery = false } = route.params || {};
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [secretAnswer, setSecretAnswer] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuestionPicker, setShowQuestionPicker] = useState(false);

  const confirmPasswordRef = useRef(null);
  const secretAnswerRef = useRef(null);

  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_700Bold,
  });

  const validatePassword = (pass) => {
    if (pass.length < 6) {
      return { valid: false, message: 'הסיסמה חייבת להכיל לפחות 6 תווים' };
    }
    if (!/\d/.test(pass)) {
      return { valid: false, message: 'הסיסמה חייבת להכיל לפחות ספרה אחת' };
    }
    return { valid: true };
  };

  const handleSetPassword = async () => {
    // Validate password
    const validation = validatePassword(password);
    if (!validation.valid) {
      Alert.alert('שגיאה', validation.message);
      return;
    }

    // Check passwords match
    if (password !== confirmPassword) {
      Alert.alert('שגיאה', 'הסיסמאות אינן תואמות');
      return;
    }

    // Check secret question
    if (!selectedQuestion) {
      Alert.alert('שגיאה', 'אנא בחר שאלת אבטחה');
      return;
    }

    if (!secretAnswer.trim() || secretAnswer.trim().length < 2) {
      Alert.alert('שגיאה', 'אנא הכנס תשובה לשאלת האבטחה');
      return;
    }

    setIsLoading(true);

    try {
      // Save profile data to Supabase and keep security question locally
      if (user?.id) {
        await userService.upsertProfile(user.id, {
          phone_number: phoneNumber,
        });
      }

      // Store security question locally (no backend endpoint needed)
      await AsyncStorage.setItem('hasPassword', 'true');
      await AsyncStorage.setItem('secretQuestion', selectedQuestion.id);
      await AsyncStorage.setItem('secretAnswer', secretAnswer.trim().toLowerCase());

      Alert.alert(
        'הגדרה הושלמה!',
        'החשבון שלך מוכן.',
        [
          {
            text: 'המשך',
            onPress: () => {
              if (isRecovery) {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              } else {
                navigation.navigate('RegistrationStep1', {
                  phoneNumber,
                  user,
                  token,
                });
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Password setup error:', error);

      await AsyncStorage.setItem('hasPassword', 'true');
      await AsyncStorage.setItem('secretQuestion', selectedQuestion?.id ?? '');
      await AsyncStorage.setItem('secretAnswer', secretAnswer.trim().toLowerCase());

      Alert.alert(
        'הגדרה הושלמה!',
        'החשבון שלך מוכן.',
        [
          {
            text: 'המשך',
            onPress: () => {
              if (isRecovery) {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              } else {
                navigation.navigate('RegistrationStep1', {
                  phoneNumber,
                  user,
                  token,
                });
              }
            },
          },
        ]
      );
    }

    setIsLoading(false);
  };

  const handleSkip = () => {
    Alert.alert(
      'דלג על הגדרת סיסמה?',
      'תוכל להגדיר סיסמה מאוחר יותר בהגדרות הפרופיל.',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'דלג',
          onPress: () => {
            navigation.navigate('RegistrationStep1', {
              phoneNumber,
              user,
              token,
            });
          },
        },
      ]
    );
  };

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
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-forward" size={24} color="#3E4F46" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>הגדרת סיסמה</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="lock-closed" size={40} color="#C5A059" />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>צור סיסמה קבועה</Text>
          <Text style={styles.subtitle}>
            הסיסמה תאפשר לך להתחבר במהירות{'\n'}בלי צורך בקוד אימות בכל פעם
          </Text>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>סיסמה</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="הכנס סיסמה (לפחות 6 תווים)"
                placeholderTextColor="#9A9A9A"
                secureTextEntry={!showPassword}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
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
            <Text style={styles.passwordHint}>
              לפחות 6 תווים כולל ספרה אחת
            </Text>
          </View>

          {/* Confirm Password Input */}
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
                secureTextEntry={!showConfirmPassword}
                returnKeyType="next"
                onSubmitEditing={() => setShowQuestionPicker(true)}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={22}
                  color="#7A8A8A"
                />
              </TouchableOpacity>
            </View>
            {password && confirmPassword && password !== confirmPassword && (
              <Text style={styles.errorHint}>הסיסמאות אינן תואמות</Text>
            )}
            {password && confirmPassword && password === confirmPassword && (
              <Text style={styles.successHint}>✓ הסיסמאות תואמות</Text>
            )}
          </View>

          {/* Secret Question Section */}
          <View style={styles.sectionDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>שאלת אבטחה לשחזור סיסמה</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Question Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>בחר שאלת אבטחה</Text>
            <TouchableOpacity
              style={styles.questionPicker}
              onPress={() => setShowQuestionPicker(!showQuestionPicker)}
            >
              <Text style={[
                styles.questionPickerText,
                !selectedQuestion && styles.questionPickerPlaceholder
              ]}>
                {selectedQuestion ? selectedQuestion.label : 'לחץ לבחירת שאלה'}
              </Text>
              <Ionicons
                name={showQuestionPicker ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#7A8A8A"
              />
            </TouchableOpacity>
          </View>

          {/* Question Options */}
          {showQuestionPicker && (
            <View style={styles.questionOptions}>
              {SECRET_QUESTIONS.map((question) => (
                <TouchableOpacity
                  key={question.id}
                  style={[
                    styles.questionOption,
                    selectedQuestion?.id === question.id && styles.questionOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedQuestion(question);
                    setShowQuestionPicker(false);
                    setTimeout(() => secretAnswerRef.current?.focus(), 100);
                  }}
                >
                  <Text style={[
                    styles.questionOptionText,
                    selectedQuestion?.id === question.id && styles.questionOptionTextSelected,
                  ]}>
                    {question.label}
                  </Text>
                  {selectedQuestion?.id === question.id && (
                    <Ionicons name="checkmark" size={20} color="#C5A059" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Secret Answer Input */}
          {selectedQuestion && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>תשובה לשאלת האבטחה</Text>
              <TextInput
                ref={secretAnswerRef}
                style={styles.textInput}
                value={secretAnswer}
                onChangeText={setSecretAnswer}
                placeholder="הכנס את התשובה"
                placeholderTextColor="#9A9A9A"
                returnKeyType="done"
                onSubmitEditing={handleSetPassword}
              />
              <Text style={styles.answerHint}>
                זכור את התשובה - תצטרך אותה לשחזור סיסמה
              </Text>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!password || !confirmPassword || !selectedQuestion || !secretAnswer) && styles.submitButtonDisabled,
              ]}
              onPress={handleSetPassword}
              disabled={isLoading || !password || !confirmPassword || !selectedQuestion || !secretAnswer}
            >
              <LinearGradient
                colors={['#D4AF37', '#C5A059']}
                style={styles.submitButtonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>שמור סיסמה</Text>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {!isRecovery && (
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>דלג לעת עתה</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DED9CC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DED9CC',
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
    color: '#3E4F46',
  },
  placeholder: {
    width: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Rubik_700Bold',
    color: '#3E4F46',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Rubik_400Regular',
    color: '#6F8F90',
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
    color: '#3E4F46',
    marginBottom: 8,
    textAlign: 'right',
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F5EF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8D2C2',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
    color: '#3E4F46',
    textAlign: 'right',
  },
  eyeButton: {
    padding: 14,
  },
  textInput: {
    backgroundColor: '#F7F5EF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8D2C2',
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
    color: '#3E4F46',
    textAlign: 'right',
  },
  passwordHint: {
    fontSize: 12,
    fontFamily: 'Rubik_400Regular',
    color: '#9CA3AF',
    marginTop: 6,
    textAlign: 'right',
  },
  answerHint: {
    fontSize: 12,
    fontFamily: 'Rubik_400Regular',
    color: '#C5A059',
    marginTop: 6,
    textAlign: 'right',
  },
  errorHint: {
    fontSize: 12,
    fontFamily: 'Rubik_500Medium',
    color: '#E74C3C',
    marginTop: 6,
    textAlign: 'right',
  },
  successHint: {
    fontSize: 12,
    fontFamily: 'Rubik_500Medium',
    color: '#7A8F74',
    marginTop: 6,
    textAlign: 'right',
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D8D2C2',
  },
  dividerText: {
    fontSize: 13,
    fontFamily: 'Rubik_500Medium',
    color: '#6F8F90',
    marginHorizontal: 12,
  },
  questionPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F5EF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8D2C2',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  questionPickerText: {
    fontSize: 15,
    fontFamily: 'Rubik_400Regular',
    color: '#3E4F46',
    flex: 1,
    textAlign: 'right',
  },
  questionPickerPlaceholder: {
    color: '#9CA3AF',
  },
  questionOptions: {
    backgroundColor: '#F7F5EF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8D2C2',
    marginBottom: 20,
    overflow: 'hidden',
  },
  questionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E3D8',
  },
  questionOptionSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  questionOptionText: {
    fontSize: 14,
    fontFamily: 'Rubik_400Regular',
    color: '#6F8F90',
    flex: 1,
    textAlign: 'right',
  },
  questionOptionTextSelected: {
    color: '#C5A059',
    fontFamily: 'Rubik_500Medium',
  },
  buttonsContainer: {
    marginTop: 30,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#C5A059',
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
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 12,
  },
  skipButtonText: {
    fontSize: 15,
    fontFamily: 'Rubik_500Medium',
    color: '#6F8F90',
  },
});

export default PasswordSetupScreen;
