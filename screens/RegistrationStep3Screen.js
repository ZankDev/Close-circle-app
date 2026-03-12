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
  Modal,
  FlatList
} from 'react-native';
import { useFonts, Rubik_400Regular, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

// Simple countries data for backup contact
const countries = [
  { name: 'ישראל', flag: '🇮🇱', callingCode: '+972' },
  { name: 'ארצות הברית', flag: '🇺🇸', callingCode: '+1' },
  { name: 'בריטניה', flag: '🇬🇧', callingCode: '+44' },
  { name: 'גרמניה', flag: '🇩🇪', callingCode: '+49' },
  { name: 'צרפת', flag: '🇫🇷', callingCode: '+33' },
  { name: 'איטליה', flag: '🇮🇹', callingCode: '+39' },
  { name: 'קנדה', flag: '🇨🇦', callingCode: '+1' },
  { name: 'אוסטרליה', flag: '🇦🇺', callingCode: '+61' },
];

const RegistrationStep3Screen = ({ navigation, route }) => {
  const { phoneNumber, user, token, firstName, lastName, backupContact } = route.params || {};
  const [backupName, setBackupName] = useState('');
  const [backupPhone, setBackupPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_700Bold,
  });

  const handleContinue = () => {
    // Backup contact is optional - user can skip
    navigation.navigate('WelcomeScreen', {
      ...route.params,
      backupContactName: backupName.trim() || null,
      backupContactPhone: backupPhone.trim() || null,
      backupContactCountry: backupName.trim() ? selectedCountry : null
    });
  };

  const handleSkip = () => {
    // Skip backup contact completely
    navigation.navigate('WelcomeScreen', {
      ...route.params,
      backupContactName: null,
      backupContactPhone: null,
      backupContactCountry: null
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
            <Text style={styles.headerTitle}>איש קשר לגיבוי</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.content}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '100%' }]} />
              </View>
              <Text style={styles.progressText}>שלב 2 מתוך 2</Text>
            </View>

            <Text style={styles.title}>איש קשר לגיבוי 🛡️ (לא חובה)</Text>
            <Text style={styles.subtitle}>
              ניתן להוסיף איש קשר שיוכל לעזור במקרה של בעיה טכנית (ניתן לדלג)
            </Text>

            <View style={styles.warningContainer}>
              <Ionicons name="information-circle" size={24} color="#2D8B8B" />
              <Text style={styles.warningText}>
                איש הקשר לגיבוי יוכל לעזור לך לשחזר מידע במקרה של בעיה טכנית
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>שם מלא</Text>
                <TextInput
                  style={styles.input}
                  value={backupName}
                  onChangeText={setBackupName}
                  placeholder="הכנס שם מלא של איש הקשר"
                  placeholderTextColor="#666"
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>מספר טלפון</Text>
                <View style={styles.phoneContainer}>
                  <TouchableOpacity
                    style={styles.countrySelector}
                    onPress={() => setShowCountryPicker(true)}
                  >
                    <Text style={styles.flagText}>{selectedCountry.flag}</Text>
                    <Text style={styles.countryCodeText}>{selectedCountry.callingCode}</Text>
                    <Ionicons name="chevron-down" size={16} color="#7A8A8A" />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.phoneInput}
                    value={backupPhone}
                    onChangeText={setBackupPhone}
                    placeholder="מספר טלפון"
                    placeholderTextColor="#666"
                    keyboardType="phone-pad"
                    textAlign="right"
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.bottomContainer}>
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>דלג על שלב זה</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>הוסף איש קשר וסיים</Text>
              <Ionicons name="checkmark" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowCountryPicker(false)}
              >
                <Ionicons name="close" size={24} color="#2D5B5B" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>בחר מדינה</Text>
              <View style={styles.placeholder} />
            </View>
            
            <FlatList
              data={countries}
              keyExtractor={(item) => item.callingCode + item.name}
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
    marginBottom: 20,
    lineHeight: 24,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 139, 139, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#2D8B8B',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Rubik_400Regular',
    color: '#2D5B5B',
    textAlign: 'right',
    marginRight: 12,
    lineHeight: 20,
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
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5DED3',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginLeft: 8,
    backgroundColor: '#FFFFFF',
  },
  flagText: {
    fontSize: 20,
    marginRight: 8,
  },
  countryCodeText: {
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
    color: '#2D5B5B',
    marginRight: 4,
  },
  phoneInput: {
    flex: 1,
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
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  skipButtonText: {
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5DED3',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5DED3',
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 15,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
    color: '#2D5B5B',
    textAlign: 'right',
  },
  countryCode: {
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
    marginLeft: 10,
  },
});

export default RegistrationStep3Screen;