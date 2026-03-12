import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions
} from 'react-native';
import { useFonts, Rubik_400Regular, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation, route }) => {
  const { 
    phoneNumber, 
    user, 
    token, 
    firstName, 
    lastName, 
    backupContactName, 
    backupContactPhone, 
    backupContactCountry 
  } = route.params || {};

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_700Bold,
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    saveUserDataLocally();

    // Auto-navigate after 3 seconds
    const timer = setTimeout(() => {
      navigateToPackages();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const saveUserDataLocally = async () => {
    try {
      const userData = {
        ...user,
        firstName,
        lastName,
        backupContactName: backupContactName || null,
        backupContactPhone: backupContactPhone && backupContactCountry ? `${backupContactCountry.callingCode}${backupContactPhone}` : null,
        backupContactCountry: backupContactCountry ? backupContactCountry.name : null,
        registrationCompleted: true
      };
      
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('showTutorial', 'true'); // Flag for dashboard tutorial
      console.log('💾 Saved registration data locally');
    } catch (error) {
      console.error('❌ Failed to save to local storage:', error);
    }
  };

  const navigateToPackages = () => {
    const safeBackupPhone = backupContactPhone && backupContactCountry ? `${backupContactCountry.callingCode}${backupContactPhone}` : null;
    const safeBackupCountry = backupContactCountry ? backupContactCountry.name : null;

    navigation.replace('PackageCategories', {
      phoneNumber,
      user: {
        ...user,
        firstName,
        lastName,
        backupContactName: backupContactName || null,
        backupContactPhone: safeBackupPhone,
        backupContactCountry: safeBackupCountry,
        registrationCompleted: true
      },
      token
    });
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.vContainer,
            {
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.vIconShadow}>
            <Text style={styles.vIcon}>✓</Text>
          </View>
        </Animated.View>

        <Text style={styles.welcomeText}>הי {firstName},</Text>
        <Text style={styles.title}>ההרשמה לסגירת מעגל</Text>
        <Text style={styles.subtitle}>בוצעה בהצלחה!</Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DED9CC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  vContainer: {
    marginBottom: 40,
  },
  vIconShadow: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F7F5EF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C5A059',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 3,
    borderColor: '#D4AF37',
  },
  vIcon: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginTop: -8,
  },
  welcomeText: {
    fontSize: 28,
    fontFamily: 'Rubik_700Bold',
    color: '#3E4F46',
    marginBottom: 12,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Rubik_700Bold',
    color: '#3E4F46',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 22,
    fontFamily: 'Rubik_700Bold',
    color: '#D4AF37',
    marginBottom: 0,
    textAlign: 'center',
  },
});

export default WelcomeScreen;
