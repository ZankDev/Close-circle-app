import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useFonts, Rubik_400Regular, Rubik_500Medium, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import InfinityLogoSimple from '../components/InfinityLogo';

const { width, height } = Dimensions.get('window');

const LandingScreen = ({ navigation }) => {
  // Animation values
  const welcomeFade = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(30)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const screenFade = useRef(new Animated.Value(1)).current;

  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_700Bold,
  });

  useEffect(() => {
    // Entrance animation sequence
    Animated.sequence([
      // First show logo
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Then show text
      Animated.parallel([
        Animated.timing(welcomeFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(titleSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Finally show button
      Animated.timing(buttonFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    // Start spin animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      })
    ).start();

    // Fade out and navigate after delay
    setTimeout(() => {
      Animated.timing(screenFade, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        // Navigate to Login after animation
        navigation.replace('Login');
      });
    }, 1500);
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: screenFade }]}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F0E8" />
        <LinearGradient
          colors={['#F5F0E8', '#FFFFFF', '#F5F0E8']}
          style={styles.gradient}
        >
          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Logo at top - small */}
            <Animated.View
              style={[
                styles.logoTopContainer,
                {
                  opacity: logoOpacity,
                  transform: [{ scale: logoScale }],
                },
              ]}
            >
              <InfinityLogoSimple size={30} />
            </Animated.View>

            {/* Welcome Text */}
            <Animated.View
              style={[
                styles.textContainer,
                {
                  opacity: welcomeFade,
                  transform: [{ translateY: titleSlide }],
                },
              ]}
            >
              <Text style={styles.welcomeTitle}>ברוכים הבאים</Text>
              <Text style={styles.welcomeTitleSecond}>לסגירת מעגל</Text>
              
              <Text style={styles.welcomeSubtitle}>
                שליחת ברכות ומסרים עתידיים
              </Text>

              <View style={styles.decorativeLine} />

              {/* Center Logo - bigger */}
              <Animated.View
                style={[
                  styles.centerLogoContainer,
                  {
                    transform: [{ rotate: spin }],
                  },
                ]}
              >
                <InfinityLogoSimple size={55} />
              </Animated.View>

              <Text style={styles.welcomeDescription}>
                שמרו מסרים אישיים לאהוביכם{'\n'}
                שיגיעו אליהם בדיוק בזמן הנכון
              </Text>
            </Animated.View>

            {/* Continue Button */}
            <Animated.View style={[styles.buttonContainer, { opacity: buttonFade }]}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinue}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#D4AF37', '#C49A2C']}
                  style={styles.continueButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.continueButtonText}>המשך</Text>
                  <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>הצטרפו לאלפים ששומרים מסרים לעתיד</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F0E8',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoTopContainer: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 40,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    textAlign: 'center',
  },
  welcomeTitleSecond: {
    fontSize: 40,
    fontFamily: 'Rubik_700Bold',
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeSubtitle: {
    fontSize: 18,
    fontFamily: 'Rubik_500Medium',
    color: '#7A8A8A',
    textAlign: 'center',
    marginBottom: 24,
  },
  decorativeLine: {
    width: 100,
    height: 3,
    backgroundColor: '#D4AF37',
    borderRadius: 2,
    marginBottom: 30,
  },
  centerLogoContainer: {
    marginBottom: 30,
  },
  welcomeDescription: {
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
    color: '#5A6A6A',
    textAlign: 'center',
    lineHeight: 28,
  },
  buttonContainer: {
    marginTop: 50,
    width: '100%',
    alignItems: 'center',
  },
  continueButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  continueButtonGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 60,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 20,
    fontFamily: 'Rubik_700Bold',
    color: '#FFFFFF',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    fontFamily: 'Rubik_400Regular',
    color: '#9A9A9A',
  },
});

export default LandingScreen;
