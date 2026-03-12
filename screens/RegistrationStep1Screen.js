import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Modal
} from 'react-native';
import { useFonts, Rubik_400Regular, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { Ionicons } from '@expo/vector-icons';

const RegistrationStep1Screen = ({ navigation, route }) => {
  const { phoneNumber, user, token } = route.params || {};
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [backupContact, setBackupContact] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showHelperInfoModal, setShowHelperInfoModal] = useState(false);

  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_700Bold,
  });

  const handleContinue = () => {
    if (!firstName.trim()) {
      Alert.alert('שגיאה', 'אנא הכנס שם פרטי');
      return;
    }

    if (!lastName.trim()) {
      Alert.alert('שגיאה', 'אנא הכנס שם משפחה');
      return;
    }

    if (!agreeToTerms) {
      Alert.alert('שגיאה', 'חובה לקרוא ולאשר את התקנון, התנאים ומדיניות הפרטיות');
      return;
    }

    if (!email.trim()) {
      Alert.alert('שגיאה', 'אנא הכנס כתובת אימייל');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('שגיאה', 'אנא הכנס כתובת אימייל תקינה');
      return;
    }

    // Skip age step: navigate directly to step 3 (backup contact)
    navigation.navigate('RegistrationStep3', {
      ...route.params,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      // pass backup contact along, but it's optional
      backupContact: backupContact.trim() || null
    });
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-forward" size={24} color="#2D5B5B" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>פרטים אישיים</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.content}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '50%' }]} />
              </View>
              <Text style={styles.progressText}>שלב 1 מתוך 2</Text>
            </View>

            <Text style={styles.title}>הרשמה לשירות</Text>
            <Text style={styles.subtitle}>מלא את הפרטים הנדרשים להשלמת ההרשמה</Text>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>שם פרטי *</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="הכנס שם פרטי"
                  placeholderTextColor="#666"
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>שם משפחה *</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="הכנס שם משפחה"
                  placeholderTextColor="#666"
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>כתובת אימייל *</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="הכנס כתובת אימייל"
                  placeholderTextColor="#666"
                  textAlign="right"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelWithInfo}>
                  <TouchableOpacity 
                    style={styles.infoButton}
                    onPress={() => setShowHelperInfoModal(true)}
                  >
                    <Ionicons name="information-circle-outline" size={20} color="#2D8B8B" />
                  </TouchableOpacity>
                  <Text style={styles.label}>סייען מטעמי לעזרה (לא חובה)</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={backupContact}
                  onChangeText={setBackupContact}
                  placeholder="שם מלא של סייען"
                  placeholderTextColor="#666"
                  textAlign="right"
                />
              </View>

              <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={() => setShowTermsModal(true)}
              >
                <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
                  {agreeToTerms && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <View style={styles.checkboxTextContainer}>
                  <Text style={styles.checkboxText}>
                    קראתי ואני מאשר את{' '}
                    <Text style={styles.linkText}>התקנון, התנאים ומדיניות הפרטיות</Text>
                    {' '}(חובה לקרוא עד הסוף)
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomContainer}>
            <TouchableOpacity 
              style={[styles.continueButton, (!firstName.trim() || !lastName.trim() || !email.trim() || !agreeToTerms) && styles.continueButtonDisabled]}
              onPress={handleContinue}
              disabled={!firstName.trim() || !lastName.trim() || !email.trim() || !agreeToTerms}
            >
              <Text style={styles.continueButtonText}>המשך</Text>
              <Ionicons name="chevron-back" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Terms and Conditions Modal */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowTermsModal(false);
                setHasScrolledToEnd(false);
              }}
            >
              <Ionicons name="close" size={24} color="#2D5B5B" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>תקנון, תנאי השירות ומדיניות פרטיות</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView
            style={styles.termsScrollView}
            onScroll={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
              const isScrolledToEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
              if (isScrolledToEnd && !hasScrolledToEnd) {
                setHasScrolledToEnd(true);
              }
            }}
            scrollEventThrottle={400}
          >
            <View style={styles.termsContent}>
              <Text style={styles.termsTitle}>תקנון שירות "סגירות מעגל" ומדיניות פרטיות</Text>
              
              <Text style={styles.termsSection}>1. הגדרות</Text>
              <Text style={styles.termsText}>
                "השירות" - אפליקציית "סגירות מעגל" המאפשרת שליחת הודעות מתוזמנות.{'\n'}
                "המשתמש" - כל אדם הרשום לשירות ומשתמש בו.{'\n'}
                "החברה" - מפעילי השירות.
              </Text>

              <Text style={styles.termsSection}>2. תיאור השירות</Text>
              <Text style={styles.termsText}>
                השירות מאפשר למשתמשים ליצור ולתזמן שליחת הודעות (טקסט, קול, וידאו ותמונות) לאנשי קשר שנבחרו מראש. השירות פועל באמצעות מערכת תזמון אוטומטית.
              </Text>

              <Text style={styles.termsSection}>3. תנאי השימוש</Text>
              <Text style={styles.termsText}>
                א. המשתמש מתחייב להשתמש בשירות בהתאם לחוק ולא לפגוע בזכויות אחרים.{'\n'}
                ב. אסור לשלוח תכנים פוגעניים, מעליבים או בלתי חוקיים.{'\n'}
                ג. המשתמש אחראי לנכונות הפרטים שהזין במערכת.{'\n'}
                ד. החברה שומרת לעצמה את הזכות להפסיק את השירות למשתמש בכל עת.
              </Text>

              <Text style={styles.termsSection}>4. פרטיות ואבטחת מידע</Text>
              <Text style={styles.termsText}>
                החברה מתחייבת לשמור על פרטיות המשתמשים ולא למסור מידע אישי לצדדים שלישיים ללא הסכמה מפורשת, למעט במקרים הנדרשים על פי חוק.
              </Text>

              <Text style={styles.termsSection}>5. מחירים ותשלומים</Text>
              <Text style={styles.termsText}>
                השירות מוצע במספר תוכניות מנוי. המחירים עלולים להשתנות בהודעה מוקדמת של 30 יום. התשלום מתבצע מראש לתקופת המנוי.
              </Text>

              <Text style={styles.termsSection}>6. ביטול ואחריות</Text>
              <Text style={styles.termsText}>
                החברה לא תישא באחריות לנזקים הנובעים משימוש בשירות או מאי-זמינותו. השירות ניתן "כמות שהוא" ללא אחריות מכל סוג.
              </Text>

              <Text style={styles.termsSection}>7. שינויים בתקנון</Text>
              <Text style={styles.termsText}>
                החברה רשאית לשנות את התקנון בכל עת. שינויים יכנסו לתוקף לאחר פרסום באפליקציה והודעה למשתמשים.
              </Text>

              <Text style={styles.termsSection}>8. סמכות שיפוט</Text>
              <Text style={styles.termsText}>
                סכסוכים יידונו בבתי המשפט בישראל בלבד, על פי החוק הישראלי.
              </Text>

              <Text style={styles.termsFooter}>
                תאריך עדכון אחרון: אוקטובר 2025{'\n'}
                באישור התקנון, המשתמש מאשר שקרא, הבין והסכים לכל התנאים המפורטים לעיל.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[
                styles.agreeButton,
                !hasScrolledToEnd && styles.agreeButtonDisabled
              ]}
              onPress={() => {
                if (hasScrolledToEnd) {
                  setAgreeToTerms(true);
                  setShowTermsModal(false);
                } else {
                  Alert.alert('שים לב', 'חובה לקרוא את התקנון במלואו עד הסוף לפני האישור');
                }
              }}
              disabled={!hasScrolledToEnd}
            >
              <Text style={[
                styles.agreeButtonText,
                !hasScrolledToEnd && styles.agreeButtonTextDisabled
              ]}>
                {hasScrolledToEnd ? 'אני מאשר את התקנון' : 'קרא עד הסוף לאישור'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Helper Info Modal */}
      <Modal
        visible={showHelperInfoModal}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.helperModalOverlay}>
          <View style={styles.helperModalContainer}>
            <View style={styles.helperModalHeader}>
              <TouchableOpacity
                style={styles.helperCloseButton}
                onPress={() => setShowHelperInfoModal(false)}
              >
                <Ionicons name="close-circle" size={28} color="#7A8A8A" />
              </TouchableOpacity>
              <Text style={styles.helperModalTitle}>מידע על סייען מטעמי</Text>
            </View>

            <View style={styles.helperModalContent}>
              <View style={styles.helperInfoSection}>
                <Ionicons name="shield-checkmark" size={40} color="#2D8B8B" style={styles.helperIcon} />
                <Text style={styles.helperInfoText}>
                  סייען הינו אדם מטעמך שאתה נותן לו הרשאה מלאה לחשבון לכלל התפעול באפליקציה ושליחת המסרים, מיועד לאנשים שמצבם הרפואי אינו מאפשר את תפעול האפליקציה לבד.
                </Text>
              </View>

              <View style={styles.helperDivider} />

              <View style={styles.helperInfoSection}>
                <Ionicons name="time" size={40} color="#D4AF37" style={styles.helperIcon} />
                <Text style={styles.helperInfoText}>
                  בהמשך תמיד תוכל לבחור בסייען לתזמון מסר ספציפי, הסייען יוכל להזין או לשנות רק את תאריך תזמון המסר, לא תהיה לו שום גישה לתכנים שהוזנו גם לא לצפיה (מכתב, סרטון וכו')
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5DED3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5DED3',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2D8B8B',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
    textAlign: 'center',
    marginBottom: 40,
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5DED3',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
    color: '#2D5B5B',
    backgroundColor: '#FFFFFF',
  },
  helpText: {
    fontSize: 12,
    fontFamily: 'Rubik_400Regular',
    color: '#666',
    textAlign: 'right',
    marginTop: 5,
    lineHeight: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#E5DED3',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#2D8B8B',
    borderColor: '#2D8B8B',
  },
  checkboxTextContainer: {
    flex: 1,
  },
  checkboxText: {
    fontSize: 14,
    fontFamily: 'Rubik_400Regular',
    color: '#2D5B5B',
    textAlign: 'right',
    lineHeight: 20,
  },
  linkText: {
    color: '#2D8B8B',
    fontFamily: 'Rubik_700Bold',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  continueButton: {
    backgroundColor: '#2D8B8B',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2D8B8B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#E5DED3',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Rubik_700Bold',
    marginRight: 8,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5DED3',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5DED3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
  },
  termsScrollView: {
    flex: 1,
  },
  termsContent: {
    padding: 20,
  },
  termsTitle: {
    fontSize: 24,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    textAlign: 'center',
    marginBottom: 30,
  },
  termsSection: {
    fontSize: 18,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    marginTop: 25,
    marginBottom: 10,
    textAlign: 'right',
  },
  termsText: {
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
    lineHeight: 24,
    textAlign: 'right',
    marginBottom: 15,
  },
  termsFooter: {
    fontSize: 14,
    fontFamily: 'Rubik_700Bold',
    color: '#2D8B8B',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(45, 139, 139, 0.1)',
    borderRadius: 10,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5DED3',
    backgroundColor: '#F5F0E8',
  },
  agreeButton: {
    backgroundColor: '#2D8B8B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agreeButtonDisabled: {
    backgroundColor: '#E5DED3',
  },
  agreeButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Rubik_700Bold',
  },
  agreeButtonTextDisabled: {
    color: '#666',
  },
  // Helper Info Modal Styles
  helperModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  helperModalContainer: {
    backgroundColor: '#F5F0E8',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  helperModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5DED3',
  },
  helperCloseButton: {
    padding: 5,
  },
  helperModalTitle: {
    fontSize: 20,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    flex: 1,
    textAlign: 'center',
    marginLeft: 33,
  },
  helperModalContent: {
    padding: 20,
  },
  helperInfoSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  helperIcon: {
    marginBottom: 15,
  },
  helperInfoText: {
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
    color: '#2D5B5B',
    lineHeight: 24,
    textAlign: 'center',
  },
  helperDivider: {
    height: 1,
    backgroundColor: '#E5DED3',
    marginVertical: 20,
  },
  labelWithInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  infoButton: {
    marginLeft: 8,
  },
});

export default RegistrationStep1Screen;